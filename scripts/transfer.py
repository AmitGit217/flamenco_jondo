import requests
import os
import psycopg2
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re
import boto3

# Database connection details
DB_PARAMS = {
    "dbname": "flamenco_jondo_db",
    "user": "flamenco_jondo_user",
    "password": "flamenco_jondo_password",
    "host": "localhost",
    "port": "5432"
}

# MinIO details
MINIO_ENDPOINT = "http://localhost:9000"
MINIO_ACCESS_KEY = "minio_user"
MINIO_SECRET_KEY = "minio_password"
MINIO_BUCKET_NAME = "flamenco-recordings"

s3_client = boto3.client(
    "s3",
    endpoint_url=MINIO_ENDPOINT,
    aws_access_key_id=MINIO_ACCESS_KEY,
    aws_secret_access_key=MINIO_SECRET_KEY,
)
LOCAL_AUDIO_FOLDER = "audio_files"
os.makedirs(LOCAL_AUDIO_FOLDER, exist_ok=True)

FLAMENCO_KEYS_MAP = {
    "I": "A", "II": "Bb", "III": "B", "IV": "C", "V": "D", "VI": "E", "VII": "F"
}


def fetch_page(url):
    """Fetch HTML content from the given URL"""
    response = requests.get(url)
    return BeautifulSoup(response.content, "html.parser")


def extract_estilos(soup):
    """Extract multiple estilos and associate them with the correct palo (h2)"""
    estilos = []
    seen_estilos = set()
    current_palo = "Unknown"

    for tag in soup.find_all(["h2", "h3"]):
        if tag.name == "h2":
            current_palo = tag.text.strip()
        elif tag.name == "h3":
            estilo_name = tag.text.strip()
            if estilo_name in seen_estilos:
                continue
            seen_estilos.add(estilo_name)

            paragraphs = [p.text.strip() for p in tag.find_all_next("p")]

            structure, flamenco_key = None, None
            for para in paragraphs:
                match = re.search(
                    r"Verse/accompaniment:\s*(.+?)\s*/\s*(.+)", para)
                if match:
                    structure = match.group(1).strip()
                    flamenco_key = convert_to_keys(match.group(2).strip())
                    break

            estilos.append({
                "name": estilo_name,
                "structure": structure or "Unknown",
                "flamenco_key": flamenco_key or "A",
                "palo": current_palo,
                "description": "\n\n".join(paragraphs),
                "soup": soup
            })

    return estilos


def convert_to_keys(grados):
    """Convert flamenco grados (I, II, III) into actual keys"""
    keys = [FLAMENCO_KEYS_MAP.get(g.strip(), "A") for g in grados.split("-")]
    return keys[0] if keys else "A"


def get_or_create_artist(cur, artist_name):
    """Insert an artist if not exists, return artist_id"""
    cur.execute("SELECT id FROM artist WHERE name = %s", (artist_name,))
    artist = cur.fetchone()
    if artist:
        return artist[0]

    cur.execute(
        "INSERT INTO artist (name, type, user_create_id) VALUES (%s, 'CANTE', 1) RETURNING id",
        (artist_name,)
    )
    return cur.fetchone()[0]


def extract_letras(soup, estilo_name):
    """Extract unique lyrics, artists, and comments"""
    letras = []
    seen_entries = set()
    paragraphs = [p.text.strip() for p in soup.find_all("p")]

    for i, para in enumerate(paragraphs):
        match = re.match(r"^(.+?)\s\((\d{4})\)\.\s*(.+)", para)
        if match:
            artist_name = match.group(1).strip()
            year = match.group(2).strip()
            comment = match.group(3).strip()
            unique_name = f"{artist_name} - {estilo_name} ({year})"

            if unique_name in seen_entries:
                continue  # Skip duplicates
            seen_entries.add(unique_name)

            # Collect verses until the next artist entry
            verses = []
            for j in range(i + 1, len(paragraphs)):
                if re.match(r"^(.+?)\s\(\d{4}\)", paragraphs[j]):
                    break  # Stop at the next artist
                verses.append(paragraphs[j])

            letras.append({
                "artist_name": artist_name,
                "year": year,
                "comment": comment,
                "verses": verses,
                "unique_name": unique_name
            })

    return letras


