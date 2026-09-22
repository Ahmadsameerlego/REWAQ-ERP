"use client";

import React, { useState } from "react";
import { X, Plane, Calendar, Info, CheckCircle2 } from "lucide-react";
import { useHR } from "@/context/HRContext";

interface RequestLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RequestLeaveModal({ isOpen, onClose }: RequestLeaveModalProps) {
  const { employees, leaveTypes, leaveBalances, createLeaveRequest } = useHR();

  const [employeeId, setEmployeeId] = useState(employees[0]?.id || "");
  const [leaveTypeId, setLeaveTypeId] = useState(leaveTypes[0]?.id || "");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [daysCount, setDaysCount] = useState(1);
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const currentEmp = employees.find((e) => e.id === employeeId);
  const currentLeaveType = leaveTypes.find((l) => l.id === leaveTypeId);
  const currentBalance = leaveBalances.find((b) => b.employeeId === employeeId && b.leaveTypeId === leaveTypeId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      alert("يرجى كتابة سبب طلب الإجازة");
      return;
    }

    createLeaveRequest({
      employeeId,
      employeeName: currentEmp?.fullName || "",
      departmentName: currentEmp?.departmentName || "",
      leaveTypeId,
      leaveTypeName: currentLeaveType?.nameAr || "",
      startDate,
      endDate,
      daysCount: Number(daysCount) || 1,
      reason,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" dir="rtl">
        <div className="p-5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Plane className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">تقديم طلب إجازة (Leave Request)</h3>
              <p className="text-[11px] text-slate-400">تسجيل ومتابعة رصيد الإجازات السنوية والعارضة والمرضية</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">الموظف صاحب الطلب *</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} - {emp.departmentName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع الإجازة *</label>
              <select
                value={leaveTypeId}
                onChange={(e) => setLeaveTypeId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
              >
                {leaveTypes.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.nameAr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">عدد الأيام المطلوبة</label>
              <input
                type="number"
                min={1}
                max={30}
                required
                value={daysCount}
                onChange={(e) => setDaysCount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Current Balance Insight Pill */}
          {currentBalance && (
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-600" />
                <span>رصيد الإجازة المتبقي للموظف:</span>
              </span>
              <span className="font-bold font-mono text-sm text-emerald-800">{currentBalance.remainingDays} يوم متبقي</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">تاريخ البداية *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">تاريخ النهاية *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">سبب الإجازة *</label>
            <textarea
              required
              rows={2}
              placeholder="مثال: راحة سنوية / ظروف عائلية طارئة"
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
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>إرسال طلب الإجازة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
