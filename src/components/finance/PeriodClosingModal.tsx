"use client";

import React, { useState } from "react";
import {
  Lock,
  X,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
} from "lucide-react";
import { useFinance } from "@/context/FinanceContext";

interface PeriodClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PeriodClosingModal({
  isOpen,
  onClose,
}: PeriodClosingModalProps) {
  const { periods, activePeriod, closeAccountingPeriod, journalEntries, financialSummary } = useFinance();
  const [notes, setNotes] = useState("تم مراجعة ميزان المراجعة وإقرار ضريبة القيمة المضافة والمطابقات البنكية بالكامل.");
  const [confirmText, setConfirmText] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const postedCount = journalEntries.filter((j) => j.status === "POSTED").length;

  const handleClosePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText !== "إقفال") return;

    closeAccountingPeriod(activePeriod.id, "المدير المالي", notes);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black">إقفال الفترة المحاسبية وتجميد الحسابات</h3>
              <p className="text-[10px] text-slate-300">قفل الفترة يمنع أي تعديل أو إلغاء في العمليات السابقة بدون إذن خاص</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-slate-900">تم إقفال الفترة المحاسبية بنجاح!</h4>
            <p className="text-xs text-slate-500">تم تجميد القيود المحاسبية وترحيل الأرصدة الافتتاحية للفترة القادمة.</p>
          </div>
        ) : (
          <form onSubmit={handleClosePeriod} className="p-5 space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1.5">
              <div className="flex items-center gap-1.5 font-black text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span>أنت على وشك إقفال: {activePeriod.nameAr}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                سيتم تجميد عدد <strong>{postedCount}</strong> قيد محاسبي مرحل. لن يتمكن الكاشير أو المحاسب من تعديل فواتير أو سندات هذه الفترة.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">بيان وملاحظات الإقفال الشهري:</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-rewaq-gold focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                لتأكيد الإقفال، اكتب كلمة <strong className="text-rose-600 font-mono">"إقفال"</strong> في المربع أدناه:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="اكتب: إقفال"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-center focus:outline-none focus:border-rose-500 focus:bg-white transition"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={confirmText !== "إقفال"}
                className={`px-5 py-2 text-xs font-black rounded-xl shadow-xs transition cursor-pointer ${
                  confirmText === "إقفال"
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                إقفال الفترة رسمياً
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
