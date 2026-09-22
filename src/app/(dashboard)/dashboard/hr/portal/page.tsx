"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Clock,
  Plane,
  Banknote,
  HandCoins,
  CheckCircle2,
  Calendar,
  Building,
  User,
  ShieldCheck,
  Eye,
  Plus,
} from "lucide-react";
import HrNav from "@/components/hr/HrNav";
import RequestLeaveModal from "@/components/hr/RequestLeaveModal";
import CreateAdvanceModal from "@/components/hr/CreateAdvanceModal";
import PayslipModal from "@/components/hr/PayslipModal";
import { useHR } from "@/context/HRContext";
import { formatEGP } from "@/lib/hrEngine";
import { Payslip } from "@/types/hr";

export default function EmployeeSelfServicePortal() {
  const {
    employees,
    currentEmployeeId,
    setCurrentEmployeeId,
    attendanceRecords,
    recordPunch,
    leaveBalances,
    leaveRequests,
    advances,
    payslips,
  } = useHR();

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [viewingPayslip, setViewingPayslip] = useState<Payslip | undefined>(undefined);
  const [punchSuccessMessage, setPunchSuccessMessage] = useState("");

  const employee = employees.find((e) => e.id === currentEmployeeId) || employees[0];

  const todayStr = "2026-09-22";
  const todayAttendance = attendanceRecords.find((a) => a.employeeId === employee.id && a.date === todayStr);

  const empBalances = leaveBalances.filter((b) => b.employeeId === employee.id);
  const empLeaves = leaveRequests.filter((l) => l.employeeId === employee.id);
  const empAdvances = advances.filter((a) => a.employeeId === employee.id);
  const empPayslips = payslips.filter((p) => p.employeeId === employee.id);

  const handlePunch = (type: "CHECK_IN" | "CHECK_OUT") => {
    const record = recordPunch(employee.id, type, "PORTAL");
    setPunchSuccessMessage(type === "CHECK_IN" ? `تم تسجيل حضورك بنجاح الساعة ${record.checkIn}` : `تم تسجيل انصرافك بنجاح الساعة ${record.checkOut}`);
    setTimeout(() => setPunchSuccessMessage(""), 4000);
  };

  return (
    <div className="space-y-6">
      <HrNav />

      {/* Top Employee Simulator Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-rewaq-gold flex items-center justify-center font-black text-lg border border-slate-700 shrink-0">
            {employee.avatarUrl ? (
              <img src={employee.avatarUrl} alt={employee.fullName} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <span>{employee.fullName.slice(0, 2)}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-black text-slate-900">مرحباً، {employee.fullName}</h2>
              <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                {employee.employeeCode}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {employee.positionTitle} • {employee.departmentName} • {employee.branchName}
            </p>
          </div>
        </div>

        {/* Switch Logged-in Employee (Simulation) */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 text-xs">
          <User className="w-4 h-4 text-rewaq-gold" />
          <span className="text-slate-500 font-medium">تسجيل الدخول كموظف:</span>
          <select
            value={currentEmployeeId}
            onChange={(e) => setCurrentEmployeeId(e.target.value)}
            className="bg-transparent font-bold text-slate-900 text-xs focus:outline-none cursor-pointer"
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName} ({emp.positionTitle} - {emp.branchName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {punchSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{punchSuccessMessage}</span>
        </div>
      )}

      {/* Main Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Live Punch In/Out Card */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-6 text-white border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-rewaq-gold uppercase tracking-wider">تسجيل الحضور والانصراف الذاتي</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>

            <div className="py-4 text-center space-y-1">
              <span className="text-3xl font-black font-mono text-white block">
                {new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className="text-xs text-slate-400 block">{employee.scheduleName}</span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">تسجيل الدخول اليوم:</span>
                <span className="font-mono font-bold text-emerald-400">{todayAttendance?.checkIn || "لم يسجل بعد"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">تسجيل الخروج اليوم:</span>
                <span className="font-mono font-bold text-slate-300">{todayAttendance?.checkOut || "قيد الدوام"}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handlePunch("CHECK_IN")}
              className="py-3 px-4 rounded-2xl bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs shadow-md transition cursor-pointer"
            >
              تسجيل حضور 🟢
            </button>
            <button
              onClick={() => handlePunch("CHECK_OUT")}
              className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition cursor-pointer"
            >
              تسجيل انصراف 🔴
            </button>
          </div>
        </div>

        {/* Center: Leave Balance & Quick Request */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Plane className="w-4 h-4 text-emerald-600" />
                <span>رصيد الإجازات السنوية</span>
              </h3>
              <button
                onClick={() => setIsLeaveModalOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>طلب إجازة</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {empBalances.map((b) => (
                <div key={b.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 block">{b.leaveTypeName}</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-black font-mono text-emerald-700">{b.remainingDays}</span>
                    <span className="text-[10px] text-slate-400">يوم متبقي</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3">
              <span className="text-[11px] font-bold text-slate-400 block mb-1.5">آخر الطلبات المقدمة:</span>
              <div className="space-y-1.5 text-xs">
                {empLeaves.slice(0, 2).map((l) => (
                  <div key={l.id} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span>{l.leaveTypeName} ({l.daysCount} أيام)</span>
                    <span className="font-bold text-[10px] text-emerald-800">{l.status === "APPROVED" ? "معتمد" : "معلق"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition"
          >
            تقديم طلب إجازة جديد
          </button>
        </div>

        {/* Right: Advances & Loans */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <HandCoins className="w-4 h-4 text-purple-600" />
                <span>سلف وأقساط الرواتب</span>
              </h3>
              <button
                onClick={() => setIsAdvanceModalOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>طلب سلفة</span>
              </button>
            </div>

            {empAdvances.length > 0 ? (
              <div className="space-y-2 pt-2 text-xs">
                {empAdvances.map((adv) => (
                  <div key={adv.id} className="p-3 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="font-bold text-purple-950 font-mono">{adv.advanceNumber}</span>
                      <span className="font-bold text-emerald-800 text-[10px]">نشطة قيد السداد</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">المتبقي:</span>
                      <span className="font-mono font-black text-purple-950">{formatEGP(adv.remainingBalance)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-purple-100">
                      <span>الخصم الشهري: {formatEGP(adv.monthlyInstallment)}</span>
                      <span>الأقساط: {adv.installmentCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                لا توجد سلف نشطة مسجلة باسمك حالياً.
              </div>
            )}
          </div>

          <button
            onClick={() => setIsAdvanceModalOpen(true)}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition"
          >
            طلب سلفة مالية
          </button>
        </div>
      </div>

      {/* Latest Payslips List for this employee */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-rewaq-gold" />
              <span>مفردات المرتب وكشوف الرواتب الشخصية (My Payslips)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">يمكنك استعراض وطباعة قسيمة راتبك الشهري</p>
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5 pr-6">رقم القسيمة</th>
                <th className="p-3.5">فترة الراتب</th>
                <th className="p-3.5">الراتب الأساسي</th>
                <th className="p-3.5">البدلات والحوافز</th>
                <th className="p-3.5">الاستقطاعات والضرائب والتأمينات</th>
                <th className="p-3.5">صافي الراتب المستلم</th>
                <th className="p-3.5">حالة الصرف</th>
                <th className="p-3.5 text-center">عرض القسيمة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {empPayslips.map((slip) => (
                <tr key={slip.id} className="hover:bg-slate-50">
                  <td className="p-3.5 pr-6 font-mono font-bold text-slate-900">{slip.payslipNumber}</td>
                  <td className="p-3.5 font-bold text-slate-800">{slip.periodLabel}</td>
                  <td className="p-3.5 font-mono">{formatEGP(slip.basicSalary)}</td>
                  <td className="p-3.5 font-mono text-emerald-700">+{formatEGP(slip.grossSalary - slip.basicSalary)}</td>
                  <td className="p-3.5 font-mono text-rose-700">-{formatEGP(slip.totalDeductions)}</td>
                  <td className="p-3.5 font-mono font-black text-slate-950 text-sm">{formatEGP(slip.netSalary)}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800">
                      {slip.paymentStatus === "PAID" ? "تم الصرف" : "معلق"}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => setViewingPayslip(slip)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-rewaq-gold px-3 py-1.5 rounded-xl transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>عرض وطباعة</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <RequestLeaveModal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} />
      <CreateAdvanceModal isOpen={isAdvanceModalOpen} onClose={() => setIsAdvanceModalOpen(false)} />
      <PayslipModal isOpen={Boolean(viewingPayslip)} onClose={() => setViewingPayslip(undefined)} payslip={viewingPayslip} />
    </div>
  );
}
