"use client";

import React, { useState } from "react";
import { X, TrendingUp, History, CheckCircle2, ShieldCheck } from "lucide-react";
import { useHR } from "@/context/HRContext";
import { Employee } from "@/types/hr";
import { formatEGP } from "@/lib/hrEngine";

interface SalaryChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: Employee;
}

export default function SalaryChangeModal({ isOpen, onClose, employee }: SalaryChangeModalProps) {
  const { changeEmployeeSalary } = useHR();

  const [newSalary, setNewSalary] = useState(employee?.basicSalary || 10000);
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState("");

  if (!isOpen || !employee) return null;

  const currentSalary = employee.basicSalary;
  const difference = Number(newSalary) - currentSalary;
  const diffPct = currentSalary > 0 ? (difference / currentSalary) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      alert("يرجى كتابة سبب تعديل الراتب لسجل التعديلات التاريخي");
      return;
    }

    changeEmployeeSalary(employee.id, Number(newSalary), reason, effectiveDate, "أحمد سمير");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" dir="rtl">
        <div className="p-5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">تعديل الراتب وحفظ السجل التاريخي (Salary History)</h3>
              <p className="text-[11px] text-slate-400">يتم تسجيل التعديل مع تاريخ النفاذ وسبب التغيير في سجل الموظف</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">الموظف:</span>
              <span className="text-sm font-bold text-slate-900">{employee.fullName}</span>
              <span className="text-xs text-slate-400 block">{employee.positionTitle} - {employee.branchName}</span>
            </div>
            <div className="text-left">
              <span className="text-xs text-slate-500 block">الراتب الأساسي الحالي:</span>
              <span className="text-base font-black font-mono text-slate-900">{formatEGP(currentSalary)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">الراتب الأساسي الجديد (ج.م) *</label>
              <input
                type="number"
                required
                min={1000}
                value={newSalary}
                onChange={(e) => setNewSalary(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-black text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">تاريخ النفاذ والبدء *</label>
              <input
                type="date"
                required
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Variance Box */}
          <div
            className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
              difference > 0
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : difference < 0
                ? "bg-rose-50 border-rose-200 text-rose-900"
                : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <span>الفارق المالي الشهري:</span>
            <span className="font-mono">
              {difference > 0 ? `+${formatEGP(difference)} (${diffPct.toFixed(1)}% زيادة)` : `${formatEGP(difference)} (${diffPct.toFixed(1)}%)`}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">سبب تعديل الراتب *</label>
            <textarea
              required
              rows={2}
              placeholder="مثال: علاوة سنوية / ترقية لمنصب مدير فرع / تسوية وفق لائحة الشركة"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-rewaq-gold"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition">
              إلغاء
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>حفظ التعديل في السجل التاريخي</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
