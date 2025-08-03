import requests
import json

def fix_image_url(url):
    if isinstance(url, str) and url.startswith("/images/"):
        return "https://omeda.city" + url
    return url

url = "https://omeda.city/items.json"
res = requests.get(url)
res.raise_for_status()
items = res.json()

for item in items:
    if "image" in item:
        item["image"] = fix_image_url(item["image"])

with open("assets/items.json", "w", encoding="utf-8") as f:
    json.dump(items, f, ensure_ascii=False, indent=2)