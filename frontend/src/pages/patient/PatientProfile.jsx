import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import * as Lucide from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchPatientProfile, updatePatientProfile, deletePatientAccount } from "../../api/patients";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/Select";
import { Skeleton } from "../../components/ui/Skeleton";
import { showSuccess, showError, showConfirm } from "../../lib/swal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "../../schemas/profileSchema";
import { updateProfile } from "firebase/auth";
import { auth } from "../../lib/firebase";

function ProfileImagePreview({ photoPreview, profile, user }) {
  const [imgError, setImgError] = useState(false);
  useEffect(() => {
    setImgError(false);
  }, [photoPreview]);

  if (photoPreview && !imgError) {
    return (
      <img 
        src={photoPreview} 
        alt="Profile" 
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover" 
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-accent-primary to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
      {profile?.name?.[0]?.toUpperCase() || user?.displayName?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

const PatientProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

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
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
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
        name: profile.name || user?.displayName || "",
        phone: profile.phone || "",
        dob: profile.dob ? profile.dob.split('T')[0] : "",
        gender: profile.gender || "",
        bloodType: profile.bloodType || "",
        allergies: profile.allergies || "",
      });
      setPhotoPreview(profile.photoURL || user?.photoURL);
    }
  }, [profile, user, reset]);

  const updateMutation = useMutation({
    mutationFn: updatePatientProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(["patientProfile", user?.uid]);
      showSuccess("Your health profile has been successfully updated.", "Profile Updated!");
    },
    onError: (err) => {
      showError(err.message || "Failed to update profile", "Error");
    },
  });

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const uploadToImgBB = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=92c4f48b8520017aa469eba82303d7c3`,
      { method: "POST", body: formData }
    );
    const json = await res.json();
    if (!json.success) throw new Error("Photo upload failed");
    return json.data.url;
  };

  const onSubmit = async (data) => {
    setIsUploading(true);
    try {
      let photoURL = profile?.photoURL || user?.photoURL;

      // 1. Upload to ImgBB if new file selected
      if (selectedFile) {
        photoURL = await uploadToImgBB(selectedFile);
      }

      // 2. Update Backend
      await updateMutation.mutateAsync({
        ...data,
        photoURL
      });

      // 3. Update Firebase Profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: data.name,
          photoURL: photoURL
        });
      }

      setSelectedFile(null);
      reset(data);
    } catch (err) {
      showError(err.message || "Failed to update profile", "Error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = await showConfirm({
      title: "Delete Account?",
      text: "This will permanently delete your account and all your medical history. This action cannot be undone.",
      confirmText: "Yes, Delete My Account",
      cancelText: "Cancel",
      icon: "error",
    });
    if (!confirmed) return;

    setIsDeletingAccount(true);
    try {
      await deletePatientAccount();
      const { signOut } = await import("firebase/auth");
      await signOut(auth);
      window.location.href = "/";
    } catch (err) {
      showError(err.message || "Failed to delete account.");
      setIsDeletingAccount(false);
    }
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
        <h2 className="text-2xl font-bold text-text-primary mb-1">Profile & Settings</h2>
        <p className="text-text-secondary">Manage your medical identity and account security.</p>
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
          <form onSubmit={handleSubmit(onSubmit)} className="bg-background-secondary border border-border rounded-2xl p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-text-primary mb-8 flex items-center gap-2">
              <Lucide.UserCircle className="w-5 h-5 text-accent-primary" />
              Personal Information
            </h3>

            {/* Photo Section */}
            <div className="flex flex-col items-center sm:flex-row sm:items-end gap-6 mb-10 pb-10 border-b border-border/50">
              <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                <div className="w-32 h-32 rounded-3xl overflow-hidden animate-glow">
                  <ProfileImagePreview photoPreview={photoPreview} profile={profile} user={user} />
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
                <h4 className="text-text-primary font-semibold">Profile Photo</h4>
                <p className="text-text-secondary text-sm">JPG, GIF or PNG. Max size of 800K</p>
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <Button type="button" variant="outline" size="sm" onClick={handlePhotoClick} className="bg-background-tertiary border-border text-text-primary hover:bg-background-secondary">
                    Upload New
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="text-text-secondary hover:text-red-500" onClick={() => setPhotoPreview(null)}>
                    Remove
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-text-secondary font-medium">Full Name</label>
                <Input
                  {...register("name")}
                  className={`bg-background-tertiary border-border text-text-primary focus:ring-accent-primary/30 h-11 ${errors.name ? "border-red-500/50" : ""}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm text-text-secondary font-medium opacity-50">Email Address (Read Only)</label>
                <Input
                  value={profile?.email || user?.email || ""}
                  disabled
                  className="bg-background-tertiary border-border text-text-secondary h-11 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-text-secondary font-medium">Phone Number</label>
                <Input
                  {...register("phone")}
                  className={`bg-background-tertiary border-border text-text-primary focus:ring-accent-primary/30 h-11 ${errors.phone ? "border-red-500/50" : ""}`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm text-text-secondary font-medium">Date of Birth</label>
                <Input
                  {...register("dob")}
                  type="date"
                  className={`bg-background-tertiary border-border text-text-primary focus:ring-accent-primary/30 h-11 dark:[color-scheme:dark] ${errors.dob ? "border-red-500/50" : ""}`}
                />
                {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm text-text-secondary font-medium">Gender</label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={`bg-background-tertiary border-border text-text-primary h-11 ${errors.gender ? "border-red-500/50" : ""}`}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-background-secondary border-border text-text-primary">
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
                <label className="text-sm text-text-secondary font-medium">Blood Type</label>
                <Controller
                  name="bloodType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={`bg-background-tertiary border-border text-text-primary h-11 ${errors.bloodType ? "border-red-500/50" : ""}`}>
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent className="bg-background-secondary border-border text-text-primary">
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
                <label className="text-sm text-text-secondary font-medium">Allergies</label>
                <textarea
                  {...register("allergies")}
                  placeholder="List any known allergies..."
                  className="w-full bg-background-tertiary border border-border text-text-primary rounded-xl p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all text-sm resize-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={updateMutation.isLoading || isUploading || (!isDirty && !selectedFile)}
              className="mt-10 w-full bg-accent-primary hover:brightness-110 text-white h-12 font-bold shadow-lg shadow-accent-primary/20 active:scale-[0.98] transition-all"
            >
              {updateMutation.isLoading || isUploading ? (
                <>
                  <Lucide.Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {isUploading ? "Uploading Data..." : "Updating Health Profile..."}
                </>
              ) : (
                "Save Profile Changes"
              )}
            </Button>
          </form>
        </div>

        {/* Right: Account Info & Security */}
        <div className="space-y-6">
          <div className="bg-background-secondary border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-text-primary font-semibold mb-6 flex items-center gap-2">
              <Lucide.ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
              Account Details
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-border/50">
                <span className="text-text-secondary text-sm">Account Type</span>
                <span className="text-accent-primary text-sm font-semibold bg-accent-primary/10 px-3 py-1 rounded-full uppercase tracking-tighter">Patient</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border/50">
                <span className="text-text-secondary text-sm">Member Since</span>
                <span className="text-text-primary text-sm font-medium">{formatDate(user?.metadata?.creationTime)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border/50">
                <span className="text-text-secondary text-sm">Provider</span>
                <span className="text-text-primary text-sm font-medium flex items-center gap-2">
                  {user?.providerData?.[0]?.providerId === "google.com" ? (
                    <><Lucide.Globe className="w-3 h-3 text-blue-600 dark:text-blue-400" /> Google</>
                  ) : (
                    <><Lucide.Mail className="w-3 h-3 text-accent-primary" /> Password</>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-background-secondary border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-text-primary font-semibold mb-6 flex items-center gap-2">
              <Lucide.Lock className="w-5 h-5 text-amber-500" />
              Security
            </h3>
            <div className="space-y-3">
              {user?.providerData?.[0]?.providerId === "password" && (
                <Button 
                  variant="outline" 
                  className="w-full bg-background-tertiary border-border text-text-primary hover:bg-background-secondary justify-start h-11"
                  onClick={async () => {
                    try {
                      const { sendPasswordResetEmail } = await import("firebase/auth");
                      const { auth } = await import("../../lib/firebase");
                      await sendPasswordResetEmail(auth, user.email);
                      showSuccess("Password reset email has been sent to your inbox.", "Email Sent");
                    } catch (err) {
                      showError(err.message, "Error");
                    }
                  }}
                >
                  <Lucide.Key className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              )}
            </div>
          </div>

          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 shadow-sm">
            <h3 className="text-red-500 font-semibold mb-6 flex items-center gap-2">
              <Lucide.AlertTriangle className="w-5 h-5" />
              Danger Zone
            </h3>
            <Button
              variant="ghost"
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
              className="w-full text-red-500 hover:bg-red-500/10 justify-start h-11 border border-transparent hover:border-red-500/20 mb-2 disabled:opacity-50"
            >
              {isDeletingAccount ? (
                <><Lucide.Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting Account...</>
              ) : (
                <><Lucide.Ban className="w-4 h-4 mr-2" />Delete Account</>
              )}
            </Button>
            <p className="text-[10px] text-text-secondary/60 px-1">
              Warning: Deleting your account will permanently remove all medical history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
