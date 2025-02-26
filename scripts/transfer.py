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

PALOS_NAME = "Soleá"

FLAMENCO_KEYS_MAP = {
    "I": "A", "II": "Bb", "III": "B", "IV": "C", "V": "D", "VI": "E", "VII": "F"
}


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

            # Normalized naming: palo-origin-estilo-artist-year.mp3
            normalized_name = f"{PALOS_NAME}-Spain-{estilo_name}-{artist_name}-{year}".replace(
                " ", "_").lower()
            audio_urls[normalized_name] = urljoin(base_url, link["href"])

    return audio_urls


def extract_estilos(soup):
    """Extract multiple estilos and associate them with the correct palo (h2)"""
    estilos = []
    seen_estilos = set()

    for tag in soup.find_all("h3"):
        estilo_name = tag.text.strip()
        if estilo_name in seen_estilos:
            continue
        seen_estilos.add(estilo_name)

        paragraphs = [p.text.strip() for p in tag.find_all_next("p")]

        structure, flamenco_key = None, None
        for para in paragraphs:
            match = re.search(r"Verse/accompaniment:\s*(.+?)\s*/\s*(.+)", para)
            if match:
                structure = match.group(1).strip()
                flamenco_key = convert_to_keys(match.group(2).strip())
                break

        estilos.append({
            "name": estilo_name,
            "structure": structure or "Unknown",
            "flamenco_key": flamenco_key or "A",
            "palo": PALOS_NAME,
            "description": "\n\n".join(paragraphs),
            "soup": soup
        })

    return estilos


def convert_to_keys(grados):
    """Convert flamenco grados (I, II, III) into actual keys"""
    keys = [FLAMENCO_KEYS_MAP.get(g.strip(), "A") for g in grados.split("-")]
    return keys[0] if keys else "A"


def extract_letras(soup, estilo_name, audio_links):
    """Extract letras only if they have a matching recording"""
    letras = []
    seen_entries = set()
    paragraphs = soup.find_all("p")

    current_artist, current_year, current_comment, current_verses = None, None, None, []

    for para in paragraphs:
        text = para.text.strip()
        match = re.match(r"^(.+?)\s\((\d{4})\)\.\s*(.+)", text)
        if match:
            if current_artist and current_verses:
                normalized_name = f"{PALOS_NAME}-Spain-{estilo_name}-{current_artist}-{current_year}".replace(
                    " ", "_").lower()
                if normalized_name in audio_links and normalized_name not in seen_entries:
                    letras.append({
                        "artist_name": current_artist,
                        "year": current_year,
                        "comment": current_comment,
                        "verses": current_verses,
                        "unique_name": normalized_name,
                        "recording_url": audio_links[normalized_name]
                    })
                    seen_entries.add(normalized_name)

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

    cur.execute("SELECT id FROM palo WHERE name = %s", (PALOS_NAME,))
    palo = cur.fetchone()
    if not palo:
        cur.execute(
            "INSERT INTO palo (name, origin, origin_date, user_create_id) VALUES (%s, 'Spain', NOW(), 1) RETURNING id",
            (PALOS_NAME,)
        )
        palo_id = cur.fetchone()[0]
    else:
        palo_id = palo[0]

    for estilo_info in estilos:
        letras = extract_letras(
            estilo_info["soup"], estilo_info["name"], audio_links)

        if not letras:
            continue

        cur.execute(
            "INSERT INTO estilo (name, structure, origin, user_create_id, created_at) VALUES (%s, %s, %s, 1, NOW()) RETURNING id",
            (estilo_info["name"], estilo_info["structure"], "Spain")
        )
        estilo_id = cur.fetchone()[0]

        for letra in letras:
            cur.execute("SELECT id FROM artist WHERE name = %s",
                        (letra["artist_name"],))
            artist = cur.fetchone()
            if not artist:
                cur.execute(
                    "INSERT INTO artist (name, type, user_create_id, created_at) VALUES (%s, 'CANTE', 1, NOW()) RETURNING id",
                    (letra["artist_name"],)
                )
                artist_id = cur.fetchone()[0]
            else:
                artist_id = artist[0]

            cur.execute(
                "INSERT INTO letra (estilo_id, name, verses, comment, user_create_id, created_at) VALUES (%s, %s, %s, %s, 1, NOW()) RETURNING id",
                (estilo_id, letra["unique_name"],
                 letra["verses"], letra["comment"])
            )
            letra_id = cur.fetchone()[0]

            cur.execute(
                "INSERT INTO letra_artist (letra_id, artist_id, recording_url, name, user_create_id, created_at) VALUES (%s, %s, %s, %s, 1, NOW())",
                (letra_id, artist_id,
                 letra["recording_url"], letra["unique_name"])
            )

    conn.commit()
    cur.close()
    conn.close()


def main():
    url = "https://www.canteytoque.es/soleares.htm"

    soup = fetch_page(url)
    audio_urls = extract_audio_links(soup, url)
    estilos = extract_estilos(soup)

    insert_into_db(estilos, audio_urls)
    print("✅ Data scraping and insertion complete!")


if __name__ == "__main__":
    main()
