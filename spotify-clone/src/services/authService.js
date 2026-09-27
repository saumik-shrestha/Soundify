import api from "./api";

export async function register(data) {
  const response = await api.post("/auth/register", data);

  return response.data;
}

export async function login(data) {
  const response = await api.post("/auth/login", data);

  return response.data;
}