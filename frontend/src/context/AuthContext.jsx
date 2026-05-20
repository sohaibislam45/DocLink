import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import { initSocket, disconnectSocket } from "../lib/socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(localStorage.getItem("doclink_role"));
  const [profile, setProfile] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProfile = async (currentUser, currentRole) => {
    if (!currentUser || !currentRole) {
      setProfile(null);
      return;
    }
    try {
      if (currentRole === "patient") {
        const { fetchPatientProfile } = await import("../api/patients");
        const data = await fetchPatientProfile();
        setProfile(data);
      } else if (currentRole === "doctor") {
        const { fetchDoctorById } = await import("../api/doctors");
        const data = await fetchDoctorById(currentUser.uid);
        setProfile(data);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Error fetching profile from MongoDB:", error);
    }
  };

  const refreshProfile = () => {
    if (user && role) {
      fetchProfile(user, role);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setRole(null);
        setProfile(null);
        localStorage.removeItem("doclink_role");
        disconnectSocket();
        setSocket(null);
      } else {
        // Role is usually set during login, but we sync it from localStorage here
        const savedRole = localStorage.getItem("doclink_role");
        setRole(savedRole);
        
        // Initialize socket
        try {
          const token = await currentUser.getIdToken();
          const sock = initSocket(token);
          setSocket(sock);
        } catch (error) {
          console.error("Error initializing socket:", error);
        }

        // Sync patient profile if role is patient
        if (savedRole === "patient") {
          try {
            const { createOrFetchPatient } = await import("../api/patients");
            const data = await createOrFetchPatient({
              name: currentUser.displayName,
              email: currentUser.email,
              photoURL: currentUser.photoURL
            });
            setProfile(data);
          } catch (error) {
            console.error("Error syncing patient profile:", error);
            fetchProfile(currentUser, savedRole);
          }
        }

        // Sync doctor profile if role is doctor
        if (savedRole === "doctor") {
          try {
            const { syncDoctorProfile } = await import("../api/doctors");
            const data = await syncDoctorProfile();
            setProfile(data);
          } catch (error) {
            console.error("Error syncing doctor profile:", error);
            fetchProfile(currentUser, savedRole);
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
      setProfile(null);
      disconnectSocket();
      setSocket(null);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const loginWithRole = async (userObj, userRole) => {
    setUser(userObj);
    setRole(userRole);
    localStorage.setItem("doclink_role", userRole);
    
    // Ensure socket is initialized after login
    try {
      const token = await userObj.getIdToken();
      const sock = initSocket(token);
      setSocket(sock);
    } catch (error) {
      console.error("Error initializing socket after login:", error);
    }

    // Fetch profile
    fetchProfile(userObj, userRole);
  };

  return (
    <AuthContext.Provider value={{ user, role, profile, socket, loading, logout, loginWithRole, refreshProfile }}>
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
