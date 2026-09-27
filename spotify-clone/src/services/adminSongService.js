
import api from "./api";

export async function uploadSong({
  title,
  artist,
  album,
  durationSeconds,
  audio,
  image,
}) {
  const formData = new FormData();

  formData.append("title", title);
  formData.append("artist", artist);

  formData.append(
    "album",
    album || ""
  );

  formData.append(
    "durationSeconds",
    String(durationSeconds || 0)
  );

  formData.append("audio", audio);

  if (image) {
    formData.append("image", image);
  }

  const response = await api.post(
    "/admin/songs",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}


// ============================================================
// GET ALL ADMIN SONGS
// ============================================================

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

export async function getAdminSongs() {
  const response = await api.get("/admin/songs");

  return response.data.map((song) => ({
    id: song.id,
    title: song.title,
    artist: song.artist,
    album: song.album,
    image: makeFileUrl(song.imageUrl),
    audio: makeFileUrl(song.audioUrl),
    duration: song.durationSeconds,
    createdAt: song.createdAt,
  }));
}


// ============================================================
// UPDATE SONG
// ============================================================

export async function updateSong(
  id,
  {
    title,
    artist,
    album,
    durationSeconds,
  }
) {
  const response = await api.put(
    `/admin/songs/${id}`,
    {
      title,
      artist,
      album: album || null,
      durationSeconds: Number(durationSeconds) || 0,
    }
  );

  return response.data;
}


// ============================================================
// DELETE SONG
// ============================================================

export async function deleteSong(id) {
  const response = await api.delete(
    `/admin/songs/${id}`
  );

  return response.data;
}