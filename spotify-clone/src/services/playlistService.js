import api from "./api";

const API_BASE_URL = "http://localhost:5114";
const FRONTEND_BASE_URL = "http://localhost:5173";

function makeFileUrl(url) {
  if (!url) {
    return "";
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  if (
    url.startsWith("/music/") ||
    url.startsWith("/images/") ||
    url.startsWith("/assets/")
  ) {
    return `${FRONTEND_BASE_URL}${url}`;
  }

  return `${API_BASE_URL}/${url.replace(/^\/+/, "")}`;
}

function mapSong(song) {
  return {
    id: song.id,
    title: song.title,
    artist: song.artist,
    album: song.album,
    image: makeFileUrl(song.imageUrl),
    audio: makeFileUrl(song.audioUrl),
    duration: song.durationSeconds,
    position: song.position,
  };
}

function mapPlaylist(playlist) {
  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    image: makeFileUrl(playlist.imageUrl),
    isPublic: playlist.isPublic,
    createdAt: playlist.createdAt,

    songs: (playlist.songs || []).map(mapSong),
  };
}


// ============================================================
// GET PLAYLISTS
// ============================================================

export async function getPlaylists() {
  const response = await api.get("/playlists");

  return response.data.map(mapPlaylist);
}


// ============================================================
// GET SINGLE PLAYLIST
// ============================================================

export async function getPlaylist(id) {
  const response = await api.get(
    `/playlists/${id}`
  );

  return mapPlaylist(response.data);
}


// ============================================================
// CREATE PLAYLIST
// ============================================================

export async function createPlaylist({
  name,
  description = "",
  imageUrl = "",
  isPublic = true,
}) {
  const response = await api.post(
    "/playlists",
    {
      name,
      description,
      imageUrl,
      isPublic,
    }
  );

  return mapPlaylist(response.data.playlist);
}


// ============================================================
// UPDATE PLAYLIST
// ============================================================

export async function updatePlaylist(
  id,
  {
    name,
    description = "",
    imageUrl = "",
    isPublic = true,
  }
) {
  const response = await api.put(
    `/playlists/${id}`,
    {
      name,
      description,
      imageUrl,
      isPublic,
    }
  );

  return response.data.playlist;
}


// ============================================================
// DELETE PLAYLIST
// ============================================================

export async function deletePlaylist(id) {
  const response = await api.delete(
    `/playlists/${id}`
  );

  return response.data;
}


// ============================================================
// ADD SONG
// ============================================================

export async function addSongToPlaylist(
  playlistId,
  songId
) {
  const response = await api.post(
    `/playlists/${playlistId}/songs/${songId}`
  );

  return response.data;
}


// ============================================================
// REMOVE SONG
// ============================================================

export async function removeSongFromPlaylist(
  playlistId,
  songId
) {
  const response = await api.delete(
    `/playlists/${playlistId}/songs/${songId}`
  );

  return response.data;
}