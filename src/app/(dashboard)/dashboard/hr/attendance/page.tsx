"use client";

import React, { useState } from "react";
import { Clock, Plus, Search, Calendar, CheckCircle2, AlertTriangle, Users2, ShieldCheck, ArrowRight } from "lucide-react";
import HrNav from "@/components/hr/HrNav";
import ManualAttendanceModal from "@/components/hr/ManualAttendanceModal";
import { useHR } from "@/context/HRContext";
import { AttendanceStatus } from "@/types/hr";

export default function AttendancePage() {
  const { attendanceRecords, employees, hrMetrics, recordPunch } = useHR();

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterDate, setFilterDate] = useState("2026-09-22");

  const filteredAttendance = attendanceRecords.filter((att) => {
    if (filterDate && att.date !== filterDate) return false;
    if (filterStatus !== "ALL" && att.status !== filterStatus) return false;
    if (searchQuery && !att.employeeName.includes(searchQuery) && !att.employeeCode.includes(searchQuery)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <HrNav onOpenAttendanceModal={() => setIsManualModalOpen(true)} />

      {/* Header & KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-slate-400 block text-xs font-bold mb-1">إجمالي الحضور اليوم</span>
          <span className="text-2xl font-black font-mono text-emerald-700">{hrMetrics.todayPresentCount} حاضر</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-slate-400 block text-xs font-bold mb-1">حالات التأخير</span>
          <span className="text-2xl font-black font-mono text-amber-700">{hrMetrics.todayLateCount} تأخير</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-slate-400 block text-xs font-bold mb-1">حالات الغياب</span>
          <span className="text-2xl font-black font-mono text-rose-700">{hrMetrics.todayAbsentCount} غياب</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-slate-400 block text-xs font-bold mb-1">إجازات معتمدة</span>
          <span className="text-2xl font-black font-mono text-blue-700">{hrMetrics.todayLeaveCount} إجازة</span>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-rewaq-gold" />
              <span>دفتر الحضور والانصراف (Attendance Ledger)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              متابعة البصمات وساعات العمل الفردية والإضافي والتأخيرات
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-rewaq-gold font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل حضور / مأمورية يدوي</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث باسم الموظف أو الكود..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-8 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-rewaq-gold"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
          </div>

          <div>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
            >
              <option value="ALL">كل الحالات</option>
              <option value="PRESENT">حاضر (Present)</option>
              <option value="LATE">متأخر (Late)</option>
              <option value="ABSENT">غائب (Absent)</option>
              <option value="LEAVE">إجازة (Leave)</option>
            </select>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 pr-6">الموظف</th>
                  <th className="p-3.5">الفرع والقسم</th>
                  <th className="p-3.5">التاريخ</th>
                  <th className="p-3.5">وقت الدخول</th>
                  <th className="p-3.5">وقت الخروج</th>
                  <th className="p-3.5">ساعات العمل</th>
                  <th className="p-3.5">التأخير (دقيقة)</th>
                  <th className="p-3.5">الإضافي (ساعات)</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5">المصدر والملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendance.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50">
                    <td className="p-3.5 pr-6">
                      <span className="font-bold text-slate-900 block">{att.employeeName}</span>
                      <span className="text-[10px] font-mono text-slate-400">{att.employeeCode}</span>
                    </td>
                    <td className="p-3.5">
                      <div className="text-slate-800">{att.branchName}</div>
                      <div className="text-[10px] text-slate-400">{att.departmentName}</div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-800">{att.date}</td>
                    <td className="p-3.5 font-mono text-slate-800">{att.checkIn || "-"}</td>
                    <td className="p-3.5 font-mono text-slate-800">{att.checkOut || "-"}</td>
                    <td className="p-3.5 font-mono font-bold">{att.workHours} س</td>
                    <td className="p-3.5 font-mono text-amber-700">
                      {att.lateMinutes > 0 ? `${att.lateMinutes} د` : "-"}
                    </td>
                    <td className="p-3.5 font-mono text-blue-700">
                      {att.overtimeHours > 0 ? `+${att.overtimeHours} س` : "-"}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          att.status === "PRESENT"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : att.status === "LATE"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : att.status === "LEAVE"
                            ? "bg-blue-50 text-blue-800 border border-blue-200"
                            : "bg-rose-50 text-rose-800 border border-rose-200"
                        }`}
                      >
                        {att.status === "PRESENT"
                          ? "حاضر"
                          : att.status === "LATE"
                          ? "متأخر"
                          : att.status === "LEAVE"
                          ? "إجازة"
                          : "غائب"}
                      </span>
                    </td>
                    <td className="p-3.5 text-[11px] text-slate-500">
                      {att.source === "MANUAL" ? (
                        <span className="text-blue-700 font-medium">يدوي: {att.notes || att.modificationReason}</span>
                      ) : (
                        <span>بصمة حيوية</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ManualAttendanceModal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} />
    </div>
  );
}
