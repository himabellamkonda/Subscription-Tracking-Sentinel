import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

function AddSubscription() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);

  // If coming from Edit Subscription
  const editingSubscription = location.state?.subscription || null;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const [form, setForm] = useState({
    name: editingSubscription?.name || "",
    category: editingSubscription?.category || "",
    plan: editingSubscription?.plan || "",
    amount: editingSubscription?.amount || "",
    startDate: editingSubscription
      ? editingSubscription.startDate.slice(0, 10)
      : "",
    renewalDate: editingSubscription
      ? editingSubscription.renewalDate.slice(0, 10)
      : "",
    alertDays: editingSubscription?.alertDays || "7"
  });

  if (!user) {
    return <p style={{ padding: "40px" }}>Loading...</p>;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingSubscription) {
        const res = await axios.put(
          `http://localhost:5000/api/subscriptions/update/${editingSubscription._id}`,
          { ...form, userId: user.id }
        );

        if (res.data.success) {
          alert("Subscription updated successfully");
          navigate(`/subscription/${editingSubscription._id}`);
        }
      } else {
        const res = await axios.post(
          "http://localhost:5000/api/subscriptions/add",
          { ...form, userId: user.id }
        );

        if (res.data.success) {
          alert("Subscription saved successfully");
          navigate("/dashboard");
        }
      }
    } catch (error) {
      alert("Failed to save subscription");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          {editingSubscription ? "Edit Subscription" : "Add Subscription"}
        </h2>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Subscription Name</label>
          <input
            style={styles.input}
            name="name"
            placeholder="Netflix, Prime, Spotify"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label style={styles.label}>Category</label>
          <select
            style={styles.input}
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Education">Education</option>
            <option value="Utility">Utility</option>
          </select>

          <label style={styles.label}>Plan Type</label>
          <select
            style={styles.input}
            name="plan"
            value={form.plan}
            onChange={handleChange}
            required
          >
            <option value="">Select Plan</option>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>

          <label style={styles.label}>Amount (₹)</label>
          <input
            style={styles.input}
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            required
          />

          <div style={styles.row}>
            <div>
              <label style={styles.label}>Start Date</label>
              <input
                style={styles.input}
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label style={styles.label}>Renewal Date</label>
              <input
                style={styles.input}
                type="date"
                name="renewalDate"
                value={form.renewalDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <label style={styles.label}>Alert Before</label>
          <div style={styles.radioGroup}>
            <label>
              <input
                type="radio"
                name="alertDays"
                value="7"
                checked={form.alertDays === "7"}
                onChange={handleChange}
              />{" "}
              7 Days
            </label>

            <label>
              <input
                type="radio"
                name="alertDays"
                value="3"
                checked={form.alertDays === "3"}
                onChange={handleChange}
              />{" "}
              3 Days
            </label>
          </div>

          <button style={styles.button} type="submit">
            {editingSubscription ? "Update Subscription" : "Save Subscription"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f1f5f9",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    background: "white",
    padding: "35px",
    width: "100%",
    maxWidth: "520px",
    borderRadius: "14px",
    boxShadow: "0 15px 30px rgba(0,0,0,0.1)"
  },
  title: {
    textAlign: "center",
    marginBottom: "25px"
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "600"
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "18px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px"
  },
  row: {
    display: "flex",
    gap: "15px"
  },
  radioGroup: {
    display: "flex",
    gap: "20px",
    marginBottom: "25px"
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer"
  }
};

export default AddSubscription;
