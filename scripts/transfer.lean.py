import requests
import os
import json
import re
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# Configuration
SOURCE_URL = "https://www.canteytoque.es/soleares.htm"  # Change to your source URL
JSON_OUTPUT_PATH = "../client/src/data/gameData.json"
os.makedirs(os.path.dirname(JSON_OUTPUT_PATH), exist_ok=True)


def fetch_page(url):
    """Fetch HTML content from the given URL"""
    print(f"Fetching data from {url}...")
    response = requests.get(url)
    return BeautifulSoup(response.content, "html.parser")


def extract_game_data(soup, base_url):
    """Extract all data needed for the game"""
    game_data = {
        "palo": {
            "id": 1,
            "name": "Soleá",
            "description": "One of the most fundamental flamenco forms",
            "origin": "Spain"
        },
        "estilos": []
    }

    # Track seen estilos to avoid duplicates
    seen_estilos = set()
    estilo_id = 1
    current_origin = "Cádiz"  # Default origin

    # Extract estilo information and audio links
    for tag in soup.find_all(["h2", "h3", "a"]):
        if tag.name == "h2":
            # Update current origin based on section headers
            current_origin = tag.text.strip()
        elif tag.name == "h3":
            # Found an estilo name
            estilo_name = tag.text.strip()
            if estilo_name not in seen_estilos:
                seen_estilos.add(estilo_name)
                game_data["estilos"].append({
                    "id": estilo_id,
                    "name": estilo_name,
                    "origin": current_origin,
                    "letras": []
                })
                estilo_id += 1
        elif tag.name == "a" and tag.get('href', '').endswith('.mp3'):
            # Found an audio link
            audio_url = urljoin(base_url, tag.get('href'))
            artist_name = tag.text.strip()

            # Find the estilo this belongs to by getting the nearest h3 tag before this link
            estilo_tag = tag.find_previous("h3")
            if estilo_tag:
                estilo_name = estilo_tag.text.strip()
                # Find the estilo in our data structure
                for estilo in game_data["estilos"]:
                    if estilo["name"] == estilo_name:
                        # Get the letra content from the next paragraph or nearby text
                        content = "Letra example"  # Default placeholder
                        para = tag.find_next("p")
                        if para and not para.find("a"):
                            content = para.text.strip()

                        # Add letra with direct audio URL
                        estilo["letras"].append({
                            "id": len(estilo["letras"]) + 1,
                            "content": content,
                            "artist": artist_name,
                            "recording": audio_url
                        })
                        break

    return game_data


def generate_game_rounds(game_data):
    """Generate game rounds from the data"""
    all_estilos = game_data["estilos"]

    # Only keep estilos with recordings
    viable_estilos = [
        estilo for estilo in all_estilos
        if any(letra.get("recording") for letra in estilo["letras"])
    ]

    game_data["gameRounds"] = []

    # For each estilo with recordings, create game rounds
    for estilo in viable_estilos:
        for letra in estilo["letras"]:
            if letra.get("recording"):
                # Create options (1 correct + 3 wrong)
                correct_option = {
                    "id": estilo["id"],
                    "name": estilo["name"]
                }

                # Get 3 random wrong options
                wrong_options = []
                for other_estilo in all_estilos:
                    if other_estilo["id"] != estilo["id"]:
                        wrong_options.append({
                            "id": other_estilo["id"],
                            "name": other_estilo["name"]
                        })
                        if len(wrong_options) >= 3:
                            break

                # Combine all options and create game round
                options = [correct_option] + wrong_options
                import random
                random.shuffle(options)

                game_data["gameRounds"].append({
                    "recording": letra["recording"],
                    "options": options,
                    "correctOptionId": estilo["id"]
                })

    return game_data


def save_json(data, filepath):
    """Save data to JSON file"""
    print(f"Saving data to {filepath}...")
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def main():
    """Main function to run the script"""
    soup = fetch_page(SOURCE_URL)
    game_data = extract_game_data(soup, SOURCE_URL)
    game_data = generate_game_rounds(game_data)
    save_json(game_data, JSON_OUTPUT_PATH)
    print(
        f"Done! Created {len(game_data['gameRounds'])} game rounds from {len(game_data['estilos'])} estilos.")


if __name__ == "__main__":
    main()
