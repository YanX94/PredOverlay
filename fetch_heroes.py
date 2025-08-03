import requests
import json

def fix_image_url(url):
    if isinstance(url, str) and url.startswith("/images/"):
        return "https://omeda.city" + url
    return url

url = "https://omeda.city/heroes.json"
res = requests.get(url)
res.raise_for_status()
heroes = res.json()

for hero in heroes:
    if "image" in hero:
        hero["image"] = fix_image_url(hero["image"])
    if "abilities" in hero and isinstance(hero["abilities"], list):
        for ability in hero["abilities"]:
            if "image" in ability:
                ability["image"] = fix_image_url(ability["image"])

with open("assets/heroes.json", "w", encoding="utf-8") as f:
    json.dump(heroes, f, ensure_ascii=False, indent=2)