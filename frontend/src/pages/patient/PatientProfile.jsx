import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import * as Lucide from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchPatientProfile, updatePatientProfile } from "../../api/patients";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/Select";
import { Skeleton } from "../../components/ui/Skeleton";
import Swal from "sweetalert2";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  bloodType: z.string().min(1, "Blood type is required"),
  allergies: z.string().optional(),
});

const PatientProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const { data: profile, isLoading: loading, error: queryError } = useQuery({
    queryKey: ["patientProfile", user?.uid],
    queryFn: fetchPatientProfile,
    enabled: !!user,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      dob: "",
      gender: "",
      bloodType: "",
      allergies: "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName || user?.displayName || "",
        phone: profile.phone || "",
        dob: profile.dob ? profile.dob.split('T')[0] : "",
        gender: profile.gender || "",
        bloodType: profile.bloodType || "",
        allergies: profile.allergies || "",
      });
      setPhotoPreview(profile.photoURL);
    }
  }, [profile, user, reset]);

  const updateMutation = useMutation({
    mutationFn: updatePatientProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(["patientProfile", user?.uid]);
      Swal.fire({
        title: "Profile Updated!",
        text: "Your health profile has been successfully updated.",
        icon: "success",
        background: "#0A0F1E",
        color: "#fff",
        confirmButtonColor: "#06b6d4",
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Error",
        text: err.message || "Failed to update profile",
        icon: "error",
        background: "#0A0F1E",
        color: "#fff",
      });
    },
  });

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-white/5 rounded mb-2" />
        <div className="h-4 w-64 bg-white/5 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2 h-[600px] w-full rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Profile & Settings</h2>
        <p className="text-gray-500">Manage your medical identity and account security.</p>
      </div>

      {queryError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 flex items-center gap-3">
          <Lucide.AlertCircle className="w-5 h-5" />
          <p>{queryError.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h3 className="text-lg font-semibold text-white mb-8 flex items-center gap-2">
              <Lucide.UserCircle className="w-5 h-5 text-cyan-400" />
              Personal Information
            </h3>

            {/* Photo Section */}
            <div className="flex flex-col items-center sm:flex-row sm:items-end gap-6 mb-10 pb-10 border-b border-white/5">
              <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                <div className="w-32 h-32 rounded-3xl overflow-hidden animate-glow">
                  {photoPreview || user?.photoURL ? (
                    <img src={photoPreview || user?.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                      {profile?.fullName?.[0]?.toUpperCase() || user?.displayName?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-3xl">
                  <Lucide.Camera className="w-8 h-8 text-white" />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <h4 className="text-white font-semibold">Profile Photo</h4>
                <p className="text-gray-500 text-sm">JPG, GIF or PNG. Max size of 800K</p>
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <Button type="button" variant="outline" size="sm" onClick={handlePhotoClick} className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                    Upload New
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="text-gray-500 hover:text-red-400" onClick={() => setPhotoPreview(null)}>
                    Remove
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">Full Name</label>
                <Input
                  {...register("fullName")}
                  className={`bg-white/5 border-white/10 text-white focus:ring-cyan-500/30 h-11 ${errors.fullName ? "border-red-500/50" : ""}`}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium opacity-50">Email Address (Read Only)</label>
                <Input
                  value={profile?.email || user?.email || ""}
                  disabled
                  className="bg-white/5 border-white/10 text-gray-500 h-11 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">Phone Number</label>
                <Input
                  {...register("phone")}
                  className={`bg-white/5 border-white/10 text-white focus:ring-cyan-500/30 h-11 ${errors.phone ? "border-red-500/50" : ""}`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">Date of Birth</label>
                <Input
                  {...register("dob")}
                  type="date"
                  className={`bg-white/5 border-white/10 text-white focus:ring-cyan-500/30 h-11 [color-scheme:dark] ${errors.dob ? "border-red-500/50" : ""}`}
                />
                {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">Gender</label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={`bg-white/5 border-white/10 text-white h-11 ${errors.gender ? "border-red-500/50" : ""}`}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1F2E] border-white/10 text-white">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">Blood Type</label>
                <Controller
                  name="bloodType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={`bg-white/5 border-white/10 text-white h-11 ${errors.bloodType ? "border-red-500/50" : ""}`}>
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1F2E] border-white/10 text-white">
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"].map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.bloodType && <p className="text-red-500 text-xs mt-1">{errors.bloodType.message}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm text-gray-400 font-medium">Allergies</label>
                <textarea
                  {...register("allergies")}
                  placeholder="List any known allergies..."
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all text-sm resize-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={updateMutation.isLoading}
              className="mt-10 w-full bg-cyan-500 hover:bg-cyan-600 text-white h-12 font-bold shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all"
            >
              {updateMutation.isLoading ? (
                <>
                  <Lucide.Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Updating Health Profile...
                </>
              ) : (
                "Save Profile Changes"
              )}
            </Button>
          </form>
        </div>

        {/* Right: Account Info & Security */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <Lucide.ShieldCheck className="w-5 h-5 text-green-400" />
              Account Details
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-gray-500 text-sm">Account Type</span>
                <span className="text-cyan-400 text-sm font-semibold bg-cyan-400/10 px-3 py-1 rounded-full uppercase tracking-tighter">Patient</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-gray-500 text-sm">Member Since</span>
                <span className="text-white text-sm font-medium">{formatDate(user?.metadata?.creationTime)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-gray-500 text-sm">Provider</span>
                <span className="text-white text-sm font-medium flex items-center gap-2">
                  {user?.providerData?.[0]?.providerId === "google.com" ? (
                    <><Lucide.Globe className="w-3 h-3 text-blue-400" /> Google</>
                  ) : (
                    <><Lucide.Mail className="w-3 h-3 text-cyan-400" /> Password</>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <Lucide.Lock className="w-5 h-5 text-amber-500" />
              Security
            </h3>
            <div className="space-y-3">
              {user?.providerData?.[0]?.providerId === "password" && (
                <Button 
                  variant="outline" 
                  className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 justify-start h-11"
                  onClick={async () => {
                    try {
                      const { sendPasswordResetEmail } = await import("firebase/auth");
                      const { auth } = await import("../../lib/firebase");
                      await sendPasswordResetEmail(auth, user.email);
                      Swal.fire({
                        title: "Email Sent",
                        text: "Password reset email has been sent to your inbox.",
                        icon: "success",
                        background: "#0A0F1E",
                        color: "#fff",
                      });
                    } catch (err) {
                      Swal.fire({
                        title: "Error",
                        text: err.message,
                        icon: "error",
                        background: "#0A0F1E",
                        color: "#fff",
                      });
                    }
                  }}
                >
                  <Lucide.Key className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              )}
              <Button variant="outline" className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 justify-start h-11">
                <Lucide.Fingerprint className="w-4 h-4 mr-2" />
                Two-Factor Auth
              </Button>
            </div>
          </div>

          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
            <h3 className="text-red-400 font-semibold mb-6 flex items-center gap-2">
              <Lucide.AlertTriangle className="w-5 h-5" />
              Danger Zone
            </h3>
            <Button variant="ghost" className="w-full text-red-500 hover:bg-red-500/10 justify-start h-11 border border-transparent hover:border-red-500/20 mb-2">
              <Lucide.Ban className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
            <p className="text-[10px] text-gray-600 px-1">
              Warning: Deleting your account will permanently remove all medical history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
