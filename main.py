from flask import Flask, request, jsonify, render_template
import requests
import openai

app = Flask(__name__)

# OpenRouter (Claude Haiku) setup
openai.api_key = "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"
openai.api_base = "https://openrouter.ai/api/v1"

# Wikipedia image fetcher
def get_player_image_url(player_name):
    search_url = "https://en.wikipedia.org/w/api.php"
    search_params = {
        "action": "query",
        "list": "search",
        "srsearch": f"{player_name} footballer",
        "format": "json"
    }

    response = requests.get(search_url, params=search_params).json()
    results = response.get("query", {}).get("search", [])
    if not results:
        return None

    best_match = results[0]["title"]

    image_params = {
        "action": "query",
        "format": "json",
        "titles": best_match,
        "prop": "pageimages",
        "pithumbsize": 400
    }

    image_response = requests.get(search_url, params=image_params).json()
    pages = image_response.get("query", {}).get("pages", {})
    for page in pages.values():
        if "thumbnail" in page:
            return page["thumbnail"]["source"]
    return None

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/search", methods=["POST"])
def search():
    name = request.json.get("name")
    img_url = get_player_image_url(name)
    return jsonify({"name": name, "img": img_url})

@app.route("/analyze", methods=["POST"])
def analyze_team():
    data = request.get_json()
    formation = data.get("formation")
    players = data.get("team")

    team_str = "\n".join([f"{pos}: {name}" for pos, name in players.items()])
    prompt = f"""You are a football analyst.
Analyze this team based on the {formation} formation:
{team_str}
Give strengths, weaknesses, and suggestions."""

    try:
        response = openai.ChatCompletion.create(
            model="anthropic/claude-3-haiku:beta",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        return jsonify({"analysis": response["choices"][0]["message"]["content"]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
