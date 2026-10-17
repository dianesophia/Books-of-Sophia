import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/appLayout";

import Login from "./features/auth/pages/login";
import Signup from "./features/auth/pages/signup";
import ForgotPassword from "./features/auth/pages/forgotpassword";
import ResetPassword from "./features/auth/pages/resetpassword";

import Home from "./features/home/pages/home";
import Library from "./features/library/pages/library"; 
import Journal from "./features/journal/pages/journal";
import Garden from "./features/garden/pages/garden";
import Achievements from "./features/achievements/pages/achievements";
import Games from "./features/games/pages/games";
import Profile from "./features/profile/pages/profile";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      <Route element={<AppLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/garden" element={<Garden />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/games" element={<Games />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

    </Routes>
  );
}

export default App;