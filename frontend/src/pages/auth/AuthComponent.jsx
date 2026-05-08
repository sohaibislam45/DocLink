import React, { useState } from "react";
import logoImg from "../../assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import * as Lucide from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../lib/utils";

const AuthComponent = ({ type }) => {
  const location = useLocation();
  const isRegisterPage = location.pathname.includes("register");
  const [isLogin, setIsLogin] = useState(!isRegisterPage);

  // Update state when location changes (e.g. clicking Sign In vs Get Started while already on the page)
  React.useEffect(() => {
    setIsLogin(!location.pathname.includes("register"));
  }, [location.pathname]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { loginWithRole } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      loginWithRole(result.user, type);
      navigate(type === "doctor" ? "/doctor/dashboard" : "/patient/dashboard");
    } catch (err) {
      setError(err.message);
      const Swal = (await import("sweetalert2")).default;
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Authentication Error',
        text: err.message,
        showConfirmButton: false,
        timer: 3000,
        background: isDarkMode ? "#1A1F2E" : "#fff",
        color: isDarkMode ? "#fff" : "#000"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isLogin) {
        const result = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        loginWithRole(result.user, type);
        navigate(type === "doctor" ? "/doctor/dashboard" : "/patient/dashboard");
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(result.user, { displayName: formData.fullName });
        loginWithRole(result.user, type);
        navigate(type === "doctor" ? "/doctor/dashboard" : "/patient/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden transition-colors duration-300",
      isDarkMode ? "bg-[#0A0F1E]" : "bg-gray-50"
    )}>
      {/* Background Glow */}
      <div className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none transition-opacity duration-300",
        isDarkMode ? "bg-blue-500/10 opacity-100" : "bg-cyan-500/5 opacity-50"
      )} />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "w-full max-w-[440px] rounded-2xl p-8 z-10 shadow-2xl transition-all duration-300",
          isDarkMode 
            ? "bg-white/5 backdrop-blur-xl border border-white/10 shadow-black/20" 
            : "bg-white border border-gray-100 shadow-gray-200"
        )}
      >
        <div className="flex flex-col items-center text-center mb-8">
          <Link to="/" className="flex items-center justify-center mb-4">
            <img src={logoImg} alt="DocLink" className="h-12 w-auto object-contain" />
          </Link>
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-500 bg-cyan-500/10 px-3 py-1 rounded-full mb-4">
            {type === "patient" ? "Patient Portal" : "Doctor Portal"}
          </div>
          <h2 className={cn(
            "text-2xl font-semibold mb-2",
            isDarkMode ? "text-white" : "text-gray-900"
          )}>
            {isLogin 
              ? (type === "doctor" ? "Doctor Sign In" : "Welcome Back") 
              : "Create Account"}
          </h2>
          <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
            {type === "patient" 
              ? (isLogin ? "Sign in to access your health dashboard" : "Join DocLink to manage your health")
              : (isLogin ? "Manage your patients and consultations" : "Join our network of healthcare professionals")}
          </p>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            className={cn(
              "w-full h-11 transition-all border-none font-medium",
              isDarkMode 
                ? "bg-white text-black hover:bg-gray-100" 
                : "bg-gray-100 text-gray-900 hover:bg-gray-200"
            )}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <Lucide.Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className={cn("w-full border-t", isDarkMode ? "border-white/10" : "border-gray-100")} />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className={cn("px-2 text-gray-500", isDarkMode ? "bg-[#0A0F1E]" : "bg-white")}>or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className={cn("text-sm ml-1", isDarkMode ? "text-gray-400" : "text-gray-500")}>Full Name</label>
                <Input
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className={cn(
                    "h-11 focus:ring-cyan-500/20",
                    isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                  )}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className={cn("text-sm ml-1", isDarkMode ? "text-gray-400" : "text-gray-500")}>Email Address</label>
              <Input
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className={cn(
                  "h-11 focus:ring-cyan-500/20",
                  isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                )}
              />
            </div>

            <div className="space-y-2">
              <label className={cn("text-sm ml-1", isDarkMode ? "text-gray-400" : "text-gray-500")}>Password</label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={cn(
                    "h-11 focus:ring-cyan-500/20 pr-10",
                    isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <Lucide.EyeOff className="w-4 h-4" /> : <Lucide.Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className={cn("text-sm ml-1", isDarkMode ? "text-gray-400" : "text-gray-500")}>Confirm Password</label>
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={cn(
                    "h-11 focus:ring-cyan-500/20",
                    isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                  )}
                />
              </div>
            )}

            {error && (
              <div className="text-red-400 text-sm mt-2 flex items-start gap-2 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                <Lucide.AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white h-11 font-medium transition-all shadow-lg shadow-cyan-500/20"
              disabled={isLoading}
            >
              {isLoading && <Lucide.Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {isLogin ? "Sign In" : "Create Account"}
            </Button>

            {isLogin && (
              <Button
                type="button"
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    const demoEmail = type === "doctor" ? "doctor@demo.com" : "patient@demo.com";
                    const demoPass = "password123";
                    const result = await signInWithEmailAndPassword(auth, demoEmail, demoPass);
                    loginWithRole(result.user, type);
                    navigate(type === "doctor" ? "/doctor/dashboard" : "/patient/dashboard");
                  } catch (err) {
                    setError("Demo account not available. Please try standard login.");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className={cn(
                  "w-full h-11 font-medium transition-all border border-dashed",
                  isDarkMode 
                    ? "bg-transparent border-white/20 text-white hover:bg-white/5" 
                    : "bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50"
                )}
                disabled={isLoading}
              >
                <Lucide.Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                Demo {type === "doctor" ? "Doctor" : "Patient"} Login
              </Button>
            )}
          </form>

          <div className="text-center pt-2">
              <p className={isDarkMode ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <Link
                  to={isLogin ? `/register/${type}` : `/login/${type}`}
                  className="text-cyan-500 hover:underline font-medium"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </Link>
              </p>
            </div>

            <div className={cn("pt-6 border-t mt-6 text-center", isDarkMode ? "border-white/10" : "border-gray-100")}>
              <p className={cn("text-xs mb-4", isDarkMode ? "text-gray-500" : "text-gray-400")}>
                {type === "patient" ? "Are you a doctor?" : "Are you a patient?"}
              </p>
              <Link
                to={isLogin ? (type === "patient" ? "/login/doctor" : "/login/patient") : (type === "patient" ? "/register/doctor" : "/register/patient")}
                className={cn(
                  "inline-flex items-center gap-2 text-sm transition-colors group",
                  isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                )}
              >
                {type === "patient" ? "Doctor Portal" : "Patient Portal"}
                <Lucide.ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthComponent;
