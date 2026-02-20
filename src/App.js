import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddSubscription from "./pages/AddSubscription";
import MySubscriptions from "./pages/MySubscriptions";
import SubscriptionDetails from "./pages/SubscriptionDetails";
import EditSubscription from "./pages/EditSubscription";
import AdminDashboard from "./pages/AdminDashboard";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-subscription" element={<AddSubscription />} />
        <Route path="/my-subscriptions" element={<MySubscriptions />} />
        <Route path="/subscription/:id" element={<SubscriptionDetails />} />
        <Route path="/edit-subscription/:id" element={<EditSubscription />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
