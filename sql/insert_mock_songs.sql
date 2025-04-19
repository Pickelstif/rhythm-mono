-- Insert mock songs for each band
-- Note: Replace the following placeholder values with actual IDs from your database:
-- {BAND_ID_1}, {BAND_ID_2}, etc.: Actual band IDs
-- {USER_ID_1}, {USER_ID_2}, etc.: Actual user IDs (band leaders)

-- Mock songs for first band
INSERT INTO songs (band_id, title, artist, spotify_link, created_by) VALUES
  ('{BAND_ID_1}', 'Bohemian Rhapsody', 'Queen', 'https://open.spotify.com/track/6l8GvAyoUZwWDgF1e4822w', '{USER_ID_1}'),
  ('{BAND_ID_1}', 'Sweet Child O'' Mine', 'Guns N'' Roses', 'https://open.spotify.com/track/7o2CTH4ctstm8TNelqjb51', '{USER_ID_1}'),
  ('{BAND_ID_1}', 'Stairway to Heaven', 'Led Zeppelin', 'https://open.spotify.com/track/5CQ30WqJwcep0pYcV4AMNc', '{USER_ID_1}'),
  ('{BAND_ID_1}', 'Imagine', 'John Lennon', 'https://open.spotify.com/track/7pKfPomDEeI4TPT6EOYjn9', '{USER_ID_1}'),
  ('{BAND_ID_1}', 'Hotel California', 'Eagles', 'https://open.spotify.com/track/40riOy7x9W7GXjyGp4pjAv', '{USER_ID_1}'),
  ('{BAND_ID_1}', 'Sweet Home Alabama', 'Lynyrd Skynyrd', 'https://open.spotify.com/track/7e89621JPkKaeDSTQ3avtg', '{USER_ID_1}'),
  ('{BAND_ID_1}', 'Wonderwall', 'Oasis', 'https://open.spotify.com/track/5qqabIl2vWzo9ApSC317sa', '{USER_ID_1}'),
  ('{BAND_ID_1}', 'Creep', 'Radiohead', 'https://open.spotify.com/track/70LcF31zb1H0PyJoS1Sx1r', '{USER_ID_1}'),
  ('{BAND_ID_1}', 'Smells Like Teen Spirit', 'Nirvana', 'https://open.spotify.com/track/5ghIJDpPoe3CfHMGu71E6T', '{USER_ID_1}'),
  ('{BAND_ID_1}', 'Thriller', 'Michael Jackson', 'https://open.spotify.com/track/2LlQb7Uoj1kKyLZnCCXvyS', '{USER_ID_1}');

-- Mock songs for second band
INSERT INTO songs (band_id, title, artist, spotify_link, created_by) VALUES
  ('{BAND_ID_2}', 'All of Me', 'John Legend', 'https://open.spotify.com/track/3U4isOIWM3VvDubwSI3y7a', '{USER_ID_2}'),
  ('{BAND_ID_2}', 'Thinking Out Loud', 'Ed Sheeran', 'https://open.spotify.com/track/1Slwb6dOYkBlWal1PGtnNg', '{USER_ID_2}'),
  ('{BAND_ID_2}', 'Perfect', 'Ed Sheeran', 'https://open.spotify.com/track/0tgVpDi06FyKpA1z0VMD4v', '{USER_ID_2}'),
  ('{BAND_ID_2}', 'Can''t Help Falling in Love', 'Elvis Presley', 'https://open.spotify.com/track/44AyOl4qVkzS48vBsbNXaC', '{USER_ID_2}'),
  ('{BAND_ID_2}', 'Your Song', 'Elton John', 'https://open.spotify.com/track/38zsOOcu31XbbYj9BIPUF1', '{USER_ID_2}'),
  ('{BAND_ID_2}', 'At Last', 'Etta James', 'https://open.spotify.com/track/6pX9QtGUzWk5kFXAEYTLT4', '{USER_ID_2}'),
  ('{BAND_ID_2}', 'Hallelujah', 'Leonard Cohen', 'https://open.spotify.com/track/5VegTL3JaoT6eiYGEJHVF5', '{USER_ID_2}'),
  ('{BAND_ID_2}', 'What a Wonderful World', 'Louis Armstrong', 'https://open.spotify.com/track/29U7stRjqHU6rMiS8BfaI9', '{USER_ID_2}'),
  ('{BAND_ID_2}', 'Fly Me to the Moon', 'Frank Sinatra', 'https://open.spotify.com/track/4FmCUATNh7FKQGvZ5O76FB', '{USER_ID_2}'),
  ('{BAND_ID_2}', 'My Way', 'Frank Sinatra', 'https://open.spotify.com/track/3spdoTYpuCpmq19tuD0bOe', '{USER_ID_2}');

-- Mock songs for third band
INSERT INTO songs (band_id, title, artist, spotify_link, created_by) VALUES
  ('{BAND_ID_3}', 'Shape of You', 'Ed Sheeran', 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3', '{USER_ID_3}'),
  ('{BAND_ID_3}', 'Uptown Funk', 'Mark Ronson ft. Bruno Mars', 'https://open.spotify.com/track/32OlwWuMpZ6b0aN2RZOeMS', '{USER_ID_3}'),
  ('{BAND_ID_3}', 'Happy', 'Pharrell Williams', 'https://open.spotify.com/track/60nZcImufyMA1MKQY3dcCO', '{USER_ID_3}'),
  ('{BAND_ID_3}', 'Get Lucky', 'Daft Punk ft. Pharrell Williams', 'https://open.spotify.com/track/2Foc5Q5nqNiosCNqttzHof', '{USER_ID_3}'),
  ('{BAND_ID_3}', 'Can''t Stop the Feeling!', 'Justin Timberlake', 'https://open.spotify.com/track/6JV2JOEocMgcZxYSZelKcc', '{USER_ID_3}'),
  ('{BAND_ID_3}', 'Valerie', 'Amy Winehouse', 'https://open.spotify.com/track/4NSSudo7MNJwBcQXQcLLqj', '{USER_ID_3}'),
  ('{BAND_ID_3}', 'Treasure', 'Bruno Mars', 'https://open.spotify.com/track/55h7vJchibLdUkxdlX3fK7', '{USER_ID_3}'),
  ('{BAND_ID_3}', 'Signed, Sealed, Delivered (I''m Yours)', 'Stevie Wonder', 'https://open.spotify.com/track/1ChPoaTeQqxNZ3CoHkTR8K', '{USER_ID_3}'),
  ('{BAND_ID_3}', 'Superstition', 'Stevie Wonder', 'https://open.spotify.com/track/4Y4Gd3ty8uut6Qw43c7yP6', '{USER_ID_3}'),
  ('{BAND_ID_3}', 'September', 'Earth, Wind & Fire', 'https://open.spotify.com/track/2grjqo0Frpf2okIBiifQKs', '{USER_ID_3}'); 