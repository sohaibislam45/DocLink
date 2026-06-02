import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchAdminDoctors, addDoctor, updateDoctor, 
  deleteDoctor, verifyDoctor 
} from "../../api/admin.js";
import { motion } from "framer-motion";
import { Pencil, Trash2, Plus, Search, X, Eye, FileText, Briefcase, GraduationCap, MapPin, ShieldCheck, Mail, Lock, ExternalLink, Calendar } from "lucide-react";
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
  const [modalMode, setModalMode] = useState("add"); // "add", "edit", or "view"
  const [editingDoctor, setEditingDoctor] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-doctors", search, page],
    queryFn: () => fetchAdminDoctors({ search, page, limit: 20 }),
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
    setModalMode("add");
    setIsModalOpen(true);
  };

  const openEditModal = (doc) => {
    setEditingDoctor(doc);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const openViewModal = (doc) => {
    setEditingDoctor(doc);
    setModalMode("view");
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

  const unverifiedDoctors = data?.doctors.filter(d => !d.verified) || [];
  const verifiedDoctors = data?.doctors.filter(d => d.verified) || [];

  const DoctorTable = ({ doctors, title, isUnverified }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
          {isUnverified ? (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          )}
          {title} ({doctors.length})
        </h2>
      </div>
      <div className="overflow-x-auto rounded-xl border border-red-500/10 dark:border-red-500/10 bg-white dark:bg-[#0D1526]">
        <table className="w-full text-sm">
          <thead className="bg-red-500/5 dark:bg-red-500/5 border-bottom border-red-500/10">
            <tr>
              {["Doctor", "Specialty", "Fee", "Status", "Verified", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#475569] dark:text-[#8B9FC4] uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-red-500/5 dark:divide-red-500/5">
            {doctors.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#475569] dark:text-[#8B9FC4] italic">
                  No {title.toLowerCase()} found in this page.
                </td>
              </tr>
            ) : (
              doctors.map(doc => (
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
                      {isUnverified && (
                        <button 
                          onClick={() => openViewModal(doc)} 
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 transition-colors text-[11px] font-bold uppercase"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Info
                        </button>
                      )}
                      <button onClick={() => openEditModal(doc)} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors" title="Edit Profile">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => confirmDelete(doc)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors" title="Delete Doctor">
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
    </div>
  );

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

      {/* Doctors Sections */}
      <div className="space-y-10">
        {isLoading ? (
          <div className="space-y-8">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <DoctorTable 
              doctors={unverifiedDoctors} 
              title="Pending Verification" 
              isUnverified={true}
            />
            <DoctorTable 
              doctors={verifiedDoctors} 
              title="Verified Doctors" 
              isUnverified={false}
            />
          </>
        )}
      </div>


      {data?.total > 20 && (
        <Pagination 
          page={page} 
          total={data?.total || 0} 
          limit={20} 
          onPageChange={setPage} 
        />
      )}

      <DoctorModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        doctor={editingDoctor}
        mode={modalMode}
        onSubmit={editingDoctor ? (data) => handleEdit({ id: editingDoctor.id, data }) : handleAdd}
        onVerify={handleVerify}
        isPending={addPending || editPending}
      />
    </div>
  );
}

function DataField({ label, value, icon: Icon, isFullWidth }) {
  return (
    <div className={`space-y-1 ${isFullWidth ? 'col-span-2' : ''}`}>
      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-inter">
        {Icon && <Icon className="w-3 h-3 text-blue-500" />} {label}
      </label>
      <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
        {value || <span className="opacity-30 italic font-normal">Not provided</span>}
      </div>
    </div>
  );
}

function DoctorModal({ open, onOpenChange, doctor, onSubmit, isPending, mode, onVerify }) {
  const isViewOnly = mode === "view";
  const { register, handleSubmit, reset, setValue, setError, watch, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(adminDoctorSchema),
  });

  const verifiedValue = watch("verified", false);
  const selectedDoctorType = watch("doctorType");

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
          verified: doctor.verified || false,
          bmdcNumber: doctor.bmdcNumber || "",
          doctorType: doctor.doctorType || "MBBS",
          email: doctor.email || "",
          password: "",
        });
        setAvatarUrl(doctor.avatar || "");
      } else {
        reset({
          name: "", specialty: "", experience: 0, fee: 0, 
          bio: "", gender: "male", education: "", experienceDetails: "", rating: 0,
          verified: false,
          bmdcNumber: "",
          doctorType: "MBBS",
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
    if (!formattedData.password) {
      delete formattedData.password;
    }
    onSubmit(formattedData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-6xl p-0">
      <DialogContent className="w-full overflow-hidden bg-white dark:bg-[#0D1526] border-none shadow-2xl">
        <div className="flex flex-col h-[90vh] md:h-auto max-h-[95vh]">
          {/* Header */}
          <div className={`px-6 py-5 flex items-center justify-between ${isViewOnly ? 'bg-slate-900' : 'bg-red-500'}`}>
            <div className="flex items-center gap-4 text-white">
              <div className={`p-2.5 rounded-xl ${isViewOnly ? 'bg-blue-500/20' : 'bg-white/20'}`}>
                {isViewOnly ? <Eye className="w-6 h-6 text-blue-400" /> : <ShieldCheck className="w-6 h-6" />}
              </div>
              <div>
                <h2 className="text-xl font-bold leading-none">
                  {isViewOnly ? "Doctor Master Profile" : doctor ? "Update Professional Profile" : "Onboard New Doctor"}
                </h2>
                <p className="text-[11px] text-white/70 mt-1.5 uppercase tracking-[0.15em] font-black">
                  {isViewOnly ? "Audit & Verification Console" : "System Administration Portal"}
                </p>
              </div>
            </div>
            <button 
              onClick={() => onOpenChange(false)} 
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col md:flex-row overflow-hidden overflow-y-auto">
            
            {/* Left Column: Personal Info */}
            <div className="flex-1 p-6 space-y-6 border-r border-red-500/10">
              <div className="space-y-4">
                <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isViewOnly ? 'text-blue-500' : 'text-red-500'}`}>
                  <span className={`w-4 h-[1px] ${isViewOnly ? 'bg-blue-500/30' : 'bg-red-500/30'}`} />
                  Basic Information
                </h3>
                
                {/* Photo & Name Row */}
                <div className={`flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8 p-6 rounded-2xl border ${isViewOnly ? 'bg-slate-50 dark:bg-white/[0.01] border-slate-200 dark:border-slate-800' : 'bg-red-500/5 dark:bg-white/[0.02] border-red-500/10'}`}>
                  <div 
                    className={`relative group shrink-0 ${isViewOnly ? 'pointer-events-none' : 'cursor-pointer'}`}
                    onClick={() => !isViewOnly && fileInputRef.current?.click()}
                  >
                    <div className={`w-36 h-36 rounded-2xl bg-white dark:bg-[#111D35] border-2 overflow-hidden flex items-center justify-center shadow-2xl ${isViewOnly ? 'border-slate-200 dark:border-slate-800' : 'border-red-500/20'}`}>
                      {uploading ? (
                        <div className={`animate-spin rounded-full h-10 w-10 border-b-2 ${isViewOnly ? 'border-blue-500' : 'border-red-500'}`} />
                      ) : avatarUrl ? (
                        <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          {isViewOnly ? <MapPin className="w-8 h-8 opacity-10" /> : <Plus className="w-8 h-8" />}
                          <span className="text-[10px] font-black uppercase tracking-widest">{isViewOnly ? "NO IMAGE" : "UPLOAD"}</span>
                        </div>
                      )}
                    </div>
                    {!isViewOnly && (
                      <div className="absolute -bottom-2 -right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                        <Pencil className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                  </div>

                  <div className="flex-1 min-w-0 w-full space-y-5">
                    {isViewOnly ? (
                      <>
                        <DataField label="Full Name" value={doctor?.name} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <DataField label="Specialty" value={doctor?.specialty} />
                          <DataField label="Gender" value={doctor?.gender} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Full Name</label>
                          <input {...register("name")} className="w-full mt-1.5 px-4 py-2.5 bg-white dark:bg-[#111D35] border border-red-500/10 rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500/20" />
                          {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name.message}</p>}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Specialty</label>
                            <input {...register("specialty")} className="w-full mt-1.5 px-4 py-2.5 bg-white dark:bg-[#111D35] border border-red-500/10 rounded-xl text-sm font-bold" />
                          </div>
                          <div>
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Gender</label>
                            <select {...register("gender")} className="w-full mt-1.5 px-4 py-2.5 bg-white dark:bg-[#111D35] border border-red-500/10 rounded-xl text-sm font-bold capitalize">
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-2">
                  {isViewOnly ? (
                    <>
                      <DataField icon={Mail} label="Email Address" value={doctor?.email} />
                      <DataField icon={Briefcase} label="Clinical Experience" value={`${doctor?.experience} Years`} />
                      <DataField icon={MapPin} label="Consultation Fee" value={`৳${doctor?.fee}`} />
                      <DataField icon={GraduationCap} label="Educational Background" value={doctor?.education} isFullWidth />
                    </>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email Account</label>
                        <input type="email" {...register("email")} className="w-full px-4 py-2.5 bg-white dark:bg-[#111D35] border border-red-500/10 rounded-xl text-sm font-bold" />
                      </div>
                      {!isViewOnly && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Lock className="w-3 h-3" /> {doctor ? "Update Password" : "Registration Password"}</label>
                          <input type="password" {...register("password")} placeholder={doctor ? "Leave blank to keep" : "••••••••"} className="w-full px-4 py-2.5 bg-white dark:bg-[#111D35] border border-red-500/10 rounded-xl text-sm font-bold" />
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Briefcase className="w-3 h-3" /> Experience (Yrs)</label>
                        <input type="number" {...register("experience")} className="w-full px-4 py-2.5 bg-white dark:bg-[#111D35] border border-red-500/10 rounded-xl text-sm font-bold" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">৳ Consultation Fee</label>
                        <input type="number" {...register("fee")} className="w-full px-4 py-2.5 bg-white dark:bg-[#111D35] border border-red-500/10 rounded-xl text-sm font-bold" />
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><GraduationCap className="w-3 h-3" /> Academic Credentials</label>
                        <textarea {...register("education")} rows={3} className="w-full px-4 py-2.5 bg-white dark:bg-[#111D35] border border-red-500/10 rounded-xl text-sm font-bold resize-none" placeholder="e.g. MBBS (DMC), FCPS (Medicine)" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Verification & Documentation */}
            <div className={`p-8 space-y-8 ${isViewOnly ? 'flex-1 min-w-0 bg-slate-50 dark:bg-white/[0.01]' : 'w-full lg:w-[400px] shrink-0 bg-red-500/[0.02] dark:bg-white/[0.01] border-t lg:border-t-0 lg:border-l border-red-500/10'}`}>
              <div className="space-y-6 font-inter">
                <h3 className={`text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 ${isViewOnly ? 'text-blue-600' : 'text-red-500'}`}>
                  <span className={`w-6 h-[2px] rounded-full ${isViewOnly ? 'bg-blue-600' : 'bg-red-500'}`} />
                  Verification Details
                </h3>

                <div className={`rounded-2xl p-6 shadow-2xl space-y-6 border ${isViewOnly ? 'bg-white dark:bg-[#111D35] border-slate-200 dark:border-slate-800' : 'bg-white dark:bg-[#111D35] border-red-500/10'}`}>
                  {isViewOnly ? (
                    <>
                      <DataField label="BM&DC Number" value={doctor?.bmdcNumber} />
                      <DataField label="Professional Category" value={doctor?.doctorType} />
                    </>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">BM&DC Registration No.</label>
                        <div className="relative">
                          <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                          <input {...register("bmdcNumber")} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tighter" placeholder="e.g. A-12345" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Doctor Category</label>
                        <select {...register("doctorType")} className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold">
                          <option value="MBBS">Medical Practitioner (MBBS)</option>
                          <option value="BDS">Dental Practitioner (BDS)</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>

                {/* Documentation Box */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                    <span>Credentials Repository</span>
                    {doctor?.verificationDocument && (
                      <span className="px-2 py-1 bg-emerald-500 text-white text-[9px] rounded-full font-bold shadow-lg animate-pulse">VERIFIED DOC</span>
                    )}
                  </label>
                  
                  {doctor?.verificationDocument ? (
                    <div className={`group relative rounded-3xl overflow-hidden shadow-2xl aspect-video flex flex-col items-center justify-center border-4 border-dashed transition-all ${isViewOnly ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800' : 'bg-white dark:bg-[#111D35] border-red-500/20'}`}>
                      {/* Preview for images */}
                      {doctor.verificationDocument.match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
                        <>
                          <img src={doctor.verificationDocument} alt="Verification" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-all duration-500 scale-105 group-hover:scale-100" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-100 group-hover:opacity-0 transition-opacity" />
                        </>
                      ) : (
                        <FileText className="w-20 h-20 text-slate-300 mb-2" />
                      )}
                      
                      <div className="relative z-10 flex flex-col items-center text-center p-6 group-hover:translate-y-2 group-hover:opacity-0 transition-all duration-300">
                        <div className={`p-4 rounded-2xl mb-4 shadow-xl ${isViewOnly ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}>
                          <FileText className="w-10 h-10" />
                        </div>
                        <p className="text-sm font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">Certification File</p>
                        <p className="text-[11px] text-slate-500 font-bold mb-5">Audit-ready document</p>
                      </div>

                      <a 
                        href={doctor.verificationDocument} 
                        target="_blank" 
                        rel="noreferrer"
                        className={`absolute bottom-6 px-10 py-3 text-white rounded-2xl text-xs font-black transition-all shadow-[0_10px_20px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-y-1 active:scale-95 flex items-center gap-3 uppercase tracking-widest ${isViewOnly ? 'bg-blue-600 opacity-100' : 'bg-red-600 opacity-0 group-hover:opacity-100'} transition-opacity duration-300`}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Access File
                      </a>
                    </div>
                  ) : (
                    <div className="bg-slate-100 dark:bg-slate-900/50 border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center text-center">
                      <ShieldCheck className="w-16 h-16 text-slate-200 mb-4" />
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Document Missing</p>
                    </div>
                  )}
                </div>

                {/* Final Verification Status */}
                <div className={`p-6 rounded-3xl border-2 shadow-xl transition-all ${verifiedValue ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`text-xs font-black uppercase tracking-widest ${verifiedValue ? 'text-white' : 'text-amber-700'}`}>
                        {verifiedValue ? 'Doctor Status: ACTIVE' : 'Verification: PENDING'}
                      </h4>
                      <p className={`text-[10px] mt-1.5 font-bold ${verifiedValue ? 'text-white/80' : 'text-amber-600/80'}`}>
                        {verifiedValue 
                          ? 'Authentication verified. Profile public.'
                          : 'Manual review required before approval.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                       <Switch 
                        checked={verifiedValue} 
                        disabled={isViewOnly && doctor?.verified} 
                        onCheckedChange={(checked) => {
                          if (isViewOnly) {
                            if (checked && onVerify) {
                              onVerify(doctor.id);
                              setValue("verified", true);
                            }
                          } else {
                            setValue("verified", checked, { shouldDirty: true });
                          }
                        }}
                        className={verifiedValue ? "bg-white/30" : "bg-slate-200 dark:bg-white/10"}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="px-8 py-5 bg-white dark:bg-[#111D35] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-tighter">
                Session Secure & Encrypted
              </p>
            </div>
            <div className="flex gap-4">
              <button 
                type="button" 
                onClick={() => onOpenChange(false)} 
                className={`px-8 py-3 text-xs font-black uppercase tracking-widest rounded-2xl transition-all ${isViewOnly ? 'bg-slate-100 text-slate-800 hover:bg-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                {isViewOnly ? "Close Record" : "Abort Changes"}
              </button>
              {!isViewOnly && (
                <button 
                  onClick={handleSubmit(handleFormSubmit)}
                  disabled={isPending || uploading || !isDirty} 
                  className="px-12 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:grayscale"
                >
                  {isPending ? "Syncing..." : doctor ? "Apply Updates" : "Commit Record"}
                </button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
