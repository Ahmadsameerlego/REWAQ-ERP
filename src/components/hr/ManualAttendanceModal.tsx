"use client";

import React, { useState } from "react";
import { X, Clock, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { useHR } from "@/context/HRContext";
import { AttendanceStatus } from "@/types/hr";

interface ManualAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ManualAttendanceModal({ isOpen, onClose }: ManualAttendanceModalProps) {
  const { employees, addManualAttendance } = useHR();

  const [employeeId, setEmployeeId] = useState(employees[0]?.id || "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [checkIn, setCheckIn] = useState("09:00");
  const [checkOut, setCheckOut] = useState("17:00");
  const [status, setStatus] = useState<AttendanceStatus>("PRESENT");
  const [lateMinutes, setLateMinutes] = useState(0);
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      alert("يرجى كتابة سبب التسجيل اليدوي لسجل التدقيق");
      return;
    }

    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;

    addManualAttendance(
      {
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        employeeName: emp.fullName,
        branchId: emp.branchId,
        branchName: emp.branchName,
        departmentName: emp.departmentName,
        date,
        checkIn: status === "ABSENT" || status === "LEAVE" ? undefined : checkIn,
        checkOut: status === "ABSENT" || status === "LEAVE" ? undefined : checkOut,
        workHours: status === "PRESENT" || status === "LATE" ? 8 : 0,
        lateMinutes: Number(lateMinutes) || 0,
        earlyLeaveMinutes: 0,
        overtimeHours: Number(overtimeHours) || 0,
        status,
        source: "MANUAL",
        notes: reason,
      },
      "أحمد سمير",
      reason
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" dir="rtl">
        <div className="p-5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">تسجيل أو تعديل حضور يدوي</h3>
              <p className="text-[11px] text-slate-400">يتم تسجيل اسم المعدل وسبب التعديل في سجل الرقابة والتدقيق</p>
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
                  {emp.fullName} ({emp.employeeCode}) - {emp.positionTitle}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">التاريخ *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">حالة الحضور *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
              >
                <option value="PRESENT">حاضر (Present)</option>
                <option value="LATE">متأخر (Late)</option>
                <option value="ABSENT">غائب (Absent)</option>
                <option value="LEAVE">إجازة (On Leave)</option>
              </select>
            </div>
          </div>

          {status !== "ABSENT" && status !== "LEAVE" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">وقت الدخول</label>
                <input
                  type="time"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">وقت الانصراف</label>
                <input
                  type="time"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">دقائق التأخير (إن وجدت)</label>
              <input
                type="number"
                min={0}
                value={lateMinutes}
                onChange={(e) => setLateMinutes(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">ساعات العمل الإضافي</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">سبب التعديل أو التسجيل اليدوي *</label>
            <textarea
              required
              rows={2}
              placeholder="مثال: عطل مؤقت في جهاز البصمة بالفرع / مأمورية خارجية لزيارة عميل بالفيلا"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-rewaq-gold"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-2 text-[11px] text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>سيتم توثيق هذا الإجراء وتأثيره على مسير الرواتب القادم تلقائياً.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>حفظ واعتماد الحضور</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
