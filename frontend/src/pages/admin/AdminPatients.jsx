import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchAdminPatients, updatePatient, deletePatient 
} from "../../api/admin.js";
import { motion } from "framer-motion";
import { Pencil, Trash2, Search, X } from "lucide-react";
import { swalConfirm, swalSuccess, swalError, swalToast } from "../../lib/swal.js";
import Pagination from "../../components/common/Pagination.jsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/Dialog.jsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminPatientSchema } from "../../schemas/adminSchemas.js";

export default function AdminPatients() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-patients", search, page],
    queryFn: () => fetchAdminPatients({ search, page, limit: 10 }),
  });

  const { mutate: handleEdit, isPending: editPending } = useMutation({
    mutationFn: ({ uid, data }) => updatePatient(uid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-patients"] });
      setIsModalOpen(false);
      setEditingPatient(null);
      swalSuccess("Updated", "Patient profile has been updated.");
    },
    onError: (err) => swalError("Failed", err.response?.data?.error || err.message),
  });

  const { mutate: handleDeleteAction } = useMutation({
    mutationFn: deletePatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-patients"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      swalToast("success", "Patient deleted successfully.");
    },
    onError: (err) => swalError("Failed", err.response?.data?.error || err.message),
  });

  const openEditModal = (patient) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  const confirmDelete = async (patient) => {
    const result = await swalConfirm(
      `Delete ${patient.name}?`,
      "This will permanently remove the patient and all their consultations, prescriptions, and queue entries.",
      "Delete"
    );
    if (result.isConfirmed) {
      handleDeleteAction(patient.uid);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Manage Patients</h1>
        <p className="text-sm text-[#475569] dark:text-[#8B9FC4]">View and manage platform users.</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569] dark:text-[#8B9FC4]" />
          <input
            type="text"
            placeholder="Search by name or email..."
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
              {["Patient", "Email", "Gender", "Blood Type", "Joined", "Actions"].map(h => (
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
                  <td colSpan={6} className="px-4 py-4 h-16 bg-gray-50/50 dark:bg-gray-800/10"></td>
                </tr>
              ))
            ) : data?.patients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[#475569] dark:text-[#8B9FC4]">
                  No patients found matching your search.
                </td>
              </tr>
            ) : (
              data?.patients.map(patient => (
                <tr key={patient.uid} className="hover:bg-red-500/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 text-xs font-bold border border-red-500/20 overflow-hidden">
                        {patient.photoURL ? (
                          <img src={patient.photoURL} alt={patient.name} className="w-full h-full object-cover" />
                        ) : (
                          patient.name?.charAt(0).toUpperCase() || "P"
                        )}
                      </div>
                      <p className="font-medium text-[#0F172A] dark:text-[#F0F4FF]">{patient.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#475569] dark:text-[#8B9FC4]">{patient.email}</td>
                  <td className="px-4 py-3 text-[#475569] dark:text-[#8B9FC4] capitalize">{patient.gender || "—"}</td>
                  <td className="px-4 py-3">
                    {patient.bloodType ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 uppercase">
                        {patient.bloodType}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-[#475569] dark:text-[#8B9FC4]">
                    {new Date(patient.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditModal(patient)} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => confirmDelete(patient)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors">
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

      <PatientModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        patient={editingPatient}
        onSubmit={(data) => handleEdit({ uid: editingPatient.uid, data })}
        isPending={editPending}
      />
    </div>
  );
}

function PatientModal({ open, onOpenChange, patient, onSubmit, isPending }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(adminPatientSchema),
  });

  const [photoURL, setPhotoURL] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    if (open && patient) {
      reset({
        name: patient.name,
        phone: patient.phone || "",
        dob: patient.dob || "",
        gender: patient.gender || "",
        bloodType: patient.bloodType || "",
        allergies: patient.allergies || "",
      });
      setPhotoURL(patient.photoURL || "");
    }
  }, [open, patient, reset]);

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
        setPhotoURL(json.data.url);
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
    onSubmit({
      ...data,
      photoURL: photoURL || undefined
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Edit Patient Profile</DialogTitle>
            <button onClick={() => onOpenChange(false)} className="text-[#475569] dark:text-[#8B9FC4] hover:text-red-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
          
          {/* Patient Photo Upload */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center 
                          text-red-500 text-lg font-bold shrink-0 overflow-hidden 
                          border-2 border-red-500/20 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <svg className="animate-spin w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : photoURL ? (
                <img src={photoURL} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold opacity-80">Photo</span>
              )}
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-[#475569] dark:text-[#8B9FC4] uppercase">
                Patient Photo
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
                <Pencil className="w-3 h-3" />
                {uploading ? "Uploading..." : photoURL ? "Change Photo" : "Upload Photo"}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#475569] dark:text-[#8B9FC4] uppercase">Full Name</label>
            <input {...register("name")} className="w-full mt-1 px-3 py-2 bg-white dark:bg-[#111D35] border border-red-500/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30" />
            {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#475569] dark:text-[#8B9FC4] uppercase">Phone</label>
              <input {...register("phone")} className="w-full mt-1 px-3 py-2 bg-white dark:bg-[#111D35] border border-red-500/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#475569] dark:text-[#8B9FC4] uppercase">Date of Birth</label>
              <input type="date" {...register("dob")} className="w-full mt-1 px-3 py-2 bg-white dark:bg-[#111D35] border border-red-500/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#475569] dark:text-[#8B9FC4] uppercase">Gender</label>
              <select {...register("gender")} className="w-full mt-1 px-3 py-2 bg-white dark:bg-[#111D35] border border-red-500/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#475569] dark:text-[#8B9FC4] uppercase">Blood Type</label>
              <select {...register("bloodType")} className="w-full mt-1 px-3 py-2 bg-white dark:bg-[#111D35] border border-red-500/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30">
                <option value="">Select Blood Type</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bt => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#475569] dark:text-[#8B9FC4] uppercase">Allergies</label>
            <textarea {...register("allergies")} rows={3} className="w-full mt-1 px-3 py-2 bg-white dark:bg-[#111D35] border border-red-500/10 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/30"></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-red-500/10">
            <button type="button" onClick={() => onOpenChange(false)} className="px-4 py-2 text-sm font-medium text-[#475569] dark:text-[#8B9FC4] hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isPending || uploading} className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50">
              {isPending ? "Saving..." : "Update Patient"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
