import api from "./api";


// =====================================================
// GET PROFILE
// =====================================================

export async function getProfile() {
  const response = await api.get("/profile");

  return response.data;
}


// =====================================================
// UPDATE PROFILE
// =====================================================

export async function updateProfile(data) {
  const response = await api.put(
    "/profile",
    data
  );

  return response.data;
}


// =====================================================
// CHANGE PASSWORD
// =====================================================

export async function changePassword(data) {
  const response = await api.put(
    "/profile/password",
    data
  );

  return response.data;
}