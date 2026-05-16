import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";

const PrivateRoute = ({ children, allowedRole, allowedRoles }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0A0F1E] flex items-center justify-center z-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    // Redirect to login based on allowedRole or allowedRoles
    let loginPath = "/login/patient";
    if (allowedRole === "doctor" || (allowedRoles && allowedRoles.includes("doctor"))) {
      loginPath = "/login/doctor";
    }
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (allowedRoles) {
    if (!allowedRoles.includes(role)) {
      console.warn(`Access denied. Required roles: ${allowedRoles}, Current role: ${role}`);
      return <Navigate to="/" replace />;
    }
  } else if (allowedRole && role !== allowedRole) {
    // User exists but role doesn't match
    console.warn(`Access denied. Required role: ${allowedRole}, Current role: ${role}`);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
