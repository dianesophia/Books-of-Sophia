import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./features/auth/pages/login";
import Signup from "./features/auth/pages/signup";
import ForgotPassword from "./features/auth/pages/forgotpassword";
import ResetPassword from "./features/auth/pages/resetpassword";
import Home from "./features/home/pages/home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}

export default App;