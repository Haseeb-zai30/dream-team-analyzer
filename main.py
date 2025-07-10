from flask import Flask, request, jsonify, render_template
import openai

app = Flask(__name__)

# Use OpenRouter with Claude 3 Haiku
openai.api_key = "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"  # Your OpenRouter key
openai.api_base = "https://openrouter.ai/api/v1"

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/analyze", methods=["POST"])
def analyze_team():
    data = request.get_json()
    formation = data.get("formation")
    players = data.get("team")

    team_str = "\n".join([f"{pos}: {name}" for pos, name in players.items()])
    prompt = f"""
Analyze this team (each player is in his prime) based on the {formation} formation,if the player is unknown or not an international player, say you dont know him:
{team_str}
Give strengths, weaknesses, and suggestions.give in points starting from strengths"""

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
    app.run(host="0.0.0.0", port=port)
