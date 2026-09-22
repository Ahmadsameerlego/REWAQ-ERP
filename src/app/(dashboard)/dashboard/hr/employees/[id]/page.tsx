"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Building,
  Briefcase,
  Clock,
  Plane,
  Banknote,
  HandCoins,
  FileText,
  History,
  TrendingUp,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Printer,
  Plus,
  ArrowRight,
  Eye,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import HrNav from "@/components/hr/HrNav";
import SalaryChangeModal from "@/components/hr/SalaryChangeModal";
import RequestLeaveModal from "@/components/hr/RequestLeaveModal";
import CreateAdvanceModal from "@/components/hr/CreateAdvanceModal";
import PayslipModal from "@/components/hr/PayslipModal";
import { useHR } from "@/context/HRContext";
import { formatEGP } from "@/lib/hrEngine";
import { Payslip } from "@/types/hr";

export default function EmployeeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;

  const {
    employees,
    contracts,
    attendanceRecords,
    leaveBalances,
    leaveRequests,
    advances,
    salaryHistories,
    payslips,
    auditLogs,
  } = useHR();

  const [activeTab, setActiveTab] = useState<
    "OVERVIEW" | "PERSONAL" | "EMPLOYMENT" | "ATTENDANCE" | "LEAVES" | "PAYROLL" | "ADVANCES" | "DOCUMENTS" | "ACTIVITY"
  >("OVERVIEW");

  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [viewingPayslip, setViewingPayslip] = useState<Payslip | undefined>(undefined);

  const employee = employees.find((e) => e.id === employeeId);

  if (!employee) {
    return (
      <div className="space-y-6">
        <HrNav />
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <p className="text-slate-500 font-bold mb-4">لم يتم العثور على الموظف المطلوب</p>
          <Link
            href="/dashboard/hr/employees"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة لدليل الموظفين</span>
          </Link>
        </div>
      </div>
    );
  }

  const contract = contracts.find((c) => c.employeeId === employee.id);
  const empAttendance = attendanceRecords.filter((a) => a.employeeId === employee.id);
  const empBalances = leaveBalances.filter((b) => b.employeeId === employee.id);
  const empLeaves = leaveRequests.filter((l) => l.employeeId === employee.id);
  const empAdvances = advances.filter((a) => a.employeeId === employee.id);
  const empSalaryHistory = salaryHistories.filter((s) => s.employeeId === employee.id);
  const empPayslips = payslips.filter((p) => p.employeeId === employee.id);
  const empLogs = auditLogs.filter((l) => l.entityId === employee.id || l.employeeName === employee.fullName);

  const totalAllowances = employee.housingAllowance + employee.transportationAllowance + employee.otherAllowances;

  return (
    <div className="space-y-6">
      <HrNav />

      {/* Profile Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-900 text-rewaq-gold text-xl font-bold flex items-center justify-center border border-slate-800 shadow-sm shrink-0">
              {employee.avatarUrl ? (
                <img src={employee.avatarUrl} alt={employee.fullName} className="w-full h-full object-cover rounded-3xl" />
              ) : (
                <span>{employee.fullName.slice(0, 2)}</span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-black text-slate-900">{employee.fullName}</h1>
                <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200 font-bold">
                  {employee.employeeCode}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                    employee.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}
                >
                  {employee.status === "ACTIVE" ? "نشط وعلى رأس العمل" : "تحت الاختبار"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span>{employee.positionTitle}</span>
                <span>•</span>
                <span>{employee.departmentName}</span>
                <span>•</span>
                <span>{employee.branchName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsSalaryModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>تعديل الراتب</span>
            </button>

            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
            >
              <Plane className="w-3.5 h-3.5 text-blue-600" />
              <span>طلب إجازة</span>
            </button>

            <button
              onClick={() => setIsAdvanceModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
            >
              <HandCoins className="w-3.5 h-3.5 text-purple-600" />
              <span>طلب سلفة</span>
            </button>
          </div>
        </div>

        {/* 9 Profile Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 text-xs font-bold scrollbar-thin">
          {[
            { id: "OVERVIEW", label: "نظرة عامة (Overview)", icon: User },
            { id: "PERSONAL", label: "البيانات الشخصية", icon: MapPin },
            { id: "EMPLOYMENT", label: "بيانات العمل والوظيفة", icon: Briefcase },
            { id: "ATTENDANCE", label: `سجل الحضور (${empAttendance.length})`, icon: Clock },
            { id: "LEAVES", label: `الإجازات والأرصدة (${empBalances.length})`, icon: Plane },
            { id: "PAYROLL", label: `الرواتب ومفردات المرتب (${empPayslips.length})`, icon: Banknote },
            { id: "ADVANCES", label: `السلف والأقساط (${empAdvances.length})`, icon: HandCoins },
            { id: "DOCUMENTS", label: `المستندات والعقود (${employee.documents.length})`, icon: FileText },
            { id: "ACTIVITY", label: `سجل النشاط (${empLogs.length})`, icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white font-black shadow-xs"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-rewaq-gold" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "OVERVIEW" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <span className="text-slate-400 block text-[11px]">الراتب الأساسي</span>
                <span className="text-lg font-black font-mono text-slate-900">{formatEGP(employee.basicSalary)}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">البدلات: +{formatEGP(totalAllowances)}</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <span className="text-slate-400 block text-[11px]">رصيد الإجازة السنوية</span>
                <span className="text-lg font-black font-mono text-emerald-700">
                  {empBalances.find((b) => b.leaveTypeId === "lt-annual")?.remainingDays || 21} يوم متبقي
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">مستهلك: {empBalances.find((b) => b.leaveTypeId === "lt-annual")?.usedDays || 0} يوم</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <span className="text-slate-400 block text-[11px]">السلف القائمة</span>
                <span className="text-lg font-black font-mono text-purple-900">
                  {formatEGP(empAdvances.filter((a) => a.status === "ACTIVE").reduce((acc, a) => acc + a.remainingBalance, 0))}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{empAdvances.filter((a) => a.status === "ACTIVE").length} سلفة نشطة</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <span className="text-slate-400 block text-[11px]">تاريخ التعيين</span>
                <span className="text-base font-bold font-mono text-slate-900">{employee.hireDate}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">نوع العقد: دوام سنوي كامل</span>
              </div>
            </div>

            {/* Quick Summary Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Financial & Compliance Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-rewaq-gold" />
                  <span>البيانات المالية والصرف</span>
                </h4>
                <div className="space-y-2 text-xs divide-y divide-slate-100">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">طريقة الدفع:</span>
                    <span className="font-bold text-slate-900">
                      {employee.paymentMethod === "BANK_TRANSFER"
                        ? `تحويل بنكي (${employee.bankName || "البنك"})`
                        : employee.paymentMethod === "INSTAPAY"
                        ? `إنستاباي (${employee.instapayHandle})`
                        : "نقداً من خزينة الفرع"}
                    </span>
                  </div>
                  {employee.bankAccountNumber && (
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">رقم الحساب / IBAN:</span>
                      <span className="font-mono text-slate-900">{employee.bankAccountNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">التأمينات الاجتماعية:</span>
                    <span className="font-bold text-emerald-800">
                      {employee.hasSocialInsurance ? `مؤمن عليه (رقم: ${employee.socialInsuranceNumber || "14890214"})` : "غير مشترك"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">ضريبة كسب العمل:</span>
                    <span className="font-bold text-slate-900">
                      {employee.isSubjectToIncomeTax ? "خاضع لشرائح الدخل 2026" : "معفى"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Work Schedule & Contract Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span>جدول الدوام وتفاصيل التعاقد</span>
                </h4>
                <div className="space-y-2 text-xs divide-y divide-slate-100">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">جدول الدوام المعتمد:</span>
                    <span className="font-bold text-slate-900">{employee.scheduleName}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">مركز التكلفة المحاسبي:</span>
                    <span className="font-bold text-slate-900">{employee.costCenterName}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">تاريخ انتهاء العقد الحالي:</span>
                    <span className="font-mono font-bold text-slate-900">{contract?.endDate || "2027-12-31"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">المدير المباشر:</span>
                    <span className="font-bold text-slate-900">{employee.directManagerName || "الإدارة العامة"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PERSONAL DATA */}
        {activeTab === "PERSONAL" && (
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 text-xs animate-in fade-in duration-150">
            <h4 className="font-bold text-sm text-slate-900 mb-2">البيانات الشخصية ورقم الهوية</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-slate-400 block text-[11px]">الرقم القومي (14 رقم):</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{employee.nationalId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">تاريخ الميلاد:</span>
                <span className="font-bold text-slate-900">{employee.birthDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">النوع والحالة الاجتماعية:</span>
                <span className="font-bold text-slate-900">
                  {employee.gender === "MALE" ? "ذكر" : "أنثى"} • {employee.maritalStatus === "MARRIED" ? "متزوج" : "أعزب"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">رقم الهاتف:</span>
                <span className="font-mono font-bold text-slate-900">{employee.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">البريد الإلكتروني:</span>
                <span className="font-bold text-slate-900">{employee.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">المدينة والمحافظة:</span>
                <span className="font-bold text-slate-900">{employee.city}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-slate-400 block text-[11px]">العنوان السكني التفصيلي:</span>
                <span className="font-bold text-slate-900">{employee.address}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">جهة الاتصال في الطوارئ:</span>
                <span className="font-bold text-slate-900">
                  {employee.emergencyContactName || "الأسرة"} ({employee.emergencyContactPhone || employee.phone})
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EMPLOYMENT DATA */}
        {activeTab === "EMPLOYMENT" && (
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 text-xs animate-in fade-in duration-150">
            <h4 className="font-bold text-sm text-slate-900 mb-2">بيانات الوظيفة والتعاقد بالهيكل الإداري</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-slate-400 block text-[11px]">الفرع التابع له:</span>
                <span className="font-bold text-slate-900">{employee.branchName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">الإدارة / القسم:</span>
                <span className="font-bold text-slate-900">{employee.departmentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">المسمى الوظيفي:</span>
                <span className="font-bold text-slate-900">{employee.positionTitle}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">تاريخ مباشرة العمل:</span>
                <span className="font-bold text-slate-900">{employee.workStartDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">نوع التوظيف:</span>
                <span className="font-bold text-slate-900">
                  {employee.employmentType === "FULL_TIME"
                    ? "دوام كامل (عقد سنوي)"
                    : employee.employmentType === "PROBATION"
                    ? "فترة اختبار"
                    : "دوام جزئي"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">مركز التكلفة المحاسبي:</span>
                <span className="font-bold text-slate-900">{employee.costCenterName}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ATTENDANCE */}
        {activeTab === "ATTENDANCE" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-900">سجل حضور وانصراف الموظف</h4>
              <span className="text-xs text-slate-500 font-mono">{empAttendance.length} تسجيلات</span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">التاريخ</th>
                    <th className="p-3">وقت الدخول</th>
                    <th className="p-3">وقت الخروج</th>
                    <th className="p-3">ساعات العمل</th>
                    <th className="p-3">تأخير (دقيقة)</th>
                    <th className="p-3">إضافي (ساعات)</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3">المصدر / الملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {empAttendance.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">{att.date}</td>
                      <td className="p-3 font-mono">{att.checkIn || "-"}</td>
                      <td className="p-3 font-mono">{att.checkOut || "-"}</td>
                      <td className="p-3 font-mono">{att.workHours} س</td>
                      <td className="p-3 font-mono text-amber-700">{att.lateMinutes > 0 ? `${att.lateMinutes} د` : "-"}</td>
                      <td className="p-3 font-mono text-blue-700">{att.overtimeHours > 0 ? `${att.overtimeHours} س` : "-"}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            att.status === "PRESENT"
                              ? "bg-emerald-50 text-emerald-800"
                              : att.status === "LATE"
                              ? "bg-amber-50 text-amber-800"
                              : "bg-rose-50 text-rose-800"
                          }`}
                        >
                          {att.status === "PRESENT" ? "حاضر" : att.status === "LATE" ? "متأخر" : "غائب"}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 text-[11px]">{att.notes || "بصمة حيوية"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: LEAVES */}
        {activeTab === "LEAVES" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h4 className="font-bold text-xs text-slate-900">أرصدة الإجازات السنوية والعارضة</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {empBalances.map((b) => (
                <div key={b.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-xs text-slate-900 block">{b.leaveTypeName}</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black font-mono text-emerald-700">{b.remainingDays}</span>
                    <span className="text-xs text-slate-400">يوم متبقي</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between pt-2 border-t border-slate-200">
                    <span>الرصيد الكلي: {b.entitledDays} يوم</span>
                    <span>مستهلك: {b.usedDays} يوم</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <h4 className="font-bold text-xs text-slate-900 mb-2">سجل طلبات الإجازات المقدمة</h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">رقم الطلب</th>
                      <th className="p-3">النوع</th>
                      <th className="p-3">من تاريخ</th>
                      <th className="p-3">إلى تاريخ</th>
                      <th className="p-3">الأيام</th>
                      <th className="p-3">السبب</th>
                      <th className="p-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {empLeaves.map((req) => (
                      <tr key={req.id}>
                        <td className="p-3 font-mono font-bold text-slate-900">{req.requestNumber}</td>
                        <td className="p-3">{req.leaveTypeName}</td>
                        <td className="p-3 font-mono">{req.startDate}</td>
                        <td className="p-3 font-mono">{req.endDate}</td>
                        <td className="p-3 font-mono font-bold">{req.daysCount}</td>
                        <td className="p-3 text-slate-600">{req.reason}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800">
                            {req.status === "APPROVED" ? "معتمد" : "معلق"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PAYROLL & PAYSLIPS */}
        {activeTab === "PAYROLL" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h4 className="font-bold text-xs text-slate-900">سجل مفردات المرتب وكشوف الرواتب الشهرية</h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">رقم القسيمة</th>
                    <th className="p-3">فترة الراتب</th>
                    <th className="p-3">الأساسي</th>
                    <th className="p-3">البدلات والحوافز</th>
                    <th className="p-3">الاستقطاعات والضرائب</th>
                    <th className="p-3">صافي الراتب المنصرف</th>
                    <th className="p-3">حالة الصرف</th>
                    <th className="p-3 text-center">عرض وطباعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {empPayslips.map((slip) => (
                    <tr key={slip.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">{slip.payslipNumber}</td>
                      <td className="p-3 font-bold text-slate-800">{slip.periodLabel}</td>
                      <td className="p-3 font-mono">{formatEGP(slip.basicSalary)}</td>
                      <td className="p-3 font-mono text-emerald-700">+{formatEGP(slip.grossSalary - slip.basicSalary)}</td>
                      <td className="p-3 font-mono text-rose-700">-{formatEGP(slip.totalDeductions)}</td>
                      <td className="p-3 font-mono font-black text-slate-950 text-sm">{formatEGP(slip.netSalary)}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800">
                          {slip.paymentStatus === "PAID" ? "تم الصرف" : "معلق"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setViewingPayslip(slip)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg text-slate-800 transition"
                        >
                          <Eye className="w-3 h-3" />
                          <span>قسيمة الراتب</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Salary History Sub-section */}
            <div className="pt-4 space-y-2">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-700" />
                <span>سجل تغيير وتعديل الراتب (Salary Change History)</span>
              </h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">الراتب القديم</th>
                      <th className="p-3">الراتب الجديد</th>
                      <th className="p-3">تاريخ النفاذ</th>
                      <th className="p-3">السبب والملاحظات</th>
                      <th className="p-3">المعتمد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {empSalaryHistory.map((hist) => (
                      <tr key={hist.id}>
                        <td className="p-3 font-mono text-slate-500">{formatEGP(hist.oldSalary)}</td>
                        <td className="p-3 font-mono font-bold text-emerald-700">{formatEGP(hist.newSalary)}</td>
                        <td className="p-3 font-mono">{hist.effectiveDate}</td>
                        <td className="p-3 text-slate-800">{hist.reason}</td>
                        <td className="p-3 text-slate-600">{hist.changedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: ADVANCES */}
        {activeTab === "ADVANCES" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-900">السلف والقروض الممنوحة للموظف</h4>
              <button
                onClick={() => setIsAdvanceModalOpen(true)}
                className="inline-flex items-center gap-1 bg-purple-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl"
              >
                <Plus className="w-3 h-3" />
                <span>طلب سلفة جديدة</span>
              </button>
            </div>

            <div className="space-y-4">
              {empAdvances.map((adv) => (
                <div key={adv.id} className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold font-mono text-sm text-purple-950 block">{adv.advanceNumber}</span>
                      <span className="text-xs text-purple-700">تاريخ الطلب: {adv.requestDate} • السبب: {adv.reason}</span>
                    </div>
                    <div className="text-left">
                      <span className="text-xs text-purple-600 block">المتبقي للسداد</span>
                      <span className="text-xl font-black font-mono text-purple-950">{formatEGP(adv.remainingBalance)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-white p-3 rounded-xl border border-purple-100">
                    <div>
                      <span className="text-slate-400 block text-[11px]">المبلغ الكلي:</span>
                      <span className="font-bold font-mono text-slate-900">{formatEGP(adv.totalAmount)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">عدد الأقساط:</span>
                      <span className="font-bold font-mono text-slate-900">{adv.installmentCount} أقساط</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">القسط الشهري:</span>
                      <span className="font-bold font-mono text-purple-800">{formatEGP(adv.monthlyInstallment)} / شهر</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">حالة السلفة:</span>
                      <span className="font-bold text-emerald-700">{adv.status === "ACTIVE" ? "نشطة قيد السداد" : "مسددة"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: DOCUMENTS */}
        {activeTab === "DOCUMENTS" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h4 className="font-bold text-xs text-slate-900">الملفات ومسوغات التعيين المرفوعة</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-rewaq-gold" />
                  <div>
                    <span className="font-bold text-slate-900 block">عقد العمل الموثق 2026.pdf</span>
                    <span className="text-slate-400 text-[11px]">تاريخ الرفع: 2023-01-15</span>
                  </div>
                </div>
                <button className="text-xs font-bold text-slate-700 hover:text-slate-950 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
                  تحميل
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="font-bold text-slate-900 block">صورة بطاقة الرقم القومي سارية.pdf</span>
                    <span className="text-slate-400 text-[11px]">تاريخ الرفع: 2023-01-15</span>
                  </div>
                </div>
                <button className="text-xs font-bold text-slate-700 hover:text-slate-950 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
                  تحميل
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: ACTIVITY & AUDIT */}
        {activeTab === "ACTIVITY" && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <h4 className="font-bold text-xs text-slate-900">سجل حركات وتدقيق ملف الموظف</h4>
            <div className="space-y-2 divide-y divide-slate-100 text-xs">
              {empLogs.map((log) => (
                <div key={log.id} className="pt-2">
                  <p className="text-slate-900 font-medium">{log.details}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>بواسطة: {log.user}</span>
                    <span className="font-mono">{log.timestamp.slice(0, 10)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <SalaryChangeModal isOpen={isSalaryModalOpen} onClose={() => setIsSalaryModalOpen(false)} employee={employee} />
      <RequestLeaveModal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} />
      <CreateAdvanceModal isOpen={isAdvanceModalOpen} onClose={() => setIsAdvanceModalOpen(false)} />
      <PayslipModal isOpen={Boolean(viewingPayslip)} onClose={() => setViewingPayslip(undefined)} payslip={viewingPayslip} />
    </div>
  );
}
