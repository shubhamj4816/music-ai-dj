import os
import google.generativeai as genai
from flask import Flask, request, jsonify, render_template, session
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

# Load API key and Spotify credentials from the .env file
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
spotify_client_id = os.getenv("SPOTIPY_CLIENT_ID")
spotify_client_secret = os.getenv("SPOTIPY_CLIENT_SECRET")

# Configure the Gemini model
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-pro')

# Configure Spotify API
auth_manager = SpotifyClientCredentials(client_id=spotify_client_id, client_secret=spotify_client_secret)
sp = spotipy.Spotify(auth_manager=auth_manager)

app = Flask(__name__)
app.secret_key = api_key

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/music_agent')
def music_agent():
    return render_template('music_agent.html')

@app.route('/set_name', methods=['POST'])
def set_name():
    data = request.get_json()
    user_name = data.get('name')
    if not user_name:
        return jsonify({"error": "Name is required"}), 400
    session['name'] = user_name
    return jsonify({"message": f"Hello, {user_name}! How are you feeling today?"})

@app.route('/get_playlist', methods=['POST'])
def get_playlist():
    data = request.get_json()
    user_mood = data.get('mood')
    user_language = data.get('language', 'English')
    user_name = session.get('name', 'User')

    if not user_mood:
        return jsonify({"error": "Please describe your mood."}), 400

    try:
        prompt = f"""
User's name is {user_name}.
The user is feeling {user_mood}.
They prefer music in {user_language}.

Generate a list of exactly 5 songs that match this mood and language.
For each song, list only the song title and artist in this format:
Song Title - Artist

Do not add any extra text beyond the list.
"""

        gemini_response = model.generate_content(prompt)

        gemini_songs = gemini_response.text.strip().split('\n')

        playlist_tracks = []
        for song_entry in gemini_songs:
            if ' - ' in song_entry:
                try:
                    title, artist = song_entry.strip().split(' - ', 1)
                    query = f"track:{title} artist:{artist}"
                    result = sp.search(q=query, type='track', limit=1)
                    if result['tracks']['items']:
                        track = result['tracks']['items'][0]
                        playlist_tracks.append(track['id'])
                except Exception as e:
                    print(f"Error searching Spotify for song '{song_entry}': {e}")

        if not playlist_tracks:
            return jsonify({"error": "Could not find any songs on Spotify."}), 404

        return jsonify({"tracks": playlist_tracks})

    except Exception as e:
        print(f"Error in playlist generation: {e}")
        return jsonify({"error": "Failed to get playlist. Please try again later."}), 500

if __name__ == '__main__':
    app.run(debug=True)
