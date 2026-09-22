"use client";

import React, { useState } from "react";
import { X, Banknote, Calendar, Building, CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";
import { useHR } from "@/context/HRContext";

interface CreatePayrollRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessNavigate?: (runId: string) => void;
}

export default function CreatePayrollRunModal({ isOpen, onClose, onSuccessNavigate }: CreatePayrollRunModalProps) {
  const { createPayrollRun, employees } = useHR();

  const [month, setMonth] = useState(10); // October
  const [year, setYear] = useState(2026);
  const [branchId, setBranchId] = useState("ALL");

  if (!isOpen) return null;

  const eligibleCount = employees.filter((e) => {
    if (e.status === "TERMINATED") return false;
    if (branchId !== "ALL" && e.branchId !== branchId) return false;
    return true;
  }).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const run = createPayrollRun(Number(month), Number(year), branchId, "أحمد سمير");
    onClose();
    if (onSuccessNavigate) {
      onSuccessNavigate(run.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" dir="rtl">
        <div className="p-5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rewaq-gold/20 border border-rewaq-gold/40 flex items-center justify-center text-rewaq-gold">
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">إنشاء واحتساب مسير رواتب شهري</h3>
              <p className="text-[11px] text-slate-400">حساب آلي للبدلات، الحوافز، الغياب، أقساط السلف، والضرائب والتأمينات</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">الشهر *</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
              >
                <option value={1}>يناير (01)</option>
                <option value={2}>فبراير (02)</option>
                <option value={3}>مارس (03)</option>
                <option value={4}>أبريل (04)</option>
                <option value={5}>مايو (05)</option>
                <option value={6}>يونيو (06)</option>
                <option value={7}>يوليو (07)</option>
                <option value={8}>أغسطس (08)</option>
                <option value={9}>سبتمبر (09)</option>
                <option value={10}>أكتوبر (10)</option>
                <option value={11}>نوفمبر (11)</option>
                <option value={12}>ديسمبر (12)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">السنة المالية *</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">نطاق الفرع *</label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
            >
              <option value="ALL">كل الفروع مجمعة (مسير عام للشركة)</option>
              <option value="branch-cairo">فرع التجمع الخامس (الرئيسي)</option>
              <option value="branch-october">فرع 6 أكتوبر (المول)</option>
              <option value="branch-tanta">فرع طنطا (الدلتا)</option>
              <option value="branch-damietta">مستودع ومصنع دمياط</option>
            </select>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-700">
            <div className="flex items-center justify-between font-bold">
              <span>عدد الموظفين المؤهلين للمسير:</span>
              <span className="text-sm font-mono text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">{eligibleCount} موظف</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              سيقوم المحرك الذكي بجلب سجلات الحضور والانصراف لشهر المسير، حساب التأخير والغياب والإضافي، خصم أقساط السلف النشطة، وتطبيق ضريبة كسب العمل المصرية والتأمينات الاجتماعية تلقائياً.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition">
              إلغاء
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-black bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 shadow-md transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>بدء الاحتساب الذكي للمسير</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
