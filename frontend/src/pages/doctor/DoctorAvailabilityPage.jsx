import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../context/AuthContext";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Switch } from "../../components/ui/Switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/Select";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/Avatar";
import { cn } from "../../lib/utils";
import useDoctorOnlineStatus from "../../hooks/useDoctorOnlineStatus";
import { fetchSpecialties } from "../../api/common";
import { doctorProfileSchema } from "../../schemas/profileSchema";
import { showSuccess, showError } from "../../lib/swal";
import { fetchDoctorDashboardData, updateDoctorProfile, updateDoctorAvailability } from "../../api/doctors";
import { useQueryClient } from "@tanstack/react-query";

const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DEFAULT_HOURS = {
  Saturday: { enabled: false, from: "09:00", to: "17:00" },
  Sunday: { enabled: false, from: "09:00", to: "17:00" },
  Monday: { enabled: true, from: "09:00", to: "17:00" },
  Tuesday: { enabled: true, from: "09:00", to: "17:00" },
  Wednesday: { enabled: true, from: "09:00", to: "17:00" },
  Thursday: { enabled: true, from: "09:00", to: "17:00" },
  Friday: { enabled: true, from: "09:00", to: "17:00" },
};

const DoctorAvailabilityPage = () => {
  const { user, refreshProfile, profile } = useAuth();
  const { isOnline, toggleOnline } = useDoctorOnlineStatus();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [specialties, setSpecialties] = useState([]);
  const [loadingSpecs, setLoadingSpecs] = useState(true);

  useEffect(() => {
    const loadSpecs = async () => {
      const data = await fetchSpecialties();
      setSpecialties(data || []);
      setLoadingSpecs(false);
    };
    loadSpecs();
  }, []);

  const [hours, setHours] = useState(DEFAULT_HOURS);
  const [originalHours, setOriginalHours] = useState(DEFAULT_HOURS);
  const [isSavingAvail, setIsSavingAvail] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(doctorProfileSchema),
    defaultValues: {
      fullName: user?.displayName || "",
      phone: "+880 1712 345678",
      specialty: "Cardiology",
      experience: "8",
      fee: "80",
      bio: "",
      education: "",
      experienceDetails: "",
    },
    mode: "onChange",
  });

  const bioValue = watch("bio") || "";

  useEffect(() => {
    if (!user?.uid) return;

    const loadProfileData = async () => {
      try {
        const { doctor: doc } = await fetchDoctorDashboardData();
        if (doc) {
          if (doc.workingHours) {
            setHours(doc.workingHours);
            setOriginalHours(doc.workingHours);
          }
          reset({
            fullName: doc.name || user?.displayName || "",
            phone: doc.phone || "",
            specialty: doc.specialty || "General Medicine",
            experience: String(doc.experience ?? 1),
            fee: String(doc.fee ?? 500),
            bio: doc.bio || "",
            education: doc.education || "",
            experienceDetails: doc.experienceDetails || "",
          });
        }
      } catch (error) {
        console.error("Failed to load doctor profile:", error);
      }
    };
    loadProfileData();
  }, [reset, user?.uid, user?.displayName]);

  const toggleDay = (day) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  };

  const setDayTime = (day, field, val) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: val },
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const saveAvailability = async () => {
    setIsSavingAvail(true);
    try {
      await updateDoctorAvailability(hours);
      setOriginalHours(hours);
      showSuccess("Your working hours have been saved.", "Availability Updated!");
    } catch (error) {
      showError("Failed to update availability.", "Error");
    } finally {
      setIsSavingAvail(false);
    }
  };

  const saveProfile = async (data) => {
    setIsSavingProfile(true);
    try {
      let avatarUrl = profile?.avatar;
      let avatarUploadFailed = false;
      
      if (photoFile) {
        try {
          const formData = new FormData();
          formData.append("image", photoFile);
          const res = await fetch(
            `https://api.imgbb.com/1/upload?key=92c4f48b8520017aa469eba82303d7c3`,
            { method: "POST", body: formData }
          );
          const json = await res.json();
          if (!json.success) throw new Error("Photo upload failed");
          avatarUrl = json.data.url;
        } catch (uploadError) {
          console.error("Avatar upload failed:", uploadError);
          avatarUploadFailed = true;
          // Continue saving the rest of the profile data
        }
      }

      const payload = {
        name: data.fullName,
        phone: data.phone,
        specialty: data.specialty,
        experience: Number(data.experience),
        fee: Number(data.fee),
        bio: data.bio,
        education: data.education,
        experienceDetails: data.experienceDetails,
        avatar: avatarUrl,
      };
      await updateDoctorProfile(payload);
      if (refreshProfile) refreshProfile();
      queryClient.invalidateQueries({ queryKey: ["doctor"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      
      if (avatarUploadFailed) {
        showError("Profile saved, but avatar upload to ImgBB failed.", "Partial Success");
      } else {
        showSuccess("Your profile has been saved successfully.", "Profile Updated!");
      }
      reset(data);
    } catch (error) {
      showError("Failed to update profile.", "Error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      const { sendPasswordResetEmail } = await import("firebase/auth");
      const { auth } = await import("../../lib/firebase");
      await sendPasswordResetEmail(auth, user.email);
      showSuccess("Check your inbox for the password reset link.", "Reset Email Sent");
    } catch (err) {
      showError(err.message, "Error");
    }
  };

  const initials = (user?.displayName || "D").split(" ").map((n) => n[0]).join("").toUpperCase();

  const isAvailDirty = JSON.stringify(hours) !== JSON.stringify(originalHours);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-1">Availability & Profile</h2>
        <p className="text-text-secondary">Manage your online status, working hours, and public profile.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-11 gap-6">
        {/* Left: Availability Settings */}
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="xl:col-span-6 space-y-5"
        >
          {/* Online / Offline toggle */}
          <div className="bg-background-secondary border border-border rounded-2xl p-6 space-y-4">
            <h3 className="text-text-primary font-semibold flex items-center gap-2">
              <Lucide.Wifi className="w-5 h-5 text-accent-primary" />
              Online Status
            </h3>
            <div className="flex items-center justify-between p-4 bg-background-tertiary rounded-xl border border-border">
              <AnimatePresence mode="wait">
                {isOnline ? (
                  <motion.div key="online" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                    <div>
                      <p className="text-green-400 font-semibold text-sm">You are Online</p>
                      <p className="text-gray-500 text-xs">Accepting Patients</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="offline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-text-secondary/30" />
                    <div>
                      <p className="text-text-secondary font-semibold text-sm">You are Offline</p>
                      <p className="text-text-secondary/60 text-xs">Not Visible to Patients</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <Switch checked={isOnline} onCheckedChange={toggleOnline} />
            </div>
          </div>

          {/* Working hours */}
          <div className="bg-background-secondary border border-border rounded-2xl p-6 space-y-4">
            <h3 className="text-text-primary font-semibold flex items-center gap-2">
              <Lucide.CalendarClock className="w-5 h-5 text-accent-primary" />
              Working Hours
            </h3>
            <div className="space-y-3">
              {DAYS.map((day) => {
                const d = hours[day];
                return (
                  <div key={day} className={cn("flex items-center gap-4 p-3 rounded-xl border transition-all", d.enabled ? "bg-background-tertiary border-border" : "bg-transparent border-border/50 opacity-60")}>
                    <div className="w-24 shrink-0">
                      <span className="text-sm text-text-primary font-medium">{day.slice(0, 3)}</span>
                    </div>
                    <Switch checked={d.enabled} onCheckedChange={() => toggleDay(day)} />
                    {d.enabled ? (
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-text-secondary text-xs">From</span>
                        <input
                          type="time"
                          value={d.from}
                          onChange={(e) => setDayTime(day, "from", e.target.value)}
                          className="bg-background-secondary border border-border text-text-primary rounded-lg px-2 py-1.5 text-sm [color-scheme:dark] focus:outline-none focus:ring-1 focus:ring-accent-primary/30"
                        />
                        <span className="text-text-secondary text-xs">To</span>
                        <input
                          type="time"
                          value={d.to}
                          onChange={(e) => setDayTime(day, "to", e.target.value)}
                          className="bg-background-secondary border border-border text-text-primary rounded-lg px-2 py-1.5 text-sm [color-scheme:dark] focus:outline-none focus:ring-1 focus:ring-accent-primary/30"
                        />
                      </div>
                    ) : (
                      <span className="text-text-secondary/50 text-xs flex-1">Day off</span>
                    )}
                  </div>
                );
              })}
            </div>
            <Button
              onClick={saveAvailability}
              disabled={isSavingAvail || !isAvailDirty}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none h-11 font-semibold shadow-lg shadow-blue-600/20"
            >
              {isSavingAvail ? (
                <>
                  <Lucide.Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Lucide.Save className="w-4 h-4 mr-2" />
                  Save Availability
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Right: Profile Editor */}
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="xl:col-span-5"
        >
          <div className="bg-background-secondary border border-border rounded-2xl p-6 space-y-5">
            <h3 className="text-text-primary font-semibold flex items-center gap-2">
              <Lucide.UserCircle className="w-5 h-5 text-accent-primary" />
              Edit Profile
            </h3>

            {/* Profile photo */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                <Avatar className="w-24 h-24 border-2 border-cyan-500/30">
                  {photoPreview || profile?.avatar || user?.photoURL ? (
                    <AvatarImage src={photoPreview || profile?.avatar || user?.photoURL} />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-accent-primary to-accent-secondary text-white text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <Lucide.Camera className="w-6 h-6 text-white" />
                </div>
                <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
              </div>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current.click()} className="bg-background-tertiary border-border text-text-primary hover:bg-background-secondary text-xs">
                Change Photo
              </Button>
            </div>

            <form onSubmit={handleSubmit(saveProfile)} className="space-y-4">
              {/* Form fields */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-medium">Full Name</label>
                  <Input
                    {...register("fullName")}
                    className={cn("bg-background-tertiary border-border text-text-primary h-10", errors.fullName && "border-red-500/50")}
                  />
                  {errors.fullName && <p className="text-red-400 text-xs">{errors.fullName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-medium opacity-50">Email (Read Only)</label>
                  <Input value={user?.email || ""} disabled className="bg-background-tertiary border-border text-text-secondary/50 h-10 cursor-not-allowed" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-medium">Phone Number</label>
                  <Input
                    {...register("phone")}
                    className={cn("bg-background-tertiary border-border text-text-primary h-10", errors.phone && "border-red-500/50")}
                  />
                  {errors.phone && <p className="text-red-400 text-xs">{errors.phone.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-medium">Specialty</label>
                  <Controller
                    name="specialty"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={cn("bg-background-tertiary border-border text-text-primary h-10", errors.specialty && "border-red-500/50")}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background-secondary border-border text-text-primary">
                          {loadingSpecs ? (
                            <SelectItem disabled value="loading">Loading specialties...</SelectItem>
                          ) : (
                            specialties.map((s) => (
                              <SelectItem key={s.id || s._id} value={s.name}>{s.name}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.specialty && <p className="text-red-400 text-xs">{errors.specialty.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-text-secondary font-medium">Years of Experience</label>
                    <Input
                      type="number"
                      {...register("experience")}
                      className={cn("bg-background-tertiary border-border text-text-primary h-10", errors.experience && "border-red-500/50")}
                    />
                    {errors.experience && <p className="text-red-400 text-xs">{errors.experience.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-text-secondary font-medium">Consultation Fee (৳)</label>
                    <Input
                      type="number"
                      {...register("fee")}
                      className={cn("bg-background-tertiary border-border text-text-primary h-10", errors.fee && "border-red-500/50")}
                    />
                    {errors.fee && <p className="text-red-400 text-xs">{errors.fee.message}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-medium">Bio / About (max 500)</label>
                  <textarea
                    {...register("bio")}
                    maxLength={500}
                    placeholder="Tell patients about yourself..."
                    className={cn(
                      "w-full bg-background-tertiary border border-border text-text-primary rounded-xl p-3 min-h-[90px] focus:outline-none focus:ring-1 focus:ring-accent-primary/30 text-sm resize-none placeholder:text-text-secondary/50",
                      errors.bio && "border-red-500/50"
                    )}
                  />
                  <div className="flex justify-between text-xs">
                    <span className="text-red-400">{errors.bio?.message}</span>
                    <span className="text-text-secondary/60">{bioValue.length} / 500</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-medium">Education & Qualifications</label>
                  <textarea
                    {...register("education")}
                    placeholder="e.g. MBBS - Dhaka Medical College (2008), MD Cardiology - BSMMU (2013)"
                    className={cn(
                      "w-full bg-background-tertiary border border-border text-text-primary rounded-xl p-3 min-h-[70px] focus:outline-none focus:ring-1 focus:ring-accent-primary/30 text-sm resize-none placeholder:text-text-secondary/50",
                      errors.education && "border-red-500/50"
                    )}
                  />
                  {errors.education && <p className="text-red-400 text-xs">{errors.education.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-medium">Professional Experience</label>
                  <textarea
                    {...register("experienceDetails")}
                    placeholder="e.g. Senior Consultant at Dhaka Medical College (2020 - Present)"
                    className={cn(
                      "w-full bg-background-tertiary border border-border text-text-primary rounded-xl p-3 min-h-[70px] focus:outline-none focus:ring-1 focus:ring-accent-primary/30 text-sm resize-none placeholder:text-text-secondary/50",
                      errors.experienceDetails && "border-red-500/50"
                    )}
                  />
                  {errors.experienceDetails && <p className="text-red-400 text-xs">{errors.experienceDetails.message}</p>}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSavingProfile || !isValid || !isDirty}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none h-11 font-semibold shadow-lg shadow-blue-600/20"
              >
                {isSavingProfile ? (
                  <><Lucide.Loader2 className="w-4 h-4 animate-spin mr-2" />Saving Profile...</>
                ) : (
                  <><Lucide.Save className="w-4 h-4 mr-2" />Save Profile</>
                )}
              </Button>
            </form>

            {/* Security section */}
            {user?.providerData?.[0]?.providerId === "password" && (
              <div className="border-t border-border pt-4">
                <h4 className="text-text-secondary text-xs uppercase tracking-wider mb-3">Security</h4>
                <Button
                  variant="outline"
                  onClick={handleChangePassword}
                  className="w-full bg-background-tertiary border-border text-text-primary hover:bg-background-secondary h-10 justify-start text-sm"
                >
                  <Lucide.Key className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorAvailabilityPage;
