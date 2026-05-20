import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchAdminDoctors, addDoctor, updateDoctor, 
  deleteDoctor, verifyDoctor 
} from "../../api/admin.js";
import { motion } from "framer-motion";
import { Pencil, Trash2, Plus, Search, X } from "lucide-react";
import { swalConfirm, swalSuccess, swalError, swalToast } from "../../lib/swal.js";
import Pagination from "../../components/common/Pagination.jsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/Dialog.jsx";
import { Switch } from "../../components/ui/Switch.jsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminDoctorSchema } from "../../schemas/adminSchemas.js";

function DoctorAvatar({ doc }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden">
      {doc.avatar && !imgError ? (
        <img 
          src={doc.avatar} 
          alt={doc.name} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover" 
          onError={() => setImgError(true)}
        />
      ) : (
        doc.initials || doc.name?.charAt(0).toUpperCase() || "D"
      )}
    </div>
  );
}

export default function AdminDoctors() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-doctors", search, page],
    queryFn: () => fetchAdminDoctors({ search, page, limit: 10 }),
  });

  const { mutate: handleAdd, isPending: addPending } = useMutation({
    mutationFn: addDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setIsModalOpen(false);
      swalSuccess("Doctor Added", "New doctor has been added successfully.");
    },
    onError: (err) => swalError("Failed", err.response?.data?.error || err.message),
  });

  const { mutate: handleEdit, isPending: editPending } = useMutation({
    mutationFn: ({ id, data }) => updateDoctor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
      setIsModalOpen(false);
      setEditingDoctor(null);
      swalSuccess("Updated", "Doctor profile has been updated.");
    },
    onError: (err) => swalError("Failed", err.response?.data?.error || err.message),
  });

  const { mutate: handleDeleteAction } = useMutation({
    mutationFn: deleteDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      swalToast("success", "Doctor deleted successfully.");
    },
    onError: (err) => swalError("Failed", err.response?.data?.error || err.message),
  });

  const { mutate: handleToggleOnline } = useMutation({
    mutationFn: ({ id, isOnline }) => updateDoctor(id, { isOnline }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
      swalToast("success", "Doctor status updated.");
    },
    onError: (err) => swalError("Failed", err.response?.data?.error || err.message),
  });

  const { mutate: handleVerify } = useMutation({
    mutationFn: verifyDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      swalToast("success", "Doctor verified successfully.");
    },
    onError: (err) => swalError("Failed", err.response?.data?.error || err.message),
  });

  const openAddModal = () => {
    setEditingDoctor(null);
    setIsModalOpen(true);
  };

  const openEditModal = (doc) => {
    setEditingDoctor(doc);
    setIsModalOpen(true);
  };

  const confirmDelete = async (doc) => {
    const result = await swalConfirm(
      `Delete ${doc.name}?`,
      "This will permanently remove the doctor and all their queue entries.",
      "Delete"
    );
    if (result.isConfirmed) {
      handleDeleteAction(doc.id);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Manage Doctors</h1>
          <p className="text-sm text-[#475569] dark:text-[#8B9FC4]">Add, edit, or remove healthcare providers.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New Doctor
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569] dark:text-[#8B9FC4]" />
          <input
            type="text"
            placeholder="Search by name or specialty..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#0D1526] border border-red-500/10 dark:border-red-500/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-red-500/10 dark:border-red-500/10 bg-white dark:bg-[#0D1526]">
        <table className="w-full text-sm">
          <thead className="bg-red-500/5 dark:bg-red-500/5 border-bottom border-red-500/10">
            <tr>
              {["Doctor", "Specialty", "Fee", "Rating", "Status", "Verified", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#475569] dark:text-[#8B9FC4] uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-red-500/5 dark:divide-red-500/5">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={7} className="px-4 py-4 h-16 bg-gray-50/50 dark:bg-gray-800/10"></td>
                </tr>
              ))
            ) : data?.doctors.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-[#475569] dark:text-[#8B9FC4]">
                  No doctors found matching your search.
                </td>
              </tr>
            ) : (
              data?.doctors.map(doc => (
                <tr key={doc.id} className="hover:bg-red-500/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <DoctorAvatar doc={doc} />
                      <div>
                        <p className="font-medium text-[#0F172A] dark:text-[#F0F4FF]">{doc.name}</p>
                        <p className="text-xs text-[#475569] dark:text-[#8B9FC4]">{doc.experience}y experience</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#475569] dark:text-[#8B9FC4]">{doc.specialty}</td>
                  <td className="px-4 py-3 font-medium text-[#0F172A] dark:text-[#F0F4FF]">৳{doc.fee}</td>
                  <td className="px-4 py-3 text-amber-500 font-medium">★ {doc.rating || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={doc.isOnline} 
                        onCheckedChange={(checked) => handleToggleOnline({ id: doc.id, isOnline: checked })}
                        className={doc.isOnline ? "bg-emerald-500" : "bg-gray-200 dark:bg-white/10"}
                      />
                      <span className={`text-[11px] font-semibold uppercase ${doc.isOnline ? "text-emerald-500" : "text-text-secondary"}`}>
                        {doc.isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {doc.verified
                      ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">Verified</span>
                      : <button onClick={() => handleVerify(doc.id)} className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20 transition-colors">Verify</button>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditModal(doc)} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => confirmDelete(doc)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination 
        page={page} 
        total={data?.total || 0} 
        limit={10} 
        onPageChange={setPage} 
      />

      <DoctorModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        doctor={editingDoctor}
        onSubmit={editingDoctor ? (data) => handleEdit({ id: editingDoctor.id, data }) : handleAdd}
        isPending={addPending || editPending}
      />
    </div>
  );
}

function DoctorModal({ open, onOpenChange, doctor, onSubmit, isPending }) {
  const { register, handleSubmit, reset, setValue, setError, watch, formState: { errors } } = useForm({
    resolver: zodResolver(adminDoctorSchema),
  });

  const isOnlineValue = watch("isOnline", false);

  const [avatarUrl, setAvatarUrl] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    if (open) {
      if (doctor) {
        reset({
          name: doctor.name,
          specialty: doctor.specialty,
          experience: doctor.experience,
          fee: doctor.fee,
          bio: doctor.bio || "",
          gender: doctor.gender || "male",
          education: doctor.education || "",
          experienceDetails: doctor.experienceDetails || "",
          rating: doctor.rating || 0,
          isOnline: doctor.isOnline || false,
          email: doctor.email || "",
          password: "",
        });
        setAvatarUrl(doctor.avatar || "");
      } else {
        reset({
          name: "", specialty: "", experience: 0, fee: 0, 
          bio: "", gender: "male", education: "", experienceDetails: "", rating: 0,
          isOnline: false,
          email: "",
          password: "",
        });
        setAvatarUrl("");
      }
    }
  }, [open, doctor, reset]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=92c4f48b8520017aa469eba82303d7c3`,
        { method: "POST", body: formData }
      );
      const json = await res.json();
      if (json.success) {
        setAvatarUrl(json.data.url);
      } else {
        swalError("Upload Failed", "Could not upload image to ImgBB.");
      }
    } catch (err) {
      swalError("Upload Failed", err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFormSubmit = (data) => {
    if (!doctor && (!data.password || data.password.trim().length < 6)) {
      setError("password", { type: "manual", message: "Password must be at least 6 characters for a new doctor" });
      return;
    }
    const formattedData = {
      ...data,
      avatar: avatarUrl || undefined,
      initials: data.name ? data.name.split(" ").map(n => n[0]).join("").toUpperCase() : "DOC"
    };
    // If password is empty (e.g. during edit), remove it so we don't send it to the backend unnecessarily
    if (!formattedData.password) {
      delete formattedData.password;
    }
    onSubmit(formattedData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{doctor ? "Edit Doctor Profile" : "Add New Doctor"}</DialogTitle>
            <button onClick={() => onOpenChange(false)} className="text-[#475569] dark:text-[#8B9FC4] hover:text-red-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
          
          {/* Image Upload */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-amber-500 
                          flex items-center justify-center text-white text-lg font-bold 
                          shrink-0 overflow-hidden border-2 border-red-500/20 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold opacity-80">Photo</span>
              )}
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-[#475569] dark:text-[#8B9FC4] uppercase">
                Doctor Photo
              </label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-1 flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#111D35] 
                           border border-red-500/10 rounded-lg text-sm text-[#475569] 
                           dark:text-[#8B9FC4] hover:border-red-500/30 transition-colors 
                           disabled:opacity-50 w-full"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {uploading ? "Uploading..." : avatarUrl ? "Change Photo" : "Upload Photo"}
              </button>
              {avatarUrl && (
                <p className="text-[10px] text-emerald-500 mt-1 truncate">✓ Image uploaded</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#475569] dark:text-[#8B9FC4] uppercase">Full Name</label>
              <input {...register("name")} className="w-full mt-1 px-3 py-2 bg-white dark:bg-[#111D35] border border-red-500/10 rounded-lg text-sm" />
              {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-[#475569] dark:text-[#8B9FC4] uppercase">Specialty</label>
              <input {...register("specialty")} className="w-full mt-1 px-3 py-2 bg-white dark:bg-[#111D35] border border-red-500/10 rounded-lg text-sm" />
              {errors.specialty && <p className="text-red-500 text-[10px] mt-1">{errors.specialty.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#475569] dark:text-[#8B9FC4] uppercase">Email Address</label>
              <input type="email" {...register("email")} placeholder="doctor@doclink.com" className="w-full mt-1 px-3 py-2 bg-white dark:bg-[#111D35] border border-red-500/10 rounded-lg text-sm" />
              {errors.email && <p className="text-red-500 text-[10px] mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-[#475569] dark:text-[#8B9FC4] uppercase">
                {doctor ? "New Password (Optional)" : "One-time Temporary Password"}
              </label>
              <input type="password" {...register("password")} placeholder={doctor ? "Leave blank to keep current" : "••••••••"} className="w-full mt-1 px-3 py-2 bg-white dark:bg-[#111D35] border border-red-500/10 rounded-lg text-sm" />
              {errors.password && <p className="text-red-500 text-[10px] mt-1">{errors.password.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#475569] dark:text-[#8B9FC4] uppercase">Experience (Yrs)</label>
              <input type="number" {...register("experience")} className="w-full mt-1 px-3 py-2 bg-white dark:bg-[#111D35] border border-red-500/10 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#475569] dark:text-[#8B9FC4] uppercase">Fee (৳)</label>
              <input type="number" {...register("fee")} className="w-full mt-1 px-3 py-2 bg-white dark:bg-[#111D35] border border-red-500/10 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#475569] dark:text-[#8B9FC4] uppercase">Gender</label>
              <select {...register("gender")} className="w-full mt-1 px-3 py-2 bg-white dark:bg-[#111D35] border border-red-500/10 rounded-lg text-sm">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#475569] dark:text-[#8B9FC4] uppercase">Education & Qualifications</label>
            <input {...register("education")} placeholder="e.g. MBBS, FCPS" className="w-full mt-1 px-3 py-2 bg-white dark:bg-[#111D35] border border-red-500/10 rounded-lg text-sm" />
            {errors.education && <p className="text-red-500 text-[10px] mt-1">{errors.education.message}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-[#475569] dark:text-[#8B9FC4] uppercase">Professional Experience</label>
            <textarea {...register("experienceDetails")} placeholder="e.g. Senior Consultant at Dhaka Medical College (2020 - Present)" rows={3} className="w-full mt-1 px-3 py-2 bg-white dark:bg-[#111D35] border border-red-500/10 rounded-lg text-sm resize-none"></textarea>
            {errors.experienceDetails && <p className="text-red-500 text-[10px] mt-1">{errors.experienceDetails.message}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-[#475569] dark:text-[#8B9FC4] uppercase">Bio</label>
            <textarea {...register("bio")} rows={3} className="w-full mt-1 px-3 py-2 bg-white dark:bg-[#111D35] border border-red-500/10 rounded-lg text-sm resize-none"></textarea>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-red-500/10 bg-[#111D35]/10 dark:bg-[#111D35]/50">
            <div>
              <label className="text-xs font-bold text-[#475569] dark:text-[#8B9FC4] uppercase block">Online Status</label>
              <span className="text-[11px] text-text-secondary">Determine if doctor is available for online consultation</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={isOnlineValue} 
                onCheckedChange={(checked) => setValue("isOnline", checked)}
                className={isOnlineValue ? "bg-emerald-500" : "bg-gray-200 dark:bg-white/10"}
              />
              <span className={`text-[11px] font-semibold uppercase ${isOnlineValue ? "text-emerald-500" : "text-text-secondary"}`}>
                {isOnlineValue ? "Online" : "Offline"}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-red-500/10">
            <button type="button" onClick={() => onOpenChange(false)} className="px-4 py-2 text-sm font-medium text-[#475569] dark:text-[#8B9FC4] hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isPending || uploading} className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50">
              {isPending ? "Saving..." : doctor ? "Update Doctor" : "Create Doctor"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
