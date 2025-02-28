import requests
import os
import psycopg2
from bs4 import BeautifulSoup
from urllib.parse import urljoin
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


def fetch_page(url):
    """Fetch HTML content from the given URL"""
    response = requests.get(url)
    return BeautifulSoup(response.content, "html.parser")


def extract_audio_links(soup, base_url):
    """Extract all MP3 audio file links"""
    audio_urls = {}

    for link in soup.find_all("a", href=True):
        if link["href"].endswith(".mp3"):
            artist_name = link.text.strip()
            year = "Unknown"

            prev_text = link.find_previous("p")
            if prev_text:
                match = re.search(r"\((\d{4})\)", prev_text.text)
                if match:
                    year = match.group(1)

            estilo_tag = link.find_previous("h3")
            estilo_name = estilo_tag.text.strip() if estilo_tag else "Unknown Estilo"

            # Normalized naming: solea-estilo-artist-year.mp3
            normalized_name = f"solea-{estilo_name}-{artist_name}-{year}".replace(
                " ", "_").lower()
            audio_urls[normalized_name] = urljoin(base_url, link["href"])

    return audio_urls


def download_audio(audio_urls):
    """Download and store audio files locally"""
    local_files = {}
    for normalized_name, url in audio_urls.items():
        filename = f"{normalized_name}.mp3"
        local_path = os.path.join(LOCAL_AUDIO_FOLDER, filename)

        if not os.path.exists(local_path):  # Avoid re-downloading
            print(f"⬇️ Downloading {filename} ...")
            response = requests.get(url, stream=True)
            with open(local_path, "wb") as file:
                for chunk in response.iter_content(chunk_size=8192):
                    file.write(chunk)

        local_files[normalized_name] = (filename, local_path)

    return local_files


def upload_to_minio(local_files):
    """Uploads MP3 files to MinIO and returns correct URLs"""
    minio_links = {}

    try:
        s3_client.head_bucket(Bucket=MINIO_BUCKET_NAME)
    except:
        s3_client.create_bucket(Bucket=MINIO_BUCKET_NAME)

    for normalized_name, (filename, local_path) in local_files.items():
        object_name = filename

        # Upload the file to MinIO
        s3_client.upload_file(local_path, MINIO_BUCKET_NAME, object_name)
        minio_links[normalized_name] = f"{MINIO_ENDPOINT}/{MINIO_BUCKET_NAME}/{object_name}"
        print(f"✅ Uploaded {filename} to MinIO")

    return minio_links


def extract_estilos(soup):
    """Extract multiple estilos and associate them with the correct palo (Soleá)"""
    estilos = []
    seen_estilos = set()
    current_origin = "Spain"  # Default origin

    for tag in soup.find_all(["h2", "h3"]):
        if tag.name == "h2":
            current_origin = tag.text.strip()  # Use as origin
        elif tag.name == "h3":
            estilo_name = tag.text.strip()
            if estilo_name in seen_estilos:
                continue
            seen_estilos.add(estilo_name)

            paragraphs = [p.text.strip() for p in tag.find_all_next("p")]

            structure = "Unknown"
            for para in paragraphs:
                match = re.search(
                    r"Verse/accompaniment:\s*(.+?)\s*/\s*(.+)", para)
                if match:
                    structure = match.group(1).strip()
                    break

            estilos.append({
                "name": estilo_name,
                "structure": structure,
                "origin": current_origin,
                "description": "\n\n".join(paragraphs),
                "soup": soup
            })

    return estilos


def get_or_create_artist(cur, artist_name):
    """Insert an artist if not exists, return artist_id"""
    cur.execute("SELECT id FROM artist WHERE name = %s", (artist_name,))
    artist = cur.fetchone()
    if artist:
        return artist[0]

    cur.execute(
        "INSERT INTO artist (name, type, user_create_id, created_at) VALUES (%s, 'CANTE', 1, NOW()) RETURNING id",
        (artist_name,)
    )
    return cur.fetchone()[0]


