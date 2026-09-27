
import "./login.css";
import { useState } from "react";
import { Music2 } from "lucide-react";
import { login } from "../services/authService";

function Login({ onLogin, onShowRegister }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");

    if (!usernameOrEmail.trim() || !password) {
      setError(
        "Please enter your username/email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const data = await login({
        usernameOrEmail: usernameOrEmail.trim(),
        password,
      });

      // ============================================================
      // CHECK LOGIN RESPONSE
      // ============================================================

      console.log(
        "LOGIN RESPONSE:",
        data
      );

      console.log(
        "LOGIN USER:",
        data.user
      );

      // ============================================================
      // SAVE LOGIN TOKEN
      // ============================================================

      localStorage.setItem(
        "soundifyToken",
        data.token
      );

      // ============================================================
      // SEND USER TO APP
      // ============================================================

      onLogin(data.user);

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      const message =
        error.response?.data?.message ||
        "Unable to login. Please check your credentials.";

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

          <h1>
            Soundify
          </h1>

        </div>

        <h2>
          Log in to Soundify
        </h2>

        <form onSubmit={handleLogin}>

          <label>
            Username or Email
          </label>

          <input
            type="text"
            placeholder="Enter username or email"
            value={usernameOrEmail}
            onChange={(event) =>
              setUsernameOrEmail(
                event.target.value
              )
            }
            disabled={loading}
          />

          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
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
              ? "Logging in..."
              : "Log In"}
          </button>

        </form>

        <div className="login-register">

          <span>
            Don't have an account?
          </span>

          <button
            type="button"
            onClick={onShowRegister}
          >
            Register
          </button>

        </div>

      </div>

    </div>
  );
}

export default Login;
