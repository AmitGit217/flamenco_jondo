import requests
import os
import psycopg2
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re

# Database connection details
DB_PARAMS = {
    "dbname": "flamenco_jondo_db",
    "user": "flamenco_jondo_user",
    "password": "flamenco_jondo_password",
    "host": "localhost",
    "port": "5432"
}

# MinIO details
MINIO_URL = "http://localhost:9000/flamenco-recordings/"
LOCAL_AUDIO_FOLDER = "audio_files"
os.makedirs(LOCAL_AUDIO_FOLDER, exist_ok=True)

FLAMENCO_KEYS_MAP = {
    "I": "A", "II": "B", "III": "C", "IV": "D", "V": "E", "VI": "F", "VII": "G"
}


def fetch_page(url):
    """Fetch HTML content from the given URL"""
    response = requests.get(url)
    return BeautifulSoup(response.content, "html.parser")


def extract_texts(soup):
    """Extract text data from the page, including structure and key from 'Verse/accompaniment'"""
    titles = [h2.text.strip() for h2 in soup.find_all("h2")]
    paragraphs = [p.text.strip() for p in soup.find_all("p")]

    # Extract verses (specific divs with class "verse")
    verses = [verse.text.strip()
              for verse in soup.find_all("p", class_="verse")]

    # Extract "Verse/accompaniment" info
    structure, flamenco_keys = parse_structure_and_keys(paragraphs)

    return {
        "title": titles[0] if titles else "Unknown",
        "description": "\n\n".join(paragraphs),
        "verses": verses,
        "structure": structure,
        "flamenco_keys": flamenco_keys
    }


def parse_structure_and_keys(paragraphs):
    """Extracts the verse structure and flamenco keys from the text"""
    structure, flamenco_keys = "Unknown", "A"

    for para in paragraphs:
        match = re.search(r"Verse/accompaniment:\s*(.+?)\s*/\s*(.+)", para)
        if match:
            structure = match.group(1).strip()
            flamenco_keys = convert_to_keys(match.group(2).strip())
            break

    return structure, flamenco_keys


def convert_to_keys(grados):
    """Convert flamenco grados (I, II, III) into actual keys"""
    keys = [FLAMENCO_KEYS_MAP.get(g.strip(), "A") for g in grados.split("-")]
    return keys[0] if keys else "A"  # Default to A if unknown


def extract_audio_links(soup, base_url):
    """Find and return audio file URLs from the page"""
    audio_urls = []
    for link in soup.find_all("a", href=True):
        if link["href"].endswith(".mp3"):
            audio_urls.append(urljoin(base_url, link["href"]))

    return audio_urls


def download_audio(audio_urls):
    """Download and store audio files locally"""
    local_files = []
    for url in audio_urls:
        filename = os.path.basename(urlparse(url).path)
        local_path = os.path.join(LOCAL_AUDIO_FOLDER, filename)

        response = requests.get(url, stream=True)
        with open(local_path, "wb") as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)

        local_files.append((filename, local_path))

    return local_files


def upload_to_minio(local_files):
    """Simulates uploading to MinIO (S3) and returning the new URLs"""
    minio_links = []
    for filename, local_path in local_files:
        # In actual setup, upload the file to MinIO using `mc` or MinIO SDK
        minio_links.append(MINIO_URL + filename)

    return minio_links


def insert_into_db(title, description, verses, structure, flamenco_key, audio_urls):
    """Insert the scraped content into the database"""
    conn = psycopg2.connect(**DB_PARAMS)
    cur = conn.cursor()

    # Insert Palo
    cur.execute("INSERT INTO palo (name, origin, origin_date, user_create_id) VALUES (%s, %s, NOW(), 1) RETURNING id",
                (title, "Spain"))
    palo_id = cur.fetchone()[0]

    # Insert Estilo
    cur.execute("INSERT INTO estilo (name, tonality, key, origin, origin_date, user_create_id) VALUES (%s, %s, %s, %s, NOW(), 1) RETURNING id",
                (title, "FRIGIO", flamenco_key, "Spain"))
    estilo_id = cur.fetchone()[0]

    # Insert Letra with extracted structure
    cur.execute("INSERT INTO letra (estilo_id, name, verses, rhyme_scheme, repetition_pattern, structure, user_create_id) VALUES (%s, %s, %s, %s, %s, %s, 1) RETURNING id",
                (estilo_id, title, verses, [1, 2, 1, 2], [1, 1, 2], structure))
    letra_id = cur.fetchone()[0]

    # Insert Audio if available
    for i, audio_url in enumerate(audio_urls):
        letra_artist_name = f"{title}_recording_{i+1}"
        cur.execute("INSERT INTO letra_artist (letra_id, artist_id, recording_url, name, user_create_id) VALUES (%s, %s, %s, %s, 1)",
                    (letra_id, 1, audio_url, letra_artist_name))

    conn.commit()
    cur.close()
    conn.close()


def main():
    url = "https://www.canteytoque.es/soleares.htm"

    print("Fetching page content...")
    soup = fetch_page(url)

    print("Extracting text data...")
    text_data = extract_texts(soup)

    print("Searching for audio files...")
    audio_urls = extract_audio_links(soup, url)

    if audio_urls:
        print(f"Downloading {len(audio_urls)} audio files...")
        local_files = download_audio(audio_urls)

        print("Uploading to MinIO...")
        minio_links = upload_to_minio(local_files)
    else:
        minio_links = []

    print("Inserting into the database...")
    insert_into_db(
        text_data["title"], text_data["description"], text_data["verses"],
        text_data["structure"], text_data["flamenco_keys"], minio_links
    )

    print("✅ Data scraping and insertion complete!")


if __name__ == "__main__":
    main()
