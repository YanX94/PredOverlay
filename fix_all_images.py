import json

def fix_image_url(url):
    if isinstance(url, str) and url.startswith("/images/"):
        return "https://omeda.city" + url
    return url

with open("assets/heroes.json", "r", encoding="utf-8") as f:
    heroes = json.load(f)

for hero in heroes:
    # Corrige l'image du héros
    if "image" in hero:
        hero["image"] = fix_image_url(hero["image"])
    # Corrige les images des abilities
    if "abilities" in hero and isinstance(hero["abilities"], list):
        for ability in hero["abilities"]:
            if "image" in ability:
                ability["image"] = fix_image_url(ability["image"])

with open("assets/heroes.json", "w", encoding="utf-8") as f:
    json.dump(heroes, f, ensure_ascii=False, indent=2)