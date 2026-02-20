import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function SubscriptionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH DETAILS ================= */
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/subscriptions/detail/${id}`
        );
        if (res.data.success) {
          setSub(res.data.subscription);
        }
      } catch (err) {
        console.error("Failed to load subscription details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  /* ================= DELETE SUBSCRIPTION ================= */
  const handleDelete = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete this subscription permanently?"
    );

    if (!confirm) return;

    try {
      const res = await axios.delete(
        `http://localhost:5000/api/subscriptions/delete/${id}`
      );

      if (res.data.success) {
        alert("Subscription deleted successfully");
        navigate("/dashboard");
      }
    } catch (error) {
      alert("Failed to delete subscription");
    }
  };

  /* ================= EDIT SUBSCRIPTION ================= */
  const handleEdit = () => {
  navigate("/add-subscription", { state: { subscription: sub } });
};

  if (loading) {
    return <div style={{ padding: "40px" }}>Loading...</div>;
  }

  if (!sub) {
    return <div style={{ padding: "40px" }}>Subscription not found.</div>;
  }

  /* ================= DATE & STATUS LOGIC ================= */
  const today = new Date();
  const startDate = new Date(sub.startDate);
  const renewalDate = new Date(sub.renewalDate);

  const totalDays =
    Math.ceil((renewalDate - startDate) / (1000 * 60 * 60 * 24)) || 1;
  const usedDays = Math.max(
    0,
    Math.ceil((today - startDate) / (1000 * 60 * 60 * 24))
  );
  const remainingDays = Math.max(0, totalDays - usedDays);

  const status = remainingDays === 0 ? "Expired" : "Active";

  /* ================= USAGE INSIGHTS ================= */
  const usagePercent = Math.min(100, Math.round((usedDays / totalDays) * 100));
  let usageLevel = "Low";
  if (usagePercent > 60) usageLevel = "High";
  else if (usagePercent > 30) usageLevel = "Moderate";

  const costPerDay = (sub.amount / totalDays).toFixed(2);

  return (
    <div style={styles.container}>
      {/* TITLE */}
      <h1 style={styles.title}>{sub.name}</h1>

      {/* BASIC DETAILS */}
      <section style={styles.section}>
        <h2>Basic Details</h2>
        <Detail label="Subscription Name" value={sub.name} />
        <Detail label="Status" value={status} />
        <Detail label="Category" value={sub.category} />
        <Detail label="Current Plan" value={sub.plan} />
        <Detail label="Package Amount" value={`₹ ${sub.amount}`} />
        <Detail label="Start Date" value={startDate.toDateString()} />
        <Detail label="Renewal Date" value={renewalDate.toDateString()} />
      </section>

      {/* USAGE INSIGHTS */}
      <section style={styles.section}>
        <h2>Usage Insights</h2>
        <Detail label="Usage Level" value={usageLevel} />
        <Detail label="Days Used" value={`${usedDays} / ${totalDays}`} />
        <Detail label="Estimated Cost / Day" value={`₹ ${costPerDay}`} />

        <div style={{ marginTop: "15px" }}>
          <div style={styles.usageBarContainer}>
            <div
              style={{
                ...styles.usageBar,
                width: `${usagePercent}%`
              }}
            />
          </div>
          <p style={styles.helperText}>
            Usage is estimated based on subscription duration.
            Real-time tracking will be added later.
          </p>
        </div>
      </section>

      {/* COST INSIGHTS */}
      <section style={styles.section}>
        <h2>Cost Insights</h2>
        <p>Remaining Days: {remainingDays}</p>

        <div style={styles.barContainer}>
          <div
            style={{
              ...styles.bar,
              width: `${Math.min(100, remainingDays * 3)}%`
            }}
          />
        </div>
      </section>

      {/* ACTIONS */}
      <section style={styles.section}>
        <h2>Actions</h2>
        <button
  style={styles.editBtn}
  onClick={handleEdit}
>
  Edit Subscription
</button>

        <button style={styles.deleteBtn} onClick={handleDelete}>
          Delete Subscription
        </button>
      </section>

      <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>
    </div>
  );
}

/* ================= REUSABLE ROW ================= */
function Detail({ label, value }) {
  return (
    <div style={styles.row}>
      <span>{label}:</span>
      <strong>{value}</strong>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  container: {
    padding: "40px",
    maxWidth: "900px",
    margin: "auto"
  },
  title: {
    textAlign: "center",
    marginBottom: "30px"
  },
  section: {
    marginBottom: "35px",
    padding: "20px",
    background: "#f8fafc",
    borderRadius: "10px"
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px"
  },
  usageBarContainer: {
    height: "16px",
    background: "#e5e7eb",
    borderRadius: "8px",
    overflow: "hidden"
  },
  usageBar: {
    height: "100%",
    background: "#3b82f6"
  },
  helperText: {
    marginTop: "8px",
    fontSize: "13px",
    color: "#64748b"
  },
  barContainer: {
    height: "18px",
    background: "#e5e7eb",
    borderRadius: "10px",
    overflow: "hidden"
  },
  bar: {
    height: "100%",
    background: "#22c55e"
  },
  editBtn: {
    padding: "10px 15px",
    marginRight: "10px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  deleteBtn: {
    padding: "10px 15px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  backBtn: {
    marginTop: "20px",
    padding: "10px",
    border: "none",
    background: "#0f172a",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer"
  }
};

export default SubscriptionDetails;
