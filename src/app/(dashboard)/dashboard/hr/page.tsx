"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users2,
  Clock,
  Plane,
  Banknote,
  FileCheck,
  HandCoins,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Plus,
  ArrowUpRight,
  Sparkles,
  Building,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronLeft,
  ArrowLeft,
} from "lucide-react";
import HrNav from "@/components/hr/HrNav";
import SmartHrInsightsWidget from "@/components/hr/SmartHrInsightsWidget";
import CreateEmployeeModal from "@/components/hr/CreateEmployeeModal";
import ManualAttendanceModal from "@/components/hr/ManualAttendanceModal";
import RequestLeaveModal from "@/components/hr/RequestLeaveModal";
import CreateAdvanceModal from "@/components/hr/CreateAdvanceModal";
import CreatePayrollRunModal from "@/components/hr/CreatePayrollRunModal";
import PayrollReviewModal from "@/components/hr/PayrollReviewModal";
import { useHR } from "@/context/HRContext";
import { formatEGP } from "@/lib/hrEngine";

export default function HrDashboardPage() {
  const {
    employees,
    contracts,
    attendanceRecords,
    leaveRequests,
    advances,
    payrollRuns,
    hrMetrics,
    auditLogs,
  } = useHR();

  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [selectedPayrollRunId, setSelectedPayrollRunId] = useState<string | null>(null);

  const latestRun = payrollRuns[0];
  const selectedRun = payrollRuns.find((r) => r.id === selectedPayrollRunId) || latestRun;

  return (
    <div className="space-y-6">
      {/* Top Nav Header */}
      <HrNav
        onOpenEmployeeModal={() => setIsEmployeeModalOpen(true)}
        onOpenAttendanceModal={() => setIsAttendanceModalOpen(true)}
        onOpenLeaveModal={() => setIsLeaveModalOpen(true)}
        onOpenAdvanceModal={() => setIsAdvanceModalOpen(true)}
        onOpenPayrollModal={() => setIsPayrollModalOpen(true)}
      />

      {/* Smart HR Insights Banner */}
      <SmartHrInsightsWidget />

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">إجمالي الموظفين</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Users2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-slate-900">{hrMetrics.totalEmployees}</div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 mt-1">
              <span className="font-bold">{hrMetrics.activeEmployees} نشط</span>
              <span className="text-slate-300">•</span>
              <span className="text-amber-700 font-bold">{hrMetrics.onLeaveEmployees} إجازة</span>
            </div>
          </div>
        </div>

        {/* Live Today Attendance */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">الحضور اليوم (Live)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-emerald-700">{hrMetrics.todayPresentCount} حاضر</div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
              <span className="text-amber-700 font-bold font-mono">{hrMetrics.todayLateCount} تأخير</span>
              <span className="text-slate-300">•</span>
              <span className="text-rose-600 font-bold font-mono">{hrMetrics.todayAbsentCount} غياب</span>
            </div>
          </div>
        </div>

        {/* Monthly Payroll Total Net */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">صافي رواتب {latestRun?.periodLabel || "الشهر"}</span>
            <div className="w-8 h-8 rounded-xl bg-rewaq-gold/20 flex items-center justify-center text-rewaq-gold-dark">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black font-mono text-slate-950">
              {formatEGP(hrMetrics.latestPayrollTotalNet)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>تكلفة المنشأة الإجمالية:</span>
              <span className="font-mono font-bold text-slate-800">{formatEGP(hrMetrics.latestPayrollEmployerCost)}</span>
            </div>
          </div>
        </div>

        {/* Active Advances & Loans */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">السلف القائمة للتحصيل</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
              <HandCoins className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-purple-900">
              {formatEGP(hrMetrics.totalActiveAdvancesBalance)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span>{advances.filter((a) => a.status === "ACTIVE").length} سلف نشطة قيد الخصم</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Payroll Center & Quick Actions & Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Payroll Overview & Quick Action */}
        <div className="lg:col-span-2 space-y-6">
          {/* Monthly Payroll Spotlight Card */}
          {latestRun && (
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-6 text-white border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rewaq-gold uppercase tracking-wider">دورة الرواتب الشهرية</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-0.5">{latestRun.periodLabel}</h3>
                  <p className="text-xs text-slate-400">
                    {latestRun.branchName} • {latestRun.employeeCount} موظف مؤهل
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedPayrollRunId(latestRun.id)}
                    className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                  >
                    <span>فتح شاشة المراجعة والاعتماد</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">الرواتب الأساسية</span>
                  <span className="text-sm font-bold font-mono text-white">{formatEGP(latestRun.totalBasic)}</span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">بدلات وحوافز وعمولات</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">
                    +{formatEGP(latestRun.totalAllowances + latestRun.totalOvertime + latestRun.totalBonuses + latestRun.totalCommissions)}
                  </span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">ضرائب وتأمينات مصرية</span>
                  <span className="text-sm font-bold font-mono text-rose-400">
                    -{formatEGP(latestRun.totalIncomeTax + latestRun.totalEmployeeInsurance)}
                  </span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">أقساط سلف مستردة</span>
                  <span className="text-sm font-bold font-mono text-amber-400">
                    -{formatEGP(latestRun.totalAdvanceDeductions)}
                  </span>
                </div>
              </div>

              {/* Status workflow indicator */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white">حالة المسير:</span>
                  <span
                    className={`px-2 py-0.5 rounded font-black ${
                      latestRun.status === "PAID"
                        ? "bg-emerald-500 text-slate-950"
                        : latestRun.status === "APPROVED"
                        ? "bg-blue-500 text-white"
                        : "bg-amber-500 text-slate-950"
                    }`}
                  >
                    {latestRun.status === "PAID" ? "تم الصرف" : latestRun.status === "APPROVED" ? "معتمد محاسبياً" : "محسوب وبانتظار الاعتماد"}
                  </span>
                </div>

                {latestRun.accrualJournalEntryNumber && (
                  <span className="font-mono text-slate-300">
                    قيد استحقاق: <strong>{latestRun.accrualJournalEntryNumber}</strong>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Today Attendance & Quick Live Punch */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>حالة حضور الموظفين اليوم ({new Date().toISOString().split("T")[0]})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">تسجيلات البصمة الحية وحالات التأخير والغياب</p>
              </div>

              <Link
                href="/dashboard/hr/attendance"
                className="text-xs font-bold text-slate-700 hover:text-rewaq-gold flex items-center gap-1 transition"
              >
                <span>دفتر الحضور بالكامل</span>
                <ArrowLeft className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {attendanceRecords.slice(0, 5).map((att) => (
                <div key={att.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                      {att.employeeName.slice(0, 2)}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">{att.employeeName}</span>
                      <span className="text-slate-400 text-[11px]">{att.departmentName} • {att.branchName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <span className="font-mono font-bold text-slate-800 block">{att.checkIn ? `دخول: ${att.checkIn}` : "لم يسجل"}</span>
                      {att.lateMinutes > 0 && (
                        <span className="text-[10px] text-amber-700 font-bold font-mono block">تأخير: {att.lateMinutes} دقيقة</span>
                      )}
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Quick Actions, Expiring Contracts & Recent Audit */}
        <div className="space-y-6">
          {/* Quick Action Shortcuts Panel */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
            <h4 className="font-bold text-xs text-slate-900 mb-2">إجراءات الموارد البشرية السريعة</h4>

            <button
              onClick={() => setIsEmployeeModalOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition text-right"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rewaq-gold/20 text-rewaq-gold-dark flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-slate-900 font-bold">تعيين موظف جديد</span>
                  <span className="block text-[11px] text-slate-400 font-normal">إنشاء ملف وعقد وراتب</span>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => setIsAttendanceModalOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition text-right"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-slate-900 font-bold">تسجيل حضور / مأمورية</span>
                  <span className="block text-[11px] text-slate-400 font-normal">تعديل يدوي مع سبب التدقيق</span>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition text-right"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Plane className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-slate-900 font-bold">تقديم / اعتماد إجازة</span>
                  <span className="block text-[11px] text-slate-400 font-normal">خصم من الرصيد والدوام</span>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => setIsAdvanceModalOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition text-right"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <HandCoins className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-slate-900 font-bold">جدولة سلفة موظف</span>
                  <span className="block text-[11px] text-slate-400 font-normal">تقسيط آلي بالرواتب</span>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Expiring Contracts Alert Box */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-rose-600" />
                <span>عقود تنتهي خلال 30 يوماً</span>
              </h4>
              <Link href="/dashboard/hr/contracts" className="text-[11px] font-bold text-slate-500 hover:text-slate-800">
                عرض الكل
              </Link>
            </div>

            <div className="space-y-2">
              {contracts
                .filter((c) => c.status === "EXPIRING_SOON")
                .map((contract) => (
                  <div key={contract.id} className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{contract.employeeName}</span>
                      <span className="text-[11px] text-slate-500 font-mono">ينتهي في: {contract.endDate}</span>
                    </div>
                    <Link
                      href="/dashboard/hr/contracts"
                      className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-rose-600 text-white hover:bg-rose-700 transition"
                    >
                      تجديد العقد
                    </Link>
                  </div>
                ))}
            </div>
          </div>

          {/* Recent Audit Activity */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
            <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-700" />
              <span>سجل العمليات والرقابة (Audit Trail)</span>
            </h4>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              {auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="pt-2 first:pt-0">
                  <p className="text-slate-800 font-medium leading-relaxed">{log.details}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>المستخدم: {log.user}</span>
                    <span className="font-mono">{log.timestamp.slice(0, 10)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateEmployeeModal isOpen={isEmployeeModalOpen} onClose={() => setIsEmployeeModalOpen(false)} />
      <ManualAttendanceModal isOpen={isAttendanceModalOpen} onClose={() => setIsAttendanceModalOpen(false)} />
      <RequestLeaveModal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} />
      <CreateAdvanceModal isOpen={isAdvanceModalOpen} onClose={() => setIsAdvanceModalOpen(false)} />
      <CreatePayrollRunModal isOpen={isPayrollModalOpen} onClose={() => setIsPayrollModalOpen(false)} />
      <PayrollReviewModal
        isOpen={Boolean(selectedPayrollRunId)}
        onClose={() => setSelectedPayrollRunId(null)}
        payrollRun={selectedRun}
      />
    </div>
  );
}