def extract_letras(soup, estilo_name, audio_links):
    """Extract letras **only if audio exists**"""
    letras = []
    seen_entries = set()
    paragraphs = soup.find_all("p")

    current_artist = None
    current_year = None
    current_comment = None
    current_verses = []

    for para in paragraphs:
        text = para.text.strip()

        match = re.match(r"^(.+?)\s\((\d{4})\)\.\s*(.+)", text)
        if match:
            if current_artist and current_verses:
                unique_name = f"solea-{estilo_name}-{current_artist}-{current_year}".replace(
                    " ", "_").lower()
                if unique_name in audio_links and unique_name not in seen_entries:
                    letras.append({
                        "artist_name": current_artist,
                        "year": current_year,
                        "comment": current_comment,
                        "verses": current_verses,
                        "unique_name": unique_name
                    })
                    seen_entries.add(unique_name)

            current_artist = match.group(1).strip()
            current_year = match.group(2).strip()
            current_comment = match.group(3).strip()
            current_verses = []

        else:
            if current_artist:
                current_verses.append(text)

    return letras


def insert_into_db(estilos, audio_links):
    """Insert scraped content into the database"""
    conn = psycopg2.connect(**DB_PARAMS)
    cur = conn.cursor()

    # Ensure there is only **one** palo (Soleá)
    cur.execute("SELECT id FROM palo WHERE name = 'Soleá'")
    palo = cur.fetchone()
    if not palo:
        cur.execute(
            "INSERT INTO palo (name, origin, origin_date, user_create_id, created_at) VALUES ('Soleá', 'Spain', NOW(), 1, NOW()) RETURNING id"
        )
        palo_id = cur.fetchone()[0]
    else:
        palo_id = palo[0]

    for estilo_info in estilos:
        cur.execute("SELECT id FROM estilo WHERE name = %s",
                    (estilo_info["name"],))
        estilo = cur.fetchone()
        if not estilo:
            cur.execute(
                "INSERT INTO estilo (name, structure, origin, user_create_id, created_at) VALUES (%s, %s, %s, 1, NOW()) RETURNING id",
                (estilo_info["name"], estilo_info["structure"],
                 estilo_info["origin"])
            )
            estilo_id = cur.fetchone()[0]
        else:
            estilo_id = estilo[0]

        cur.execute(
            "INSERT INTO palo_estilo (palo_id, estilo_id, name, user_create_id, created_at) VALUES (%s, %s, %s, 1, NOW()) ON CONFLICT DO NOTHING",
            (palo_id, estilo_id, f"Soleá-{estilo_info['name']}")
        )

        letras = extract_letras(
            estilo_info["soup"], estilo_info["name"], audio_links)

        for letra in letras:
            cur.execute(
                "INSERT INTO letra (estilo_id, name, verses, comment, user_create_id, created_at) VALUES (%s, %s, %s, %s, 1, NOW()) RETURNING id",
                (estilo_id, letra["unique_name"],
                 letra["verses"], letra["comment"])
            )
            letra_id = cur.fetchone()[0]

            artist_id = get_or_create_artist(cur, letra["artist_name"])

            if letra["unique_name"] in audio_links:
                cur.execute(
                    "INSERT INTO letra_artist (letra_id, artist_id, recording_url, name, user_create_id, created_at) VALUES (%s, %s, %s, %s, 1, NOW())",
                    (letra_id, artist_id,
                     audio_links[letra["unique_name"]], letra["unique_name"])
                )

    conn.commit()
    cur.close()
    conn.close()


def main():
    url = "https://www.canteytoque.es/soleares.htm"

    # Step 1: Fetch HTML content
    soup = fetch_page(url)

    # Step 2: Extract audio links from the webpage
    audio_urls = extract_audio_links(soup, url)

    # Step 3: Download audio files locally
    local_files = download_audio(audio_urls)

    # Step 4: Upload audio files to MinIO
    minio_links = upload_to_minio(local_files)

    # Step 5: Extract estilos
    estilos = extract_estilos(soup)

    # Step 6: Insert everything into the database using MinIO links
    insert_into_db(estilos, minio_links)

    print("✅ Data scraping and insertion complete!")


if __name__ == "__main__":
    main()
