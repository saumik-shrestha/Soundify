import api from "./api";

const API_BASE_URL = "http://localhost:5114";
const FRONTEND_BASE_URL = "http://localhost:5173";

function makeFileUrl(url) {
  if (!url) {
    return "";
  }

  // Already a complete URL
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Old songs/images stored in the React public folder
  if (
    url.startsWith("/music/") ||
    url.startsWith("/images/") ||
    url.startsWith("/assets/")
  ) {
    return `${FRONTEND_BASE_URL}${url}`;
  }

  // Newly uploaded files served by ASP.NET
  return `${API_BASE_URL}/${url.replace(/^\/+/, "")}`;
}

export async function getSongs() {
  const response = await api.get("/songs");

  return response.data.map((song) => ({
    id: song.id,
    title: song.title,
    artist: song.artist,
    album: song.album,

    image: makeFileUrl(song.imageUrl),

    audio: makeFileUrl(song.audioUrl),

    duration: song.durationSeconds,
  }));
}