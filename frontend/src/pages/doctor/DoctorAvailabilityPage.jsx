import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import Swal from "sweetalert2";
import { fetchSpecialties } from "../../api/common";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DEFAULT_HOURS = {
  Monday: { enabled: true, from: "09:00", to: "17:00" },
  Tuesday: { enabled: true, from: "09:00", to: "17:00" },
  Wednesday: { enabled: true, from: "09:00", to: "17:00" },
  Thursday: { enabled: true, from: "09:00", to: "17:00" },
  Friday: { enabled: true, from: "09:00", to: "17:00" },
  Saturday: { enabled: false, from: "09:00", to: "17:00" },
  Sunday: { enabled: false, from: "09:00", to: "17:00" },
};

const doctorProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(6, "Please enter a valid phone number"),
  specialty: z.string().min(1, "Specialty is required"),
  experience: z.coerce.number().min(0, "Experience cannot be negative"),
  fee: z.coerce.number().min(0, "Fee cannot be negative"),
  bio: z.string().max(500, "Bio must be less than 500 characters"),
  education: z.string().min(2, "Education and qualifications are required"),
});

const DoctorAvailabilityPage = () => {
  const { user } = useAuth();
  const { isOnline, toggleOnline } = useDoctorOnlineStatus();
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
  const [isSavingAvail, setIsSavingAvail] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [tags, setTags] = useState(["English"]);
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isValid },
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
    },
    mode: "onChange",
  });

  const bioValue = watch("bio") || "";

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
    if (file) setPhotoPreview(URL.createObjectURL(file));
  };

  const addTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) setTags((prev) => [...prev, newTag]);
      setTagInput("");
    }
  };

  const removeTag = (tag) => setTags((prev) => prev.filter((t) => t !== tag));

  const saveAvailability = () => {
    setIsSavingAvail(true);
    setTimeout(() => {
      setIsSavingAvail(false);
      Swal.fire({
        title: "Availability Updated!",
        text: "Your working hours have been saved.",
        icon: "success",
        background: "#0A0F1E",
        color: "#fff",
        confirmButtonColor: "#2563eb",
      });
    }, 1500);
  };

  const saveProfile = (data) => {
    setIsSavingProfile(true);
    setTimeout(() => {
      setIsSavingProfile(false);
      Swal.fire({
        title: "Profile Updated!",
        text: "Your profile has been saved successfully.",
        icon: "success",
        background: "#0A0F1E",
        color: "#fff",
        confirmButtonColor: "#2563eb",
      });
    }, 1500);
  };

  const handleChangePassword = async () => {
    try {
      const { sendPasswordResetEmail } = await import("firebase/auth");
      const { auth } = await import("../../lib/firebase");
      await sendPasswordResetEmail(auth, user.email);
      Swal.fire({
        title: "Reset Email Sent",
        text: "Check your inbox for the password reset link.",
        icon: "success",
        background: "#0A0F1E",
        color: "#fff",
        confirmButtonColor: "#2563eb",
      });
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error", background: "#0A0F1E", color: "#fff" });
    }
  };

  const initials = (user?.displayName || "D").split(" ").map((n) => n[0]).join("").toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Availability & Profile</h2>
        <p className="text-gray-500">Manage your online status, working hours, and public profile.</p>
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
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Lucide.Wifi className="w-5 h-5 text-cyan-400" />
              Online Status
            </h3>
            <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/5">
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
                    <span className="w-3 h-3 rounded-full bg-gray-500" />
                    <div>
                      <p className="text-gray-400 font-semibold text-sm">You are Offline</p>
                      <p className="text-gray-600 text-xs">Not Visible to Patients</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <Switch checked={isOnline} onCheckedChange={toggleOnline} />
            </div>
          </div>

          {/* Working hours */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Lucide.CalendarClock className="w-5 h-5 text-cyan-400" />
              Working Hours
            </h3>
            <div className="space-y-3">
              {DAYS.map((day) => {
                const d = hours[day];
                return (
                  <div key={day} className={cn("flex items-center gap-4 p-3 rounded-xl border transition-all", d.enabled ? "bg-white/[0.03] border-white/10" : "bg-transparent border-white/5 opacity-60")}>
                    <div className="w-24 shrink-0">
                      <span className="text-sm text-white font-medium">{day.slice(0, 3)}</span>
                    </div>
                    <Switch checked={d.enabled} onCheckedChange={() => toggleDay(day)} />
                    {d.enabled ? (
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-gray-500 text-xs">From</span>
                        <input
                          type="time"
                          value={d.from}
                          onChange={(e) => setDayTime(day, "from", e.target.value)}
                          className="bg-white/5 border border-white/10 text-white rounded-lg px-2 py-1.5 text-sm [color-scheme:dark] focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                        />
                        <span className="text-gray-500 text-xs">To</span>
                        <input
                          type="time"
                          value={d.to}
                          onChange={(e) => setDayTime(day, "to", e.target.value)}
                          className="bg-white/5 border border-white/10 text-white rounded-lg px-2 py-1.5 text-sm [color-scheme:dark] focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                        />
                      </div>
                    ) : (
                      <span className="text-gray-600 text-xs flex-1">Day off</span>
                    )}
                  </div>
                );
              })}
            </div>
            <Button
              onClick={saveAvailability}
              disabled={isSavingAvail}
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
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Lucide.UserCircle className="w-5 h-5 text-cyan-400" />
              Edit Profile
            </h3>

            {/* Profile photo */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                <Avatar className="w-24 h-24 border-2 border-cyan-500/30">
                  {photoPreview || user?.photoURL ? (
                    <AvatarImage src={photoPreview || user?.photoURL} />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <Lucide.Camera className="w-6 h-6 text-white" />
                </div>
                <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
              </div>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current.click()} className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs">
                Change Photo
              </Button>
            </div>

            <form onSubmit={handleSubmit(saveProfile)} className="space-y-4">
              {/* Form fields */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium">Full Name</label>
                  <Input
                    {...register("fullName")}
                    className={cn("bg-white/5 border-white/10 text-white h-10", errors.fullName && "border-red-500/50")}
                  />
                  {errors.fullName && <p className="text-red-400 text-xs">{errors.fullName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium opacity-50">Email (Read Only)</label>
                  <Input value={user?.email || ""} disabled className="bg-white/5 border-white/10 text-gray-500 h-10 cursor-not-allowed" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium">Phone Number</label>
                  <Input
                    {...register("phone")}
                    className={cn("bg-white/5 border-white/10 text-white h-10", errors.phone && "border-red-500/50")}
                  />
                  {errors.phone && <p className="text-red-400 text-xs">{errors.phone.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium">Specialty</label>
                  <Controller
                    name="specialty"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={cn("bg-white/5 border-white/10 text-white h-10", errors.specialty && "border-red-500/50")}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1F2E] border-white/10 text-white">
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
                    <label className="text-xs text-gray-400 font-medium">Years of Experience</label>
                    <Input
                      type="number"
                      {...register("experience")}
                      className={cn("bg-white/5 border-white/10 text-white h-10", errors.experience && "border-red-500/50")}
                    />
                    {errors.experience && <p className="text-red-400 text-xs">{errors.experience.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 font-medium">Consultation Fee ($)</label>
                    <Input
                      type="number"
                      {...register("fee")}
                      className={cn("bg-white/5 border-white/10 text-white h-10", errors.fee && "border-red-500/50")}
                    />
                    {errors.fee && <p className="text-red-400 text-xs">{errors.fee.message}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium">Bio / About (max 500)</label>
                  <textarea
                    {...register("bio")}
                    maxLength={500}
                    placeholder="Tell patients about yourself..."
                    className={cn(
                      "w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 min-h-[90px] focus:outline-none focus:ring-1 focus:ring-cyan-500/30 text-sm resize-none placeholder:text-gray-600",
                      errors.bio && "border-red-500/50"
                    )}
                  />
                  <div className="flex justify-between text-xs">
                    <span className="text-red-400">{errors.bio?.message}</span>
                    <span className="text-gray-600">{bioValue.length} / 500</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium">Education & Qualifications</label>
                  <textarea
                    {...register("education")}
                    placeholder="e.g. MBBS - Dhaka Medical College (2008), MD Cardiology - BSMMU (2013)"
                    className={cn(
                      "w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 min-h-[70px] focus:outline-none focus:ring-1 focus:ring-cyan-500/30 text-sm resize-none placeholder:text-gray-600",
                      errors.education && "border-red-500/50"
                    )}
                  />
                  {errors.education && <p className="text-red-400 text-xs">{errors.education.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium">Languages Spoken</label>
                  <div className="flex flex-wrap gap-2 min-h-[40px] bg-white/5 border border-white/10 rounded-xl p-2">
                    {tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 bg-cyan-500/15 text-cyan-400 text-xs px-2.5 py-1 rounded-full border border-cyan-500/20">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400 ml-0.5">×</button>
                      </span>
                    ))}
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={addTag}
                      placeholder="Press Enter to add..."
                      className="flex-1 min-w-[80px] bg-transparent text-white text-xs outline-none placeholder:text-gray-600 px-1"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSavingProfile || !isValid}
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
              <div className="border-t border-white/10 pt-4">
                <h4 className="text-gray-500 text-xs uppercase tracking-wider mb-3">Security</h4>
                <Button
                  variant="outline"
                  onClick={handleChangePassword}
                  className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 h-10 justify-start text-sm"
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
