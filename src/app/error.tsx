"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">حدث خطأ غير متوقع</h2>
      <p className="text-xs text-slate-400 max-w-md mb-6">{error.message || "يرجى المحاولة مرة أخرى"}</p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
        >
          <RotateCcw className="w-4 h-4" />
          <span>إعادة المحاولة</span>
        </button>
        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-white px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 transition"
        >
          الرئيسية
        </Link>
      </div>
    </div>
  );
}