def extract_audio_links(soup, base_url):
    """Find and return audio file URLs from the page with the correct year"""
    audio_urls = {}

    for link in soup.find_all("a", href=True):
        if link["href"].endswith(".mp3"):
            artist_name = link.text.strip()

            # Find the closest year in the text
            year = "Unknown"
            parent_text = link.find_parent().text  # Get surrounding text
            match = re.search(rf"{artist_name}\s\((\d{4})\)", parent_text)
            if match:
                year = match.group(1)
            else:
                # Look in the previous paragraph if not found
                prev_paragraph = link.find_previous("p")
                if prev_paragraph:
                    match = re.search(r"\((\d{4})\)", prev_paragraph.text)
                    if match:
                        year = match.group(1)

            # Find the closest preceding h3 (which represents the estilo name)
            estilo_tag = link.find_previous("h3")
            estilo_name = estilo_tag.text.strip() if estilo_tag else "Unknown Estilo"

            # Construct the correct key
            unique_audio_key = f"{artist_name} - {estilo_name} ({year})"
            audio_urls[unique_audio_key] = urljoin(base_url, link["href"])

    return audio_urls


def download_audio(audio_urls):
    """Download and store audio files locally with correct naming"""
    local_files = {}
    for unique_audio_key, url in audio_urls.items():
        # Create filename based on our naming logic
        # Remove invalid characters
        safe_filename = re.sub(r'[<>:"/\\|?*]', '', unique_audio_key)
        filename = f"{safe_filename}.mp3"
        local_path = os.path.join(LOCAL_AUDIO_FOLDER, filename)

        response = requests.get(url, stream=True)
        with open(local_path, "wb") as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)

        local_files[unique_audio_key] = (filename, local_path)

    return local_files


def upload_to_minio(local_files):
    """Uploads MP3 files to MinIO and returns correct URLs"""
    minio_links = {}

    existing_buckets = [b["Name"] for b in s3_client.list_buckets()["Buckets"]]
    if MINIO_BUCKET_NAME not in existing_buckets:
        s3_client.create_bucket(Bucket=MINIO_BUCKET_NAME)

    for artist, (filename, local_path) in local_files.items():
        object_name = filename

        s3_client.upload_file(local_path, MINIO_BUCKET_NAME, object_name)

        minio_links[artist] = f"{MINIO_ENDPOINT}/{MINIO_BUCKET_NAME}/{object_name}"

    return minio_links


def insert_into_db(estilos, audio_links):
    """Insert scraped content into the database"""
    conn = psycopg2.connect(**DB_PARAMS)
    cur = conn.cursor()

    for estilo_info in estilos:
        # Insert Palo (if not exists)
        cur.execute("SELECT id FROM palo WHERE name = %s",
                    (estilo_info["palo"],))
        palo = cur.fetchone()
        if not palo:
            cur.execute(
                "INSERT INTO palo (name, origin, origin_date, user_create_id) VALUES (%s, %s, NOW(), 1) RETURNING id",
                (estilo_info["palo"], "Spain")
            )
            palo_id = cur.fetchone()[0]
        else:
            palo_id = palo[0]

        # Insert Estilo
        cur.execute(
            "INSERT INTO estilo (name, tonality, key, structure, origin, origin_date, user_create_id) VALUES (%s, %s, %s, %s, %s, NOW(), 1) RETURNING id",
            (estilo_info["name"], "FRIGIO", estilo_info["flamenco_key"],
             estilo_info["structure"], "Spain")
        )
        estilo_id = cur.fetchone()[0]

        # Link Palo to Estilo
        cur.execute(
            "INSERT INTO palo_estilo (palo_id, name, estilo_id, user_create_id) VALUES (%s, %s, %s, 1) ON CONFLICT DO NOTHING",
            (palo_id, estilo_info["name"] +
             " - " + estilo_info["palo"], estilo_id)
        )

        letras = extract_letras(estilo_info["soup"], estilo_info["name"])

        for letra in letras:
            artist_id = get_or_create_artist(cur, letra["artist_name"])

            cur.execute(
                "INSERT INTO letra (estilo_id, name, verses, comment, user_create_id) VALUES (%s, %s, %s, %s, 1) RETURNING id",
                (estilo_id, letra["unique_name"],
                 letra["verses"], letra["comment"])
            )
            letra_id = cur.fetchone()[0]

            unique_audio_key = f"{letra['artist_name']} - {estilo_info['name']} ({letra['year']})"
            if unique_audio_key in audio_links:
                cur.execute(
                    "INSERT INTO letra_artist (letra_id, artist_id, recording_url, name, user_create_id) VALUES (%s, %s, %s, %s, 1)",
                    (letra_id, artist_id,
                     audio_links[unique_audio_key], unique_audio_key)
                )

    conn.commit()
    cur.close()
    conn.close()


def main():
    url = "https://www.canteytoque.es/soleares.htm"

    soup = fetch_page(url)
    estilos = extract_estilos(soup)
    audio_urls = extract_audio_links(soup, url)

    if audio_urls:
        local_files = download_audio(audio_urls)
        minio_links = upload_to_minio(local_files)
    else:
        minio_links = {}

    insert_into_db(estilos, minio_links)
    print("✅ Data scraping and insertion complete!")


if __name__ == "__main__":
    main()
