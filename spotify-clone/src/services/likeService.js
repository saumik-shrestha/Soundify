import api from "./api";

export async function getLikedSongs() {
  const response = await api.get("/likes");
  return response.data;
}

export async function checkSongLiked(songId) {
  const response = await api.get(`/likes/${songId}`);
  return response.data;
}

export async function likeSong(songId) {
  const response = await api.post(`/likes/${songId}`);
  return response.data;
}

export async function unlikeSong(songId) {
  const response = await api.delete(`/likes/${songId}`);
  return response.data;
}