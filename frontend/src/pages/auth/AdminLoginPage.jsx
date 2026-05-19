import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { auth } from "../../lib/firebase.js";
import axiosClient from "../../lib/axiosClient.js";
import { swalError } from "../../lib/swal.js";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const adminLoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { loginWithRole } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(adminLoginSchema),
  });

  const { mutate: login, isPending } = useMutation({
    mutationFn: async ({ email, password }) => {
      // Step 1: Firebase login
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Step 2: Verify admin role with backend
      const response = await axiosClient.post("/admin/verify-login");
      return { user: result.user, admin: response.admin };
    },
    onSuccess: (data) => {
      loginWithRole(data.user, "admin");
      navigate("/admin/dashboard");
    },
    onError: (error) => {
      // Clear Firebase session if backend rejects
      auth.signOut();
      localStorage.removeItem("doclink_role");
      
      // Axios interceptor extracts the error string into error.message
      const errorMessage = error.message && error.message !== "An unexpected error occurred" 
        ? error.message 
        : "Invalid email or password.";
        
      swalError("Access Denied", errorMessage);
    },
  });

  const onSubmit = (data) => login(data);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0F1E] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: "radial-gradient(ellipse at center, rgba(239,68,68,0.04) 0%, transparent 70%)" }} />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md p-8 rounded-2xl
                   bg-[#F0FDF9] dark:bg-[#0D1526]
                   border border-red-500/20 dark:border-red-500/20
                   shadow-lg backdrop-blur-md z-10"
      >
        {/* Admin badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center
                          justify-center border border-red-500/20">
            <Shield className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-red-500 uppercase tracking-widest">
              Admin Portal
            </p>
            <p className="text-lg font-bold text-[#0F172A] dark:text-white leading-tight">
              DocLink
            </p>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-[#0F172A] dark:text-white mb-1">
          Administrator Sign In
        </h2>
        <p className="text-sm text-[#475569] dark:text-[#8B9FC4] mb-6">
          Restricted access. Authorized personnel only.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-[#0F172A] dark:text-[#F0F4FF]">
              Admin Email
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="admin@doclink.com"
              className="mt-1 w-full rounded-lg px-3 py-2.5 text-sm
                         bg-white dark:bg-[#111D35]
                         border border-red-500/20 dark:border-red-500/20
                         text-[#0F172A] dark:text-[#F0F4FF]
                         focus:outline-none focus:ring-2 focus:ring-red-500/40"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-[#0F172A] dark:text-[#F0F4FF]">
              Password
            </label>
            <div className="relative mt-1">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full rounded-lg px-3 py-2.5 pr-10 text-sm
                           bg-white dark:bg-[#111D35]
                           border border-red-500/20 dark:border-red-500/20
                           text-[#0F172A] dark:text-[#F0F4FF]
                           focus:outline-none focus:ring-2 focus:ring-red-500/40"
              />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2
                                 text-[#475569] dark:text-[#8B9FC4]">
                {showPassword
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-lg font-semibold text-white
                       bg-red-500 hover:bg-red-600
                       flex items-center justify-center gap-2
                       transition-colors disabled:opacity-60 mt-2"
          >
            {isPending ? (
              <motion.div animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                className="w-4 h-4 rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <><Shield className="w-4 h-4" /> Sign In as Admin</>
            )}
          </motion.button>
        </form>

        <p className="text-center text-xs text-[#475569] dark:text-[#8B9FC4] mt-6">
          Not an admin?{" "}
          <a href="/login/patient" className="text-emerald-500 dark:text-blue-400 hover:underline">
            Patient Login
          </a>
          {" · "}
          <a href="/login/doctor" className="text-emerald-500 dark:text-blue-400 hover:underline">
            Doctor Login
          </a>
        </p>
      </motion.div>
    </div>
  );
}
