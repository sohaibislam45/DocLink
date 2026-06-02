import React from "react";
import * as Lucide from "lucide-react";
import logoImg from "../../assets/logo.png";

/**
 * PrescriptionPreviewCard
 *
 * Props:
 *  - form          : { patientName, age, gender, weight, diagnosis, notes }
 *  - medicines     : [{ name, dosage, frequency, duration }]
 *  - doctorName    : string
 *  - doctorSpeciality : string (optional)
 *  - dateStr       : string
 *  - prescriptionId  : string (optional)
 */
const PrescriptionPreviewCard = ({ form, medicines, doctorName, doctorSpeciality, dateStr, prescriptionId }) => {
  return (
    <div className="bg-white border border-gray-200 overflow-hidden shadow-2xl relative flex flex-col min-h-[700px] w-full text-gray-800">

      {/* HEADER SECTION */}
      <div className="relative bg-gradient-to-r from-accent-primary to-accent-secondary pt-10 pb-12 px-8 shadow-sm">
        <div className="relative z-10 max-w-[80%]">
          <h2 className="text-white text-3xl font-bold tracking-wide uppercase mb-2 drop-shadow-sm">
            {doctorName}
          </h2>
          {doctorSpeciality && (
            <p className="text-white/90 text-[11px] font-semibold tracking-widest uppercase mb-1">
              {doctorSpeciality}
            </p>
          )}
          {prescriptionId && (
            <p className="text-white/60 text-[9px] font-mono tracking-widest uppercase mt-1">
              Prescription ID: {prescriptionId}
            </p>
          )}
        </div>

        {/* Overlapping Badge with Logo */}
        <div className="absolute -bottom-10 right-8 z-20 w-24 h-24 bg-white rounded-full border-4 border-gray-50 shadow-[0_4px_15px_rgba(0,0,0,0.1)] flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border border-gray-100 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]"></div>
            <img src={logoImg} alt="DocLink" className="w-10 h-10 object-contain relative z-10" />
          </div>
        </div>
      </div>

      {/* BODY SECTION */}
      <div className="px-8 pt-12 pb-4 flex-1 flex flex-col">

        {/* Patient Info Grid */}
        <div className="space-y-4 mb-8 relative z-10">
          <div className="flex gap-6">
            <div className="flex flex-1 items-end">
              <span className="text-[10px] font-bold text-gray-700 tracking-wider uppercase whitespace-nowrap mr-2 pb-1">
                Patient Name:
              </span>
              <span className="text-xs font-semibold flex-1 border-b border-gray-300 pb-1 px-1 min-w-[50px]">
                {form.patientName || ""}
              </span>
            </div>
            <div className="flex items-end w-48">
              <span className="text-[10px] font-bold text-gray-700 tracking-wider uppercase whitespace-nowrap mr-2 pb-1">
                Date:
              </span>
              <span className="text-xs font-semibold flex-1 border-b border-gray-300 pb-1 px-1 min-w-[50px]">
                {dateStr}
              </span>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex items-end w-32">
              <span className="text-[10px] font-bold text-gray-700 tracking-wider uppercase whitespace-nowrap mr-2 pb-1">
                Age:
              </span>
              <span className="text-xs font-semibold flex-1 border-b border-gray-300 pb-1 px-1 min-w-[30px]">
                {form.age || ""}
              </span>
            </div>
            <div className="flex items-end flex-1">
              <span className="text-[10px] font-bold text-gray-700 tracking-wider uppercase whitespace-nowrap mr-2 pb-1">
                Gender:
              </span>
              <span className="text-xs font-semibold flex-1 border-b border-gray-300 pb-1 px-1 min-w-[30px]">
                {form.gender || ""}
              </span>
            </div>
            <div className="flex items-end flex-1">
              <span className="text-[10px] font-bold text-gray-700 tracking-wider uppercase whitespace-nowrap mr-2 pb-1">
                Weight:
              </span>
              <span className="text-xs font-semibold flex-1 border-b border-gray-300 pb-1 px-1 min-w-[30px]">
                {form.weight ? `${form.weight} kg` : ""}
              </span>
            </div>
          </div>

          <div className="flex items-end">
            <span className="text-[10px] font-bold text-gray-700 tracking-wider uppercase whitespace-nowrap mr-2 pb-1">
              Diagnosis:
            </span>
            <span className="text-xs font-bold text-accent-primary flex-1 border-b border-gray-300 pb-1 px-1 min-w-[50px] leading-tight">
              {form.diagnosis || ""}
            </span>
          </div>
        </div>

        {/* Rx Section */}
        <div className="flex gap-6 mt-4">
          {/* Rx Symbol with ECG line */}
          <div className="shrink-0 pt-2 flex items-center text-accent-primary">
            <span className="italic text-5xl tracking-tighter leading-none pr-1">
              Rx
            </span>
            <svg width="40" height="30" viewBox="0 0 100 50" className="stroke-accent-primary opacity-60 ml-[-5px]" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="0,25 20,25 30,10 45,45 55,15 65,35 75,25 100,25" />
            </svg>
          </div>

          {/* Medicines List */}
          <div className="flex-1 space-y-5 pt-3">
            {medicines.filter(m => m && m.name).length === 0 ? (
              <p className="text-gray-400 text-[11px] italic">No medicines prescribed.</p>
            ) : (
              medicines.map((med, idx) => (
                med && med.name ? (
                  <div key={idx} className="space-y-1">
                    <p className="font-bold text-accent-primary text-[13px] uppercase tracking-wide">
                      {med.name}{med.dosage && <span className="text-gray-800 ml-1">{med.dosage}</span>}
                    </p>
                    <p className="text-gray-800 text-[11px] font-medium">
                      {med.frequency}{med.duration && ` for ${med.duration}`}
                    </p>
                  </div>
                ) : null
              ))
            )}

            {/* Notes Section */}
            {form.notes && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2">
                  Additional Notes:
                </p>
                <p className="text-[11px] text-gray-800 italic">
                  {form.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Signature Area */}
        <div className="mt-auto pt-12 flex justify-end">
          <div className="w-72 text-center">
            <div className="border-b border-gray-400 mb-2 relative" style={{ minHeight: "2.5rem" }}>
              <span
                className="absolute bottom-0 left-0 right-0 text-accent-primary/85 transform -rotate-2 select-none"
                style={{ fontFamily: "'Dancing Script', cursive", fontSize: "1.5rem", lineHeight: 1.2 }}
              >
                {doctorName}
              </span>
            </div>
            <p className="text-[10px] font-bold text-gray-800 tracking-wider">SIGNATURE</p>
            <p className="text-[8px] text-gray-400 uppercase tracking-widest mt-1">
              {dateStr}
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER SECTION */}
      <div className="bg-accent-primary text-white px-8 py-4 flex items-center justify-between text-[10px] font-semibold tracking-wider">
        <span>DocLink Healthcare</span>
        <div className="flex items-center gap-6 text-white/90">
          <span className="flex items-center gap-1.5">
            <Lucide.MapPin className="w-3 h-3 text-white/70" />
            Uttara Sector 10, Dhaka
          </span>
          <span className="flex items-center gap-1.5">
            <Lucide.Phone className="w-3 h-3 text-white/70" />
            01812345678
          </span>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionPreviewCard;
