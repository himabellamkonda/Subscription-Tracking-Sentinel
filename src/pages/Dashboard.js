import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));

  const [profilePic, setProfilePic] = useState(null);



  const [activeView, setActiveView] = useState("welcome");
  const [subscriptions, setSubscriptions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  // ♻️ Auto-renew UI state (frontend only)

  /* ================= AUTH ================= */
  useEffect(() => {
    if (!user) navigate("/");
  }, [navigate, user]);




  useEffect(() => {
  if (!user) return;

  axios
    .get(`http://localhost:5000/api/auth/profile-pic/${user.id}`)
    .then((res) => {
      if (res.data.profilePic) {
        setProfilePic(res.data.profilePic);
      }
    });
}, [user]);


  /* ================= PROFILE PIC ================= */
  const handleProfileClick = () => fileInputRef.current.click();


const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = async () => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/auth/profile-pic/${user.id}`,
        { profilePic: reader.result }
      );

      if (res.data.success) {
        setProfilePic(res.data.profilePic);
      }
    } catch {
      alert("Failed to update profile and picture");
    }
  };

  reader.readAsDataURL(file);
};


  /* ================= SUBSCRIPTIONS ================= */
  const loadSubscriptions = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/subscriptions/user/${user.id}`
      );
      if (res.data.success) setSubscriptions(res.data.subscriptions);
    } catch {
      console.error("Failed to load subscriptions");
    }
  };

  /* ================= ALERTS ================= */
  const loadAlerts = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/subscriptions/user/${user.id}`
      );

      if (res.data.success) {
        const today = new Date();

        const alertList = res.data.subscriptions
          .map((sub) => {
            const diffDays = Math.ceil(
              (new Date(sub.renewalDate) - today) / (1000 * 60 * 60 * 24)
            );

            if (diffDays < 0) {
              return { ...sub, alertType: "EXPIRED", daysLeft: diffDays };
            }
            if (diffDays <= sub.alertDays) {
              return { ...sub, alertType: "EXPIRING", daysLeft: diffDays };
            }
            return null;
          })
          .filter(Boolean);

        setAlerts(alertList);
      }
    } catch {
      console.error("Failed to load alerts");
    }
  };

  const toggleEmailAlert = async (id) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/alerts/toggle/${id}`
      );
      if (res.data.success) {
        setAlerts((prev) =>
          prev.map((a) =>
            a._id === id
              ? { ...a, emailAlertEnabled: res.data.emailAlertEnabled }
              : a
          )
        );
      }
    } catch {
      alert("Failed to update alert setting");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  /* ================= STATS ================= */
  const total = subscriptions.length;
  const expiredSubs = subscriptions.filter(
    (s) => new Date(s.renewalDate) < new Date()
  );

  const expiringSoonSubs = subscriptions.filter((s) => {
    const diff =
      (new Date(s.renewalDate) - new Date()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= s.alertDays;
  });

  const active = total - expiredSubs.length;

  /* ================= COLOR ================= */
  const getSubscriptionStyle = (renewalDate) => {
    const diffDays = Math.ceil(
      (new Date(renewalDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 0)
      return { background: "#fee2e2", border: "2px solid #dc2626" };
    if (diffDays <= 7)
      return { background: "#ffedd5", border: "2px solid #f97316" };
    return { background: "#dcfce7", border: "2px solid #22c55e" };
  };

  /* ================= RENEW LOGIC (FRONTEND) ================= */

// Renew button click
const handleRenew = async (sub) => {
  try {
    await axios.put(
      `http://localhost:5000/api/subscriptions/renew/${sub._id}`
    );

    // Reload subscriptions after renew
    loadSubscriptions();
    loadAlerts();
  } catch (err) {
    alert("Failed to renew subscription");
  }
};

// Auto-renew toggle (UI only for now)
// ♻️ Toggle Auto-Renew (UI only)
const toggleAutoRenew = async (sub) => {
  try {
    const res = await axios.put(
      `http://localhost:5000/api/subscriptions/auto-renew/${sub._id}`
    );

    if (res.data.success) {
      setSubscriptions((prev) =>
        prev.map((s) =>
          s._id === sub._id
            ? { ...s, autoRenewEnabled: res.data.autoRenewEnabled }
            : s
        )
      );
    }
  } catch (err) {
    alert("Failed to update auto-renew setting");
  }
};



  return (
    <div style={styles.wrapper}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div>
          <div style={styles.profileSection}>
            <div
              style={{
                ...styles.profilePic,
                backgroundImage: profilePic ? `url(${profilePic})` : "none",
                border: profilePic ? "none" : "3px dashed #38bdf8"
              }}
              onClick={handleProfileClick}
            >
              {!profilePic && (
                <span style={styles.profileText}>
                  Add<br />Profile<br />Picture
                </span>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            <h2 style={styles.userName}>{user?.name}</h2>
          </div>

          <button
            style={styles.addBtn}
            onClick={() => navigate("/add-subscription")}
          >
            + Add Subscriptions
          </button>

          <ul style={styles.menu}>
            <li onClick={() => setActiveView("welcome")}>👤 My Profile</li>
            <li onClick={() => { setActiveView("subscriptions"); loadSubscriptions(); }}>
              📦 My Subscriptions
            </li>
            <li onClick={() => { setActiveView("alerts"); loadAlerts(); }}>
              🔔 Alert System
            </li>
            <li onClick={() => { setActiveView("renewals"); loadSubscriptions(); }}>
              ♻️ Renewal Subscriptions
            </li>
          </ul>
        </div>

        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        {/* 👤 My Profile */}
        {activeView === "welcome" && (
          <>
            <h1>👤 My Profile</h1>
            <div style={styles.cardBox}>
              <h2>Account Information</h2>
              <p><strong>Username:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Account Type:</strong> User</p>
              <p><strong>Account Status:</strong> Active</p>
            </div>

            <div style={styles.cardBox}>
              <h2>Subscription Summary</h2>
              <div style={styles.summaryGrid}>
                <div style={styles.summaryCard}>📦 Total<br /><strong>{total}</strong></div>
                <div style={styles.summaryCard}>🟢 Active<br /><strong>{active}</strong></div>
                <div style={styles.summaryCard}>🟠 Expiring Soon<br /><strong>{expiringSoonSubs.length}</strong></div>
                <div style={styles.summaryCard}>🔴 Expired<br /><strong>{expiredSubs.length}</strong></div>
              </div>
            </div>
          </>
        )}

        {/* 📦 My Subscriptions */}
        {activeView === "subscriptions" && (
          <>
            <h1>My Subscriptions</h1>
            <div style={styles.cardGrid}>
              {subscriptions.map((sub) => (
                <div
                  key={sub._id}
                  style={{ ...styles.card, ...getSubscriptionStyle(sub.renewalDate) }}
                  onClick={() => navigate(`/subscription/${sub._id}`)}
                >
                  <h3>{sub.name}</h3>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 🔔 Alert System */}
        {activeView === "alerts" && (
          <>
            <h1>🔔 Alert System</h1>
            <div style={styles.alertGrid}>
              {alerts.map((a) => (
                <div key={a._id} style={styles.alertCard}>
                  <h3>{a.name}</h3>
                  <p>
                    {a.alertType === "EXPIRED"
                      ? "Subscription expired"
                      : `Expires in ${a.daysLeft} day(s)`}
                  </p>
                  <button
                    onClick={() => toggleEmailAlert(a._id)}
                    style={{
                      background: a.emailAlertEnabled ? "#22c55e" : "#94a3b8",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "6px"
                    }}
                  >
                    {a.emailAlertEnabled ? "Email Alerts ON" : "Email Alerts OFF"}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

{/* ♻️ Renewal Subscriptions */}
{activeView === "renewals" && (
  <>
    <h1>♻️ Renewal Subscriptions</h1>

    {/* 🔴 Expired Subscriptions */}
    <h2>🔴 Expired Subscriptions</h2>
    <div style={styles.alertGrid}>
      {expiredSubs.length === 0 ? (
        <p>No expired subscriptions 🎉</p>
      ) : (
        expiredSubs.map((s) => (
          <div
            key={s._id}
            style={{ ...styles.alertCard, border: "2px solid #dc2626" }}
          >
            <h3>{s.name}</h3>

            <button
              style={styles.renewBtn}
              onClick={() => handleRenew(s)}
            >
              Renew
            </button>
          </div>
        ))
      )}
    </div>

    {/* 🟠 Expiring Soon */}
    <h2 style={{ marginTop: "30px" }}>🟠 Expiring Soon</h2>
    <div style={styles.alertGrid}>
      {expiringSoonSubs.length === 0 ? (
        <p>No subscriptions expiring soon 🎉</p>
      ) : (
        expiringSoonSubs.map((s) => (
          <div
            key={s._id}
            style={{ ...styles.alertCard, border: "2px solid #f97316" }}
          >
            <h3>{s.name}</h3>

            <button
  onClick={() => toggleAutoRenew(s)}
  style={{
    background: s.autoRenewEnabled ? "#22c55e" : "#94a3b8",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer"
  }}
>
  {s.autoRenewEnabled ? "Auto-Renew ON" : "Auto-Renew OFF"}
</button>



          </div>
        ))
      )}
    </div>
  </>
)}

      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  wrapper: { display: "flex", height: "100vh", background: "#f8fafc" },
  sidebar: {
    width: "260px",
    background: "#0f172a",
    color: "white",
    padding: "25px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  profileSection: { textAlign: "center" },
  profilePic: {
    width: "180px",
    height: "180px",
    borderRadius: "50%",
    backgroundSize: "cover",
    backgroundPosition: "center",
    margin: "0 auto",
    cursor: "pointer"
  },
  profileText: { color: "#38bdf8", fontSize: "14px" },
  userName: { marginTop: "10px", fontSize: "22px", fontWeight: "bold" },
  addBtn: {
    marginTop: "15px",
    padding: "12px",
    background: "#38bdf8",
    border: "none",
    borderRadius: "8px",
    color: "white",
    width: "100%"
  },
  menu: { listStyle: "none", padding: 0, marginTop: "35px", lineHeight: "2.5" },
  logoutBtn: {
    padding: "12px",
    background: "#ef4444",
    border: "none",
    borderRadius: "8px",
    color: "white"
  },
  main: { flex: 1, padding: "50px" },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "20px",
    marginTop: "30px"
  },
  card: { padding: "25px", borderRadius: "10px", textAlign: "center" },
  cardBox: {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    marginBottom: "30px"
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginTop: "15px"
  },
  summaryCard: {
    background: "#f1f5f9",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center"
  },
  alertGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "20px",
    marginTop: "25px"
  },
  alertCard: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
  },
  renewBtn: {
    marginTop: "10px",
    background: "#dc2626",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px"
  },
  autoRenewBtn: {
    marginTop: "10px",
    background: "#94a3b8",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px"
  }
};

export default Dashboard;
