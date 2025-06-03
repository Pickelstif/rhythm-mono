import { toast } from "sonner";

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  external_urls: { spotify: string };
}

interface SpotifyPlaylist {
  tracks: {
    items: Array<{
      track: SpotifyTrack;
    }>;
  };
}

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

async function getAccessToken(): Promise<string> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET)
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  return data.access_token;
}

export async function getPlaylistTracks(playlistUrl: string): Promise<SpotifyTrack[]> {
  try {
    // Extract playlist ID from URL
    const playlistId = playlistUrl.split('/playlist/')[1]?.split('?')[0];
    if (!playlistId) {
      throw new Error('Invalid playlist URL');
    }

    const token = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch playlist');
    }

    const data: SpotifyPlaylist = await response.json();
    return data.tracks.items.map(item => item.track);
  } catch (error) {
    console.error('Error fetching playlist:', error);
    toast.error('Failed to fetch playlist from Spotify');
    throw error;
  }
} 