import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { authAPI } from "./services/api";

// Pages
import Landing   from "./pages/Landing";
import Login     from "./pages/Login";
import Signup    from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Analysis  from "./pages/Analysis";
import Roadmap   from "./pages/Roadmap";
import StudyPlan from "./pages/StudyPlan";
import Interview from "./pages/Interview";
import Assistant from "./pages/Assistant";
import Community from "./pages/Community";
import Chat      from "./pages/Chat";
import Jobs      from "./pages/Jobs";
import Challenges from "./pages/Challenges";
import Certificates from "./pages/Certificates";
import Leaderboard  from "./pages/Leaderboard";
import Events    from "./pages/Events";
import Mentors   from "./pages/Mentors";
import Profile   from "./pages/Profile";
import OAuthCallback from "./pages/OAuthCallback";
import ResumeMatch from "./pages/ResumeMatch";
import Departments from "./pages/Departments";
import MentorLogin from "./pages/MentorLogin";
import MentorDashboard from "./pages/MentorDashboard";

const Spinner = () => (
  <div style={{ minHeight:"100vh", background:"#060d1a", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"1rem" }}>
    <div className="spinner"/>
    <p style={{ color:"#5a7196", fontSize:".88rem" }}>Loading SkillGraph AI...</p>
  </div>
);

const Guard = ({ children }) => {
  const { isAuth, loading } = useAuth();
  if (loading) return <Spinner/>;
  return isAuth ? children : <Navigate to="/login" replace/>;
};

const Public = ({ children }) => {
  const { isAuth, loading } = useAuth();
  if (loading) return null;
  return isAuth ? <Navigate to="/dashboard" replace/> : children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"             element={<Public><Landing/></Public>}/>
      <Route path="/login"        element={<Public><Login/></Public>}/>
      <Route path="/signup"       element={<Public><Signup/></Public>}/>
      <Route path="/oauth-callback" element={<OAuthCallback/>}/>
      <Route path="/dashboard"    element={<Guard><Dashboard/></Guard>}/>
      <Route path="/analysis"     element={<Guard><Analysis/></Guard>}/>
      <Route path="/roadmap"      element={<Guard><Roadmap/></Guard>}/>
      <Route path="/study-plan"   element={<Guard><StudyPlan/></Guard>}/>
      <Route path="/interview"    element={<Guard><Interview/></Guard>}/>
      <Route path="/assistant"    element={<Guard><Assistant/></Guard>}/>
      <Route path="/community"    element={<Guard><Community/></Guard>}/>
      <Route path="/chat"         element={<Guard><Chat/></Guard>}/>
      <Route path="/jobs"         element={<Guard><Jobs/></Guard>}/>
      <Route path="/challenges"   element={<Guard><Challenges/></Guard>}/>
      <Route path="/certificates" element={<Guard><Certificates/></Guard>}/>
      <Route path="/leaderboard"  element={<Guard><Leaderboard/></Guard>}/>
      <Route path="/events"       element={<Guard><Events/></Guard>}/>
      <Route path="/mentors"      element={<Guard><Mentors/></Guard>}/>
      <Route path="/profile"      element={<Guard><Profile/></Guard>}/>
      <Route path="/resume-match" element={<Guard><ResumeMatch/></Guard>}/>
      <Route path="/departments"  element={<Guard><Departments/></Guard>}/>
      <Route path="/mentor/login"     element={<Public><MentorLogin/></Public>}/>
      <Route path="/mentor/dashboard" element={<MentorDashboard/>}/>
      <Route path="*"             element={<Navigate to="/" replace/>}/>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes/>
      </BrowserRouter>
    </AuthProvider>
  );
}
