import { useState, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../assets/glassLogo.jpg";
import ipAddress from "./config"; // ensure HTTPS in prod
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      const resp = await fetch(`${ipAddress}/login_verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!resp.ok) throw new Error("Invalid username or password");
      const data = await resp.json();

      // save to context + localStorage
      login(data);

      // fire-and-forget device token
      fetch(`${ipAddress}/save_push_token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          deviceMake: "Computer",
          deviceModel: "Web Browser",
          token: "NOT_APPLICABLE",
        }),
      }).catch(() => {});

      navigate("/", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = username.trim() && password.trim() && !loading;

  return (
    <div className="d-flex justify-content-center align-items-center"
         style={{ backgroundColor: "#000", height: "100vh", color: "#fff" }}>
      <div className="text-center" style={{ maxWidth: 400, padding: "2rem" }}>
        <h2 className="mb-3 text-light">Reaching the Nations</h2>
        <img src={logo} alt="Logo" className="mb-3 rounded" width="150" />

        <div className="form-floating mb-3 text-dark">
          <input
            type="text"
            className="form-control"
            id="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <label htmlFor="username">Username</label>
        </div>

        <div className="form-floating mb-3 text-dark">
          <input
            type="password"
            className="form-control"
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <label htmlFor="password">Password</label>
        </div>

        <button
          className="btn w-100"
          style={{ backgroundColor: "#ea5a28", color: "#000", fontWeight: "bold" }}
          onClick={handleLogin}
          disabled={!canSubmit}
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        {!!errorMsg && <div className="text-danger mt-3">❌ {errorMsg}</div>}
      </div>
    </div>
  );
}