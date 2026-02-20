import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* ================= LOGIN ================= */
  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user));

        if (res.data.user.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        alert(res.data.message);
      }
    } catch {
      alert("Invalid email or password");
    }
  };

  /* ================= REGISTER ================= */
  const handleRegister = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        { name, email, password }
      );

      alert(res.data.message);

      if (res.data.success) {
        setMode("login");
        setName("");
        setPassword("");
      }
    } catch {
      alert("Registration failed");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          {mode === "login" ? "Login" : "Register"}
        </h2>

        {mode === "register" && (
          <div style={styles.inputGroup}>
            <label style={styles.label}>Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
            />
          </div>
        )}

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
        </div>

        <button
          style={styles.button}
          onClick={mode === "login" ? handleLogin : handleRegister}
        >
          {mode === "login" ? "Login" : "Register"}
        </button>

        <p style={styles.switchText}>
          {mode === "login" ? (
            <>
              New user?{" "}
              <span
                style={styles.link}
                onClick={() => setMode("register")}
              >
                Create an account
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                style={styles.link}
                onClick={() => setMode("login")}
              >
                Login
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)"
  },
  card: {
    width: "380px",
    padding: "40px",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
  },
  title: {
    textAlign: "center",
    marginBottom: "25px",
    fontWeight: "600"
  },
  inputGroup: {
    marginBottom: "18px"
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    display: "block",
    marginBottom: "6px"
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    outline: "none",
    fontSize: "14px"
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
    fontSize: "15px"
  },
  switchText: {
    marginTop: "18px",
    textAlign: "center",
    fontSize: "14px"
  },
  link: {
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: "600"
  }
};

export default Login;
