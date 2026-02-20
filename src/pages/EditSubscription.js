import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function EditSubscription() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/subscriptions/detail/${id}`)
      .then(res => setForm(res.data.subscription));
  }, [id]);

  if (!form) return <p>Loading...</p>;

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    await axios.put(
      `http://localhost:5000/api/subscriptions/update/${id}`,
      form
    );

    alert("Subscription updated");
    navigate(`/subscription/${id}`);
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Edit Subscription</h2>

      <form onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} /><br /><br />
        <input name="category" value={form.category} onChange={handleChange} /><br /><br />
        <input name="plan" value={form.plan} onChange={handleChange} /><br /><br />
        <input name="amount" value={form.amount} onChange={handleChange} /><br /><br />
        <input type="date" name="startDate" value={form.startDate.slice(0,10)} onChange={handleChange} /><br /><br />
        <input type="date" name="renewalDate" value={form.renewalDate.slice(0,10)} onChange={handleChange} /><br /><br />

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}

export default EditSubscription;
