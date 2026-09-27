
import { useEffect, useState } from "react";
import "./admin.css";

import {
  Music2,
  Upload,
  Image as ImageIcon,
  Pencil,
  Trash2,
  X,
  Save,
  Users,
  Shield,
  KeyRound,
  Search,
} from "lucide-react";

import {
  uploadSong,
  getAdminSongs,
  updateSong,
  deleteSong,
} from "../services/adminSongService";

import {
  getAdminUsers,
  updateAdminUser,
  resetUserPassword,
  deleteAdminUser,
} from "../services/adminUserService";

function Admin({ user }) {
  // ============================================================
  // CURRENT USER
  // ============================================================

  const currentUserId =
    user?.id?.toString() || null;

  // ============================================================
  // SONG UPLOAD STATE
  // ============================================================

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [durationSeconds, setDurationSeconds] =
    useState("");

  const [audio, setAudio] = useState(null);
  const [image, setImage] = useState(null);

  const [loading, setLoading] = useState(false);

  // ============================================================
  // GLOBAL MESSAGE STATE
  // ============================================================

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ============================================================
  // SONG MANAGEMENT
  // ============================================================

  const [songs, setSongs] = useState([]);
  const [songsLoading, setSongsLoading] =
    useState(true);

  const [editingSong, setEditingSong] =
    useState(null);

  const [editTitle, setEditTitle] = useState("");
  const [editArtist, setEditArtist] =
    useState("");
  const [editAlbum, setEditAlbum] = useState("");
  const [editDuration, setEditDuration] =
    useState("");

  const [editLoading, setEditLoading] =
    useState(false);

  const [deleteLoading, setDeleteLoading] =
    useState(null);

  // ============================================================
  // USER MANAGEMENT
  // ============================================================

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] =
    useState(true);

  const [userSearch, setUserSearch] =
    useState("");

  const [editingUser, setEditingUser] =
    useState(null);

  const [editUsername, setEditUsername] =
    useState("");

  const [editEmail, setEditEmail] =
    useState("");

  const [editDisplayName, setEditDisplayName] =
    useState("");

  const [editIsAdmin, setEditIsAdmin] =
    useState(false);

  const [userEditLoading, setUserEditLoading] =
    useState(false);

  const [userDeleteLoading, setUserDeleteLoading] =
    useState(null);

  // ============================================================
  // PASSWORD RESET
  // ============================================================

  const [passwordUser, setPasswordUser] =
    useState(null);

  const [newPassword, setNewPassword] =
    useState("");

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  // ============================================================
  // LOAD SONGS
  // ============================================================

  const loadSongs = async () => {
    try {
      setSongsLoading(true);

      const data = await getAdminSongs();

      setSongs(data);
    } catch (err) {
      console.error(
        "Failed to load admin songs:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load songs."
      );
    } finally {
      setSongsLoading(false);
    }
  };

  // ============================================================
  // LOAD USERS
  // ============================================================

  const loadUsers = async () => {
    try {
      setUsersLoading(true);

      const data = await getAdminUsers();

      setUsers(data);
    } catch (err) {
      console.error(
        "Failed to load admin users:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load users."
      );
    } finally {
      setUsersLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadSongs();
    loadUsers();
  }, []);

  // ============================================================
  // UPLOAD SONG
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!title.trim()) {
      setError(
        "Please enter the song title."
      );
      return;
    }

    if (!artist.trim()) {
      setError(
        "Please enter the artist."
      );
      return;
    }

    if (!audio) {
      setError(
        "Please select an audio file."
      );
      return;
    }

    try {
      setLoading(true);

      await uploadSong({
        title: title.trim(),
        artist: artist.trim(),
        album: album.trim(),
        durationSeconds,
        audio,
        image,
      });

      setMessage(
        "Song uploaded successfully."
      );

      setTitle("");
      setArtist("");
      setAlbum("");
      setDurationSeconds("");
      setAudio(null);
      setImage(null);

      const audioInput =
        document.getElementById(
          "audio-file"
        );

      if (audioInput) {
        audioInput.value = "";
      }

      const imageInput =
        document.getElementById(
          "image-file"
        );

      if (imageInput) {
        imageInput.value = "";
      }

      await loadSongs();
    } catch (err) {
      console.error(
        "Upload error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to upload song."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // EDIT SONG
  // ============================================================

  const handleEditClick = (song) => {
    setEditingSong(song);

    setEditTitle(song.title || "");
    setEditArtist(song.artist || "");
    setEditAlbum(song.album || "");
    setEditDuration(song.duration ?? 0);

    setMessage("");
    setError("");
  };

  // ============================================================
  // CANCEL SONG EDIT
  // ============================================================

  const handleCancelEdit = () => {
    setEditingSong(null);

    setEditTitle("");
    setEditArtist("");
    setEditAlbum("");
    setEditDuration("");
  };

  // ============================================================
  // SAVE SONG EDIT
  // ============================================================

  const handleSaveEdit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!editingSong) {
      setError("No song selected.");
      return;
    }

    if (!editTitle.trim()) {
      setError(
        "Please enter the song title."
      );
      return;
    }

    if (!editArtist.trim()) {
      setError(
        "Please enter the artist."
      );
      return;
    }

    try {
      setEditLoading(true);

      await updateSong(
        editingSong.id,
        {
          title: editTitle.trim(),
          artist: editArtist.trim(),
          album: editAlbum.trim(),
          durationSeconds: editDuration,
        }
      );

      setMessage(
        "Song updated successfully."
      );

      handleCancelEdit();

      await loadSongs();
    } catch (err) {
      console.error(
        "Update song error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to update song."
      );
    } finally {
      setEditLoading(false);
    }
  };

  // ============================================================
  // DELETE SONG
  // ============================================================

  const handleDelete = async (song) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${song.title}"?`
      );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    try {
      setDeleteLoading(song.id);

      await deleteSong(song.id);

      setMessage(
        `"${song.title}" deleted successfully.`
      );

      if (
        editingSong &&
        editingSong.id === song.id
      ) {
        handleCancelEdit();
      }

      await loadSongs();
    } catch (err) {
      console.error(
        "Delete song error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to delete song."
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  // ============================================================
  // EDIT USER
  // ============================================================

  const handleEditUser = (selectedUser) => {
    console.log(
      "================================"
    );
    console.log("EDIT USER CLICKED");
    console.log(
      "================================"
    );

    console.log(
      "Selected user:",
      selectedUser
    );

    console.log(
      "Selected user ID:",
      selectedUser?.id
    );

    console.log(
      "Current user ID:",
      currentUserId
    );

    const selectedUserId =
      selectedUser?.id?.toString();

    const loggedInUserId =
      currentUserId?.toString();

    const isCurrentUser =
      selectedUserId ===
      loggedInUserId;

    console.log(
      "Selected user ID:",
      selectedUserId
    );

    console.log(
      "Logged-in user ID:",
      loggedInUserId
    );

    console.log(
      "Is current user:",
      isCurrentUser
    );

    setEditingUser(selectedUser);

    setEditUsername(
      selectedUser.username || ""
    );

    setEditEmail(
      selectedUser.email || ""
    );

    setEditDisplayName(
      selectedUser.displayName || ""
    );

    /*
      If editing the currently logged-in user,
      force admin to true.

      This means Stha can edit their own
      username/email/display name without
      accidentally sending isAdmin: false.
    */

    if (isCurrentUser) {
      setEditIsAdmin(true);
    } else {
      setEditIsAdmin(
        Boolean(selectedUser.isAdmin)
      );
    }

    setMessage("");
    setError("");
  };

  // ============================================================
  // CANCEL USER EDIT
  // ============================================================

  const handleCancelUserEdit = () => {
    setEditingUser(null);

    setEditUsername("");
    setEditEmail("");
    setEditDisplayName("");
    setEditIsAdmin(false);
  };

  // ============================================================
  // SAVE USER EDIT
  // ============================================================

  const handleSaveUser = async (event) => {
    event.preventDefault();

    console.log(
      "================================"
    );
    console.log("SAVE CHANGES CLICKED");
    console.log(
      "================================"
    );

    console.log(
      "Editing user:",
      editingUser
    );

    console.log(
      "Editing user ID:",
      editingUser?.id
    );

    console.log(
      "Current user ID:",
      currentUserId
    );

    console.log(
      "Username:",
      editUsername
    );

    console.log(
      "Email:",
      editEmail
    );

    console.log(
      "Display name:",
      editDisplayName
    );

    console.log(
      "Is admin state:",
      editIsAdmin
    );

    setMessage("");
    setError("");

    if (!editingUser) {
      console.error(
        "No user is currently being edited."
      );

      setError(
        "No user selected."
      );

      return;
    }

    if (!editingUser.id) {
      console.error(
        "Editing user has no ID:",
        editingUser
      );

      setError(
        "User ID is missing."
      );

      return;
    }

    if (!editUsername.trim()) {
      setError(
        "Username is required."
      );

      return;
    }

    if (!editEmail.trim()) {
      setError(
        "Email is required."
      );

      return;
    }

    try {
      setUserEditLoading(true);

      const editingUserId =
        editingUser.id.toString();

      const loggedInUserId =
        currentUserId?.toString();

      const isEditingCurrentUser =
        editingUserId ===
        loggedInUserId;

      /*
        VERY IMPORTANT:

        If Stha is editing Stha,
        always send isAdmin: true.

        If Stha is editing another user,
        use the checkbox state.
      */

      const updateData = {
        username:
          editUsername.trim(),

        email:
          editEmail.trim(),

        displayName:
          editDisplayName.trim() ||
          editUsername.trim(),

        isAdmin:
          isEditingCurrentUser
            ? true
            : editIsAdmin,
      };

      console.log(
        "================================"
      );

      console.log(
        "USER UPDATE DATA"
      );

      console.log(
        "================================"
      );

      console.log(
        "Editing user ID:",
        editingUserId
      );

      console.log(
        "Logged-in user ID:",
        loggedInUserId
      );

      console.log(
        "Editing current user:",
        isEditingCurrentUser
      );

      console.log(
        "Sending update:",
        updateData
      );

      const response =
        await updateAdminUser(
          editingUser.id,
          updateData
        );

      console.log(
        "================================"
      );

      console.log(
        "USER UPDATE SUCCESS"
      );

      console.log(
        "================================"
      );

      console.log(
        "Response:",
        response
      );

      if (response?.user) {
        setUsers(
          (currentUsers) =>
            currentUsers.map(
              (item) =>
                item.id?.toString() ===
                editingUserId
                  ? response.user
                  : item
            )
        );
      } else {
        await loadUsers();
      }

      setMessage(
        response?.message ||
          "User updated successfully."
      );

      handleCancelUserEdit();
    } catch (err) {
      console.error(
        "================================"
      );

      console.error(
        "UPDATE USER FAILED"
      );

      console.error(
        "================================"
      );

      console.error(
        "Error:",
        err
      );

      console.error(
        "Status:",
        err.response?.status
      );

      console.error(
        "Server response:",
        err.response?.data
      );

      console.error(
        "Server message:",
        err.response?.data?.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to update user."
      );
    } finally {
      setUserEditLoading(false);
    }
  };

  // ============================================================
  // OPEN PASSWORD RESET
  // ============================================================

  const handleOpenPasswordReset = (
    selectedUser
  ) => {
    setPasswordUser(selectedUser);
    setNewPassword("");

    setMessage("");
    setError("");
  };

  // ============================================================
  // CANCEL PASSWORD RESET
  // ============================================================

  const handleCancelPasswordReset = () => {
    setPasswordUser(null);
    setNewPassword("");
  };

  // ============================================================
  // RESET PASSWORD
  // ============================================================

  const handleResetPassword = async (
    event
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!passwordUser) {
      setError(
        "No user selected."
      );

      return;
    }

    if (!newPassword) {
      setError(
        "Please enter a new password."
      );

      return;
    }

    if (newPassword.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );

      return;
    }

    try {
      setPasswordLoading(true);

      await resetUserPassword(
        passwordUser.id,
        newPassword
      );

      setMessage(
        `Password reset successfully for ${passwordUser.username}.`
      );

      handleCancelPasswordReset();
    } catch (err) {
      console.error(
        "Reset password error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to reset password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // ============================================================
  // DELETE USER
  // ============================================================

  const handleDeleteUser = async (
    selectedUser
  ) => {
    const selectedUserId =
      selectedUser.id?.toString();

    /*
      Never allow the current logged-in
      admin to delete themselves.
    */

    if (
      currentUserId ===
      selectedUserId
    ) {
      setError(
        "You cannot delete your own account."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${selectedUser.username}"? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    try {
      setUserDeleteLoading(
        selectedUser.id
      );

      await deleteAdminUser(
        selectedUser.id
      );

      setMessage(
        `"${selectedUser.username}" deleted successfully.`
      );

      if (
        editingUser &&
        editingUser.id ===
          selectedUser.id
      ) {
        handleCancelUserEdit();
      }

      if (
        passwordUser &&
        passwordUser.id ===
          selectedUser.id
      ) {
        handleCancelPasswordReset();
      }

      await loadUsers();
    } catch (err) {
      console.error(
        "Delete user error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to delete user."
      );
    } finally {
      setUserDeleteLoading(null);
    }
  };

  // ============================================================
  // FILTER USERS
  // ============================================================

  const filteredUsers =
    users.filter((item) => {
      const search =
        userSearch
          .trim()
          .toLowerCase();

      if (!search) {
        return true;
      }

      return (
        item.username
          ?.toLowerCase()
          .includes(search) ||
        item.email
          ?.toLowerCase()
          .includes(search) ||
        item.displayName
          ?.toLowerCase()
          .includes(search)
      );
    });

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main className="admin-page">

      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="admin-header">

        <div className="admin-header-content">

          <div className="admin-title-icon">
            <Music2 size={28} />
          </div>

          <div>
            <h1>
              Admin Dashboard
            </h1>

            <p>
              Add and manage songs and
              users in Soundify.
            </p>
          </div>

        </div>

      </div>

      {/* ======================================================
          GLOBAL ERROR
          ====================================================== */}

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {/* ======================================================
          GLOBAL SUCCESS
          ====================================================== */}

      {message && (
        <div className="admin-success">
          {message}
        </div>
      )}

      {/* ======================================================
          ADD SONG
          ====================================================== */}

      <div className="admin-card">

        <h2>
          Add Song
        </h2>

        <form
          onSubmit={handleSubmit}
        >

          <label>
            Song Title
          </label>

          <input
            type="text"
            placeholder="Enter song title"
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value
              )
            }
            disabled={loading}
          />

          <label>
            Artist
          </label>

          <input
            type="text"
            placeholder="Enter artist name"
            value={artist}
            onChange={(event) =>
              setArtist(
                event.target.value
              )
            }
            disabled={loading}
          />

          <label>
            Album
          </label>

          <input
            type="text"
            placeholder="Enter album name"
            value={album}
            onChange={(event) =>
              setAlbum(
                event.target.value
              )
            }
            disabled={loading}
          />

          <label>
            Duration (seconds)
          </label>

          <input
            type="number"
            min="0"
            placeholder="Example: 240"
            value={durationSeconds}
            onChange={(event) =>
              setDurationSeconds(
                event.target.value
              )
            }
            disabled={loading}
          />

          <label>
            Audio File
          </label>

          <div className="file-input">

            <Upload size={20} />

            <input
              id="audio-file"
              type="file"
              accept=".mp3,.wav,.m4a,.ogg,audio/*"
              onChange={(event) =>
                setAudio(
                  event.target.files?.[0] ||
                    null
                )
              }
              disabled={loading}
            />

          </div>

          {audio && (
            <p className="selected-file">
              🎵 {audio.name}
            </p>
          )}

          <label>
            Cover Image
          </label>

          <div className="file-input">

            <ImageIcon size={20} />

            <input
              id="image-file"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/*"
              onChange={(event) =>
                setImage(
                  event.target.files?.[0] ||
                    null
                )
              }
              disabled={loading}
            />

          </div>

          {image && (
            <p className="selected-file">
              🖼️ {image.name}
            </p>
          )}

          <button
            type="submit"
            className="admin-upload-button"
            disabled={loading}
          >
            {loading
              ? "Uploading..."
              : "Upload Song"}
          </button>

        </form>

      </div>

      {/* ======================================================
          MANAGE SONGS
          ====================================================== */}

      <div className="admin-card admin-song-management">

        <div className="admin-section-heading">

          <div>

            <h2>
              Manage Songs
            </h2>

            <p>
              Edit or delete songs from
              the Soundify library.
            </p>

          </div>

          <span className="song-count">
            {songs.length} songs
          </span>

        </div>

        {songsLoading ? (
          <p className="admin-loading">
            Loading songs...
          </p>
        ) : songs.length === 0 ? (
          <p className="admin-empty">
            No songs found.
          </p>
        ) : (
          <div className="admin-song-list">

            {songs.map((song) => (
              <div
                className="admin-song-item"
                key={song.id}
              >

                <div className="admin-song-image">

                  {song.image ? (
                    <img
                      src={song.image}
                      alt={song.title}
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <Music2 size={24} />
                  )}

                </div>

                <div className="admin-song-info">

                  <h3>
                    {song.title}
                  </h3>

                  <p>
                    {song.artist}
                  </p>

                  {song.album && (
                    <span>
                      {song.album}
                    </span>
                  )}

                </div>

                <div className="admin-song-actions">

                  <button
                    type="button"
                    className="admin-edit-button"
                    onClick={() =>
                      handleEditClick(
                        song
                      )
                    }
                    disabled={
                      deleteLoading ===
                      song.id
                    }
                  >
                    <Pencil size={17} />

                    Edit
                  </button>

                  <button
                    type="button"
                    className="admin-delete-button"
                    onClick={() =>
                      handleDelete(song)
                    }
                    disabled={
                      deleteLoading ===
                      song.id
                    }
                  >
                    <Trash2 size={17} />

                    {deleteLoading ===
                    song.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

      {/* ======================================================
          MANAGE USERS
          ====================================================== */}

      <div className="admin-card admin-user-management">

        <div className="admin-section-heading">

          <div>

            <h2>
              <Users size={22} />

              Manage Users
            </h2>

            <p>
              View, edit, manage and remove
              Soundify users.
            </p>

          </div>

          <span className="song-count">
            {users.length} users
          </span>

        </div>

        {/* USER SEARCH */}

        <div className="admin-user-search">

          <Search size={19} />

          <input
            type="text"
            placeholder="Search username, email or display name..."
            value={userSearch}
            onChange={(event) =>
              setUserSearch(
                event.target.value
              )
            }
          />

        </div>

        {usersLoading ? (
          <p className="admin-loading">
            Loading users...
          </p>
        ) : filteredUsers.length === 0 ? (
          <p className="admin-empty">
            No users found.
          </p>
        ) : (
          <div className="admin-user-list">

            {filteredUsers.map(
              (selectedUser) => {

                const isCurrentUser =
                  currentUserId ===
                  selectedUser.id?.toString();

                return (
                  <div
                    className="admin-user-item"
                    key={
                      selectedUser.id
                    }
                  >

                    <div className="admin-user-avatar">

                      <Users size={23} />

                    </div>

                    <div className="admin-user-info">

                      <div className="admin-user-name-row">

                        <h3>
                          {selectedUser.displayName ||
                            selectedUser.username}
                        </h3>

                        {selectedUser.isAdmin && (
                          <span className="admin-user-badge">

                            <Shield size={13} />

                            Admin

                          </span>
                        )}

                        {isCurrentUser && (
                          <span className="admin-user-current">
                            You
                          </span>
                        )}

                      </div>

                      <p>
                        @
                        {
                          selectedUser.username
                        }
                      </p>

                      <p>
                        {
                          selectedUser.email
                        }
                      </p>

                    </div>

                    <div className="admin-user-actions">

                      <button
                        type="button"
                        className="admin-edit-button"
                        onClick={() =>
                          handleEditUser(
                            selectedUser
                          )
                        }
                        disabled={
                          userDeleteLoading ===
                          selectedUser.id
                        }
                      >
                        <Pencil size={16} />

                        Edit
                      </button>

                      <button
                        type="button"
                        className="admin-edit-button"
                        onClick={() =>
                          handleOpenPasswordReset(
                            selectedUser
                          )
                        }
                        disabled={
                          userDeleteLoading ===
                          selectedUser.id
                        }
                      >
                        <KeyRound size={16} />

                        Password
                      </button>

                      <button
                        type="button"
                        className="admin-delete-button"
                        onClick={() =>
                          handleDeleteUser(
                            selectedUser
                          )
                        }
                        disabled={
                          isCurrentUser ||
                          userDeleteLoading ===
                            selectedUser.id
                        }
                      >
                        <Trash2 size={16} />

                        {userDeleteLoading ===
                        selectedUser.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>

      {/* ======================================================
          EDIT SONG MODAL
          ====================================================== */}

      {editingSong && (
        <div className="admin-modal-overlay">

          <div className="admin-modal">

            <div className="admin-modal-header">

              <div>

                <h2>
                  Edit Song
                </h2>

                <p>
                  Update song information.
                </p>

              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={
                  handleCancelEdit
                }
                disabled={editLoading}
              >
                <X size={22} />
              </button>

            </div>

            <form
              onSubmit={handleSaveEdit}
              className="admin-edit-form"
            >

              <label>
                Song Title
              </label>

              <input
                type="text"
                value={editTitle}
                onChange={(event) =>
                  setEditTitle(
                    event.target.value
                  )
                }
                disabled={editLoading}
              />

              <label>
                Artist
              </label>

              <input
                type="text"
                value={editArtist}
                onChange={(event) =>
                  setEditArtist(
                    event.target.value
                  )
                }
                disabled={editLoading}
              />

              <label>
                Album
              </label>

              <input
                type="text"
                value={editAlbum}
                onChange={(event) =>
                  setEditAlbum(
                    event.target.value
                  )
                }
                disabled={editLoading}
              />

              <label>
                Duration (seconds)
              </label>

              <input
                type="number"
                min="0"
                value={editDuration}
                onChange={(event) =>
                  setEditDuration(
                    event.target.value
                  )
                }
                disabled={editLoading}
              />

              <div className="admin-edit-actions">

                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={
                    handleCancelEdit
                  }
                  disabled={editLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-save-button"
                  disabled={editLoading}
                >
                  <Save size={17} />

                  {editLoading
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ======================================================
          EDIT USER MODAL
          ====================================================== */}

      {editingUser && (
        <div className="admin-modal-overlay">

          <div className="admin-modal">

            <div className="admin-modal-header">

              <div>

                <h2>
                  Edit User
                </h2>

                <p>
                  Update user information
                  and permissions.
                </p>

              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={
                  handleCancelUserEdit
                }
                disabled={
                  userEditLoading
                }
              >
                <X size={22} />
              </button>

            </div>

            <form
              onSubmit={handleSaveUser}
              className="admin-edit-form"
            >

              <label>
                Username
              </label>

              <input
                type="text"
                value={editUsername}
                onChange={(event) =>
                  setEditUsername(
                    event.target.value
                  )
                }
                disabled={
                  userEditLoading
                }
              />

              <label>
                Email
              </label>

              <input
                type="email"
                value={editEmail}
                onChange={(event) =>
                  setEditEmail(
                    event.target.value
                  )
                }
                disabled={
                  userEditLoading
                }
              />

              <label>
                Display Name
              </label>

              <input
                type="text"
                value={editDisplayName}
                onChange={(event) =>
                  setEditDisplayName(
                    event.target.value
                  )
                }
                disabled={
                  userEditLoading
                }
              />

              {/* ==================================================
                  ADMIN PERMISSION

                  CURRENT USER:
                  No checkbox.

                  OTHER USERS:
                  Checkbox appears.
                  ================================================== */}

              {editingUser?.id?.toString() ===
              currentUserId?.toString() ? (
                <p className="admin-form-note">
                  You are currently an
                  administrator.
                </p>
              ) : (
                <label className="admin-checkbox-label">

                  <input
                    type="checkbox"
                    checked={editIsAdmin}
                    onChange={(event) =>
                      setEditIsAdmin(
                        event.target.checked
                      )
                    }
                    disabled={
                      userEditLoading
                    }
                  />

                  <span>
                    Is Admin
                  </span>

                </label>
              )}

              <div className="admin-edit-actions">

                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={
                    handleCancelUserEdit
                  }
                  disabled={
                    userEditLoading
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-save-button"
                  disabled={
                    userEditLoading
                  }
                >
                  <Save size={17} />

                  {userEditLoading
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ======================================================
          RESET PASSWORD MODAL
          ====================================================== */}

      {passwordUser && (
        <div className="admin-modal-overlay">

          <div className="admin-modal">

            <div className="admin-modal-header">

              <div>

                <h2>
                  Reset Password
                </h2>

                <p>
                  Set a new password for{" "}
                  <strong>
                    {
                      passwordUser.username
                    }
                  </strong>
                  .
                </p>

              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={
                  handleCancelPasswordReset
                }
                disabled={
                  passwordLoading
                }
              >
                <X size={22} />
              </button>

            </div>

            <form
              onSubmit={
                handleResetPassword
              }
              className="admin-edit-form"
            >

              <label>
                New Password
              </label>

              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(
                    event.target.value
                  )
                }
                disabled={
                  passwordLoading
                }
                minLength={6}
              />

              <p className="admin-form-note">
                Password must be at least
                6 characters.
              </p>

              <div className="admin-edit-actions">

                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={
                    handleCancelPasswordReset
                  }
                  disabled={
                    passwordLoading
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-save-button"
                  disabled={
                    passwordLoading
                  }
                >
                  <KeyRound size={17} />

                  {passwordLoading
                    ? "Resetting..."
                    : "Reset Password"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </main>
  );
}

export default Admin;
