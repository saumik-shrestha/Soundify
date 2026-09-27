import "./profile.css";

import {
  User,
  Mail,
  Lock,
  Save,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  getProfile,
  updateProfile,
  changePassword,
} from "../services/profileService";


function Profile({
  user,
  onUserUpdated,
}) {

  const [profile, setProfile] =
    useState(null);

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [displayName, setDisplayName] =
    useState("");

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [passwordSaving, setPasswordSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {

    const loadProfile =
      async () => {

        try {

          setLoading(true);

          const data =
            await getProfile();

          setProfile(data);

          setUsername(
            data.username || ""
          );

          setEmail(
            data.email || ""
          );

          setDisplayName(
            data.displayName || ""
          );

        } catch (error) {

          console.error(
            "Profile loading error:",
            error
          );

          setError(
            error.response?.data?.message ||
            "Unable to load profile."
          );

        } finally {

          setLoading(false);

        }

      };


    loadProfile();

  }, []);


  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  const handleSaveProfile =
    async (event) => {

      event.preventDefault();

      setMessage("");
      setError("");

      if (!username.trim()) {

        setError(
          "Username is required."
        );

        return;

      }

      if (!email.trim()) {

        setError(
          "Email is required."
        );

        return;

      }


      try {

        setSaving(true);

        const response =
          await updateProfile({

            username:
              username.trim(),

            email:
              email.trim(),

            displayName:
              displayName.trim(),

          });


        setProfile(
          response.user
        );

        setUsername(
          response.user.username
        );

        setEmail(
          response.user.email
        );

        setDisplayName(
          response.user.displayName || ""
        );


        if (onUserUpdated) {

          onUserUpdated(
            response.user
          );

        }


        setMessage(
          "Profile updated successfully."
        );

      } catch (error) {

        console.error(
          "Profile update error:",
          error
        );

        setError(
          error.response?.data?.message ||
          "Unable to update profile."
        );

      } finally {

        setSaving(false);

      }

    };


  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const handleChangePassword =
    async (event) => {

      event.preventDefault();

      setMessage("");
      setError("");


      if (!currentPassword) {

        setError(
          "Enter your current password."
        );

        return;

      }


      if (!newPassword) {

        setError(
          "Enter a new password."
        );

        return;

      }


      if (newPassword.length < 6) {

        setError(
          "New password must be at least 6 characters."
        );

        return;

      }


      if (
        newPassword !==
        confirmPassword
      ) {

        setError(
          "New passwords do not match."
        );

        return;

      }


      try {

        setPasswordSaving(true);

        await changePassword({

          currentPassword,

          newPassword,

        });


        setCurrentPassword("");

        setNewPassword("");

        setConfirmPassword("");


        setMessage(
          "Password changed successfully."
        );

      } catch (error) {

        console.error(
          "Password change error:",
          error
        );

        setError(
          error.response?.data?.message ||
          "Unable to change password."
        );

      } finally {

        setPasswordSaving(false);

      }

    };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <main className="profile-page">

        <div className="profile-loading">

          Loading profile...

        </div>

      </main>

    );

  }


  return (

    <main className="profile-page">

      <div className="profile-header">

        <div className="profile-avatar">

          <User
            size={48}
          />

        </div>


        <div>

          <p className="profile-label">
            ACCOUNT
          </p>

          <h1>
            Profile
          </h1>

          <p className="profile-subtitle">

            Manage your Soundify account

          </p>

        </div>

      </div>


      {message && (

        <div className="profile-success">

          {message}

        </div>

      )}


      {error && (

        <div className="profile-error">

          {error}

        </div>

      )}


      {/* =================================================
          PROFILE INFORMATION
      ================================================= */}

      <section className="profile-section">

        <div className="profile-section-title">

          <User
            size={22}
          />

          <h2>
            Profile information
          </h2>

        </div>


        <form
          className="profile-form"
          onSubmit={
            handleSaveProfile
          }
        >

          <label>

            Display name

            <input
              type="text"
              value={displayName}
              onChange={(event) =>
                setDisplayName(
                  event.target.value
                )
              }
              placeholder="Your display name"
              disabled={saving}
            />

          </label>


          <label>

            Username

            <input
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(
                  event.target.value
                )
              }
              placeholder="Your username"
              disabled={saving}
            />

          </label>


          <label>

            Email

            <div className="profile-input-icon">

              <Mail
                size={17}
              />

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="Your email"
                disabled={saving}
              />

            </div>

          </label>


          <button
            type="submit"
            className="profile-save-button"
            disabled={saving}
          >

            <Save
              size={18}
            />

            {saving
              ? "Saving..."
              : "Save changes"}

          </button>

        </form>

      </section>


      {/* =================================================
          PASSWORD
      ================================================= */}

      <section className="profile-section">

        <div className="profile-section-title">

          <Lock
            size={22}
          />

          <h2>
            Change password
          </h2>

        </div>


        <form
          className="profile-form"
          onSubmit={
            handleChangePassword
          }
        >

          <label>

            Current password

            <input
              type="password"
              value={currentPassword}
              onChange={(event) =>
                setCurrentPassword(
                  event.target.value
                )
              }
              placeholder="Current password"
              disabled={
                passwordSaving
              }
            />

          </label>


          <label>

            New password

            <input
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(
                  event.target.value
                )
              }
              placeholder="At least 6 characters"
              disabled={
                passwordSaving
              }
            />

          </label>


          <label>

            Confirm new password

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              placeholder="Confirm new password"
              disabled={
                passwordSaving
              }
            />

          </label>


          <button
            type="submit"
            className="profile-save-button"
            disabled={
              passwordSaving
            }
          >

            <Lock
              size={18}
            />

            {passwordSaving
              ? "Changing..."
              : "Change password"}

          </button>

        </form>

      </section>


      {/* =================================================
          ACCOUNT DETAILS
      ================================================= */}

      {profile && (

        <section className="profile-section">

          <div className="profile-section-title">

            <Mail
              size={22}
            />

            <h2>
              Account details
            </h2>

          </div>


          <div className="account-details">

            <div>

              <span>
                Account created
              </span>

              <strong>
                {new Date(
                  profile.createdAt
                ).toLocaleDateString()}
              </strong>

            </div>


            <div>

              <span>
                Account type
              </span>

              <strong>
                {profile.isAdmin
                  ? "Administrator"
                  : "User"}
              </strong>

            </div>

          </div>

        </section>

      )}

    </main>

  );

}


export default Profile;