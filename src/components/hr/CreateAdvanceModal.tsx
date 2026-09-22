"use client";

import React, { useState } from "react";
import { X, HandCoins, Calendar, Info, CheckCircle2, Calculator } from "lucide-react";
import { useHR } from "@/context/HRContext";
import { formatEGP } from "@/lib/hrEngine";

interface CreateAdvanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateAdvanceModal({ isOpen, onClose }: CreateAdvanceModalProps) {
  const { employees, createAdvance } = useHR();

  const [employeeId, setEmployeeId] = useState(employees[0]?.id || "");
  const [totalAmount, setTotalAmount] = useState(6000);
  const [installmentCount, setInstallmentCount] = useState(3);
  const [startMonth, setStartMonth] = useState("2026-10");
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const currentEmp = employees.find((e) => e.id === employeeId);
  const monthlyInstallment = Math.round((Number(totalAmount) || 0) / (Number(installmentCount) || 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      alert("يرجى كتابة سبب طلب السلفة");
      return;
    }

    createAdvance(
      {
        employeeId,
        employeeName: currentEmp?.fullName || "",
        departmentName: currentEmp?.departmentName || "",
        branchName: currentEmp?.branchName || "",
        requestDate: new Date().toISOString().split("T")[0],
        totalAmount: Number(totalAmount),
        installmentCount: Number(installmentCount),
        monthlyInstallment,
        startMonth,
        reason,
      },
      "أحمد سمير"
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" dir="rtl">
        <div className="p-5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <HandCoins className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">طلب سلفة موظف (Employee Loan / Advance)</h3>
              <p className="text-[11px] text-slate-400">ربط السلفة بمسير الرواتب وجدولة الخصم الآلي شهرياً</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">اختر الموظف *</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} - الراتب: {formatEGP(emp.basicSalary)} ({emp.branchName})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">مبلغ السلفة الإجمالي (ج.م) *</label>
              <input
                type="number"
                min={500}
                step={500}
                required
                value={totalAmount}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-black text-purple-900 focus:bg-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">عدد أشهر السداد (الأقساط) *</label>
              <select
                value={installmentCount}
                onChange={(e) => setInstallmentCount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
              >
                <option value={1}>شهر واحد (دفعة واحدة)</option>
                <option value={2}>شهرين</option>
                <option value={3}>3 أشهر</option>
                <option value={4}>4 أشهر</option>
                <option value={6}>6 أشهر</option>
                <option value={10}>10 أشهر</option>
                <option value={12}>12 شهر (سنة)</option>
              </select>
            </div>
          </div>

          {/* Installment Summary Calculation */}
          <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 flex items-center justify-between text-xs text-purple-900">
            <span className="flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-purple-600" />
              <span>قسط الخصم الشهري من الراتب:</span>
            </span>
            <span className="font-mono font-black text-sm text-purple-800">{formatEGP(monthlyInstallment)} / شهرياً</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">شهر بدء الخصم من الراتب *</label>
            <input
              type="month"
              required
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">سبب السلفة وملاحظات الإدارة *</label>
            <textarea
              required
              rows={2}
              placeholder="مثال: مصاريف طبية طارئة / صيانة وتجهيزات منزلية"
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
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black bg-purple-700 hover:bg-purple-800 text-white shadow-md transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>اعتماد وجدولة السلفة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
