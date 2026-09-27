import "./login.css";
import { useState } from "react";
import { Music2 } from "lucide-react";
import { register } from "../services/authService";

function Register({ onRegister, onShowLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (event) => {
    event.preventDefault();

    setError("");

    if (
      !username.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const data = await register({
        username: username.trim(),
        email: email.trim(),
        password,
        displayName:
          displayName.trim() || username.trim(),
      });

      onShowLogin();
    } catch (error) {
      console.error("Registration error:", error);

      const message =
        error.response?.data?.message ||
        "Unable to create account.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">

        <div className="login-logo">
          <Music2 size={40} />
          <h1>Soundify</h1>
        </div>

        <h2>Create your account</h2>

        <form onSubmit={handleRegister}>

          <label>Username</label>

          <input
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(event) =>
              setUsername(event.target.value)
            }
            disabled={loading}
          />

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            disabled={loading}
          />

          <label>Display Name</label>

          <input
            type="text"
            placeholder="Your display name"
            value={displayName}
            onChange={(event) =>
              setDisplayName(event.target.value)
            }
            disabled={loading}
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            disabled={loading}
          />

          <label>Confirm Password</label>

          <input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            disabled={loading}
          />

          {error && (
            <div
              style={{
                color: "#ff6b6b",
                fontSize: "14px",
                marginTop: "15px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>

        </form>

        <div className="login-register">

          <span>
            Already have an account?
          </span>

          <button
            type="button"
            onClick={onShowLogin}
          >
            Log In
          </button>

        </div>

      </div>
    </div>
  );
}

export default Register;