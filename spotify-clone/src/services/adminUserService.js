
import api from "./api";

export async function getAdminUsers() {
  const response = await api.get("/admin/users");

  return response.data;
}

export async function getAdminUser(id) {
  const response = await api.get(
    `/admin/users/${id}`
  );

  return response.data;
}

export async function updateAdminUser(id, data) {
  console.log("================================");
  console.log("UPDATE ADMIN USER");
  console.log("User ID:", id);
  console.log("Data:", data);
  console.log("URL:", `/admin/users/${id}`);
  console.log("================================");

  const response = await api.put(
    `/admin/users/${id}`,
    data
  );

  console.log("UPDATE ADMIN USER RESPONSE:");
  console.log(response.data);

  return response.data;
}

export async function resetUserPassword(
  id,
  newPassword
) {
  const response = await api.put(
    `/admin/users/${id}/password`,
    {
      newPassword,
    }
  );

  return response.data;
}

export async function deleteAdminUser(id) {
  const response = await api.delete(
    `/admin/users/${id}`
  );

  return response.data;
}
