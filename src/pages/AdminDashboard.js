import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminDashboard() {
  const [stats, setStats] = useState({
  total: 0,
  active: 0,
  expiringSoon: 0,
  expired: 0
});

  const [selectedType, setSelectedType] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);

  /* ================= FETCH STATS ================= */
  useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/stats");
      setStats(res.data.stats);
    } catch (err) {
      console.error("Failed to fetch stats");
    }
  };

  fetchStats();
}, []);


  /* ================= FETCH FILTERED SUBSCRIPTIONS ================= */
  const fetchSubscriptions = async (type) => {
    setSelectedType(type);
    setSelectedSub(null);

    try {
      const res = await axios.get(
        `http://localhost:5000/api/admin/subscriptions/${type}`
      );

      if (res.data.success) {
        setSubscriptions(res.data.subscriptions);
      }
    } catch (err) {
      console.error("Failed to load subscriptions");
    }
  };

  return (
    <div style={styles.container}>
      <h1>🛠 Admin Dashboard</h1>

      {/* ================= STATS CARDS ================= */}
      <div style={styles.cardGrid}>
        <StatCard
          label="Total"
          count={stats.total || 0}
          onClick={() => fetchSubscriptions("all")}
        />
        <StatCard
          label="Active"
          count={stats.active || 0}
          onClick={() => fetchSubscriptions("active")}
        />
        <StatCard
          label="Expiring Soon"
          count={stats.expiringSoon || 0}
          onClick={() => fetchSubscriptions("expiring")}
        />
        <StatCard
          label="Expired"
          count={stats.expired || 0}
          onClick={() => fetchSubscriptions("expired")}
        />
      </div>

      {/* ================= SUBSCRIPTION LIST ================= */}
      {selectedType && (
        <>
          <h2 style={{ marginTop: "40px" }}>
            {selectedType.toUpperCase()} SUBSCRIPTIONS
          </h2>

          <div style={styles.subGrid}>
            {subscriptions.map((sub) => (
              <div
                key={sub._id}
                style={styles.subCard}
                onClick={() => {
  setSelectedSub(sub);
}}

              >
                <h3>{sub.name}</h3>
<p>Plan: {sub.plan}</p>
<p style={{ fontWeight: "bold", marginTop: "8px" }}>
  👥 Subscribers: {sub.count}
</p>

              </div>
            ))}
          </div>
        </>
      )}

      {/* ================= USER DETAILS ================= */}
{selectedSub && (
  <div style={styles.detailsBox}>
    <h2>👥 Subscribers List</h2>

    {selectedSub.users.map((user, index) => (
      <div key={index} style={{ marginBottom: "15px" }}>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>

        <button
          style={{
            marginTop: "8px",
            padding: "6px 12px",
            backgroundColor: "red",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
          onClick={async () => {
            if (!window.confirm("Are you sure you want to delete this subscription?"))
              return;

            try {
              await axios.delete(
                `http://localhost:5000/api/subscriptions/delete/${user.subscriptionId}`
              );

              alert("Subscription deleted successfully");

              // Refresh subscription list
              fetchSubscriptions(selectedType);

              // Refresh stats
              const statsRes = await axios.get(
                "http://localhost:5000/api/admin/stats"
              );
              setStats(statsRes.data.stats);

              setSelectedSub(null);

            } catch (err) {
              alert("Failed to delete subscription");
            }
          }}
        >
          Delete Subscription
        </button>

        <hr />
      </div>
    ))}
  </div>
)}


    </div>
  );
}

/* ================= SMALL COMPONENT ================= */
function StatCard({ label, count, onClick }) {
  return (
    <div style={styles.statCard} onClick={onClick}>
      <h2>{count}</h2>
      <p>{label}</p>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  container: {
    padding: "50px",
    background: "#f8fafc",
    minHeight: "100vh"
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginTop: "30px"
  },
  statCard: {
    background: "#0f172a",
    color: "white",
    borderRadius: "50px",
    padding: "30px",
    textAlign: "center",
    cursor: "pointer",
    transition: "0.3s"
  },
  subGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "20px",
    marginTop: "20px"
  },
  subCard: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    cursor: "pointer"
  },
  detailsBox: {
    marginTop: "40px",
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
  }
};

export default AdminDashboard;
