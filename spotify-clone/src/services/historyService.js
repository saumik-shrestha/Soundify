import api from "./api";

const API_BASE_URL = "http://localhost:5114";
const FRONTEND_BASE_URL = "http://localhost:5173";

function makeFileUrl(url) {
  if (!url) {
    return "";
  }

  // Already a complete URL
  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  // Original music/images stored in frontend public folder
  if (
    url.startsWith("/music/") ||
    url.startsWith("/images/") ||
    url.startsWith("/assets/")
  ) {
    return `${FRONTEND_BASE_URL}${url}`;
  }

  // Admin-uploaded files stored in backend wwwroot
  return `${API_BASE_URL}/${url.replace(/^\/+/, "")}`;
}

export async function getHistory() {
  const response = await api.get("/history");

  console.log("RAW HISTORY API RESPONSE:", response.data);

  const mappedHistory = response.data.map((item) => ({
    id: item.song.id,
    title: item.song.title,
    artist: item.song.artist,
    album: item.song.album,

    image: makeFileUrl(item.song.imageUrl),
    audio: makeFileUrl(item.song.audioUrl),

    duration: item.song.durationSeconds,

    playedAt: item.playedAt,
  }));

  console.log("MAPPED HISTORY:", mappedHistory);

  return mappedHistory;
}

export async function addToHistory(songId) {
  const response = await api.post(`/history/${songId}`);

  return response.data;
}

export async function clearHistory() {
  const response = await api.delete("/history");

  return response.data;
}