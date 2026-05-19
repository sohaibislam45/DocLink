import React from "react";

export default function Pagination({ page, total, limit, onPageChange }) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-xs text-[#475569] dark:text-[#8B9FC4]">
        Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1.5 rounded-lg text-xs border
                     border-red-500/20 disabled:opacity-40
                     text-[#475569] dark:text-[#8B9FC4]
                     hover:bg-red-500/5 transition-colors"
        >
          ← Prev
        </button>
        <span className="px-3 py-1.5 text-xs text-[#0F172A] dark:text-[#F0F4FF]">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1.5 rounded-lg text-xs border
                     border-red-500/20 disabled:opacity-40
                     text-[#475569] dark:text-[#8B9FC4]
                     hover:bg-red-500/5 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
