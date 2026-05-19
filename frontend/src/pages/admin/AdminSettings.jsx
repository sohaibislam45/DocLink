import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchSettings, updateSettings } from "../../api/admin.js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema } from "../../schemas/adminSchemas.js";
import { motion } from "framer-motion";
import { Save, AlertCircle, Megaphone, Lock } from "lucide-react";
import { swalSuccess, swalError } from "../../lib/swal.js";
import { Switch } from "../../components/ui/Switch.jsx";

export default function AdminSettings() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: fetchSettings,
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(settingsSchema),
  });

  const { mutate: handleUpdate, isPending } = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      swalSuccess("Settings Saved", "Platform configuration has been updated.");
    },
    onError: (err) => swalError("Failed", err.response?.data?.error || err.message),
  });

  React.useEffect(() => {
    if (settings) {
      setValue("platformFee", settings.platformFee);
      setValue("maintenanceMode", settings.maintenanceMode);
      setValue("announcementBanner", settings.announcementBanner || "");
    }
  }, [settings, setValue]);

  const maintenanceMode = watch("maintenanceMode");

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">System Settings</h1>
        <p className="text-sm text-[#475569] dark:text-[#8B9FC4]">Configure platform-wide rules and announcements.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-32 bg-gray-100 dark:bg-white/5 rounded-xl" />
          <div className="h-32 bg-gray-100 dark:bg-white/5 rounded-xl" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(handleUpdate)} className="space-y-6">
          
          {/* Revenue Settings */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl border border-red-500/10 dark:border-red-500/10 bg-white dark:bg-[#0D1526]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Save className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-[#0F172A] dark:text-white">Revenue Configuration</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#475569] dark:text-[#8B9FC4]">
                  Platform Fee (%)
                </label>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="number"
                    {...register("platformFee")}
                    className="w-32 px-3 py-2 bg-white dark:bg-[#111D35] border border-red-500/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
                  />
                  <span className="text-xs text-[#475569] dark:text-[#8B9FC4]">
                    The percentage collected from every doctor consultation fee.
                  </span>
                </div>
                {errors.platformFee && <p className="text-red-500 text-xs mt-1">{errors.platformFee.message}</p>}
              </div>
            </div>
          </motion.div>

          {/* Maintenance Mode */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-xl border transition-colors ${
              maintenanceMode 
                ? "border-amber-500/30 bg-amber-500/5" 
                : "border-red-500/10 dark:border-red-500/10 bg-white dark:bg-[#0D1526]"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  maintenanceMode ? "bg-amber-500/20 text-amber-500" : "bg-blue-500/10 text-blue-500"
                }`}>
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-[#0F172A] dark:text-white">Maintenance Mode</h3>
              </div>
              <Switch
                checked={maintenanceMode}
                onCheckedChange={(checked) => setValue("maintenanceMode", checked)}
              />
            </div>
            <p className="text-xs text-[#475569] dark:text-[#8B9FC4]">
              {maintenanceMode 
                ? "Platform is currently restricted. Only administrators can access."
                : "Platform is live and accessible to all users."}
            </p>
          </motion.div>

          {/* Announcement */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl border border-red-500/10 dark:border-red-500/10 bg-white dark:bg-[#0D1526]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                <Megaphone className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-[#0F172A] dark:text-white">Announcement Banner</h3>
            </div>
            
            <div>
              <label className="text-sm font-medium text-[#475569] dark:text-[#8B9FC4]">
                Banner Message
              </label>
              <textarea
                {...register("announcementBanner")}
                rows={2}
                placeholder="E.g. We are offering free consultations for the next 24 hours!"
                className="mt-1 w-full px-3 py-2 bg-white dark:bg-[#111D35] border border-red-500/10 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
              <p className="text-[10px] text-[#475569] dark:text-[#8B9FC4] mt-1 italic">
                Leave empty to disable the banner on the landing page.
              </p>
              {errors.announcementBanner && <p className="text-red-500 text-xs mt-1">{errors.announcementBanner.message}</p>}
            </div>
          </motion.div>

          {/* Save Button */}
          <div className="flex justify-end sticky bottom-8">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save All Settings
            </button>
          </div>

        </form>
      )}
    </div>
  );
}
