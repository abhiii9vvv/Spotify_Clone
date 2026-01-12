import json
import urllib.request

# Artists to fetch songs from
artists = ['arijit+singh', 'pritam', 'atif+aslam', 'shreya+ghoshal', 'neha+kakkar', 'honey+singh', 'ar+rahman', 'badshah']
all_songs = []

print("Fetching songs from iTunes API...")

for artist in artists:
    url = f'https://itunes.apple.com/search?term={artist}&media=music&limit=5'
    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            for track in data.get('results', []):
                if track.get('previewUrl'):
                    song = {
                        'id': track.get('trackId'),
                        'name': track.get('trackName'),
                        'artist': track.get('artistName'),
                        'album': track.get('collectionName'),
                        'image': track.get('artworkUrl100', '').replace('100x100', '400x400'),
                        'audio': track.get('previewUrl'),
                        'duration': track.get('trackTimeMillis', 0) // 1000
                    }
                    all_songs.append(song)
                    print(f"  + {song['name']} - {song['artist']}")
    except Exception as e:
        print(f'Error fetching {artist}: {e}')

# Save to JSON
with open('e:/PROJECT/Spotify-Clone/songs.json', 'w', encoding='utf-8') as f:
    json.dump(all_songs, f, indent=2, ensure_ascii=False)

print(f"\n✅ Saved {len(all_songs)} songs to songs.json")
