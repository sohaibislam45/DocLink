import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(localStorage.getItem("doclink_role"));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setRole(null);
        localStorage.removeItem("doclink_role");
      } else {
        // Role is usually set during login, but we sync it from localStorage here
        const savedRole = localStorage.getItem("doclink_role");
        setRole(savedRole);
        
        // Sync patient profile if role is patient
        if (savedRole === "patient") {
          try {
            const { createOrFetchPatient } = await import("../api/patients");
            await createOrFetchPatient({
              name: currentUser.displayName,
              email: currentUser.email
            });
          } catch (error) {
            console.error("Error syncing patient profile:", error);
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("doclink_role");
      setRole(null);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const loginWithRole = (userObj, userRole) => {
    setUser(userObj);
    setRole(userRole);
    localStorage.setItem("doclink_role", userRole);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, logout, loginWithRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
