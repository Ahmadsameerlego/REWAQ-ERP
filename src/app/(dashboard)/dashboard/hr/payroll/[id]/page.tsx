"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Banknote,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileCheck,
  Eye,
  ShieldCheck,
  Building,
  ArrowRight,
  ArrowLeft,
  Printer,
  Coins,
  Wallet,
} from "lucide-react";
import HrNav from "@/components/hr/HrNav";
import PayslipModal from "@/components/hr/PayslipModal";
import { useHR } from "@/context/HRContext";
import { useFinance } from "@/context/FinanceContext";
import { formatEGP } from "@/lib/hrEngine";
import { PayrollItem, Payslip } from "@/types/hr";

export default function PayrollRunDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.id as string;

  const { payrollRuns, recalculatePayrollRun, approvePayrollRun, payPayrollRun, payslips } = useHR();
  const { treasuries, bankAccounts } = useFinance();

  const [filterDept, setFilterDept] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTreasuryId, setSelectedTreasuryId] = useState(treasuries[0]?.id || "tr-cairo");
  const [viewingPayslip, setViewingPayslip] = useState<Payslip | undefined>(undefined);

  const run = payrollRuns.find((r) => r.id === runId);

  if (!run) {
    return (
      <div className="space-y-6">
        <HrNav />
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <p className="text-slate-500 font-bold mb-4">مسير الرواتب غير موجود</p>
          <Link
            href="/dashboard/hr/payroll"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة لقائمة المسيرات</span>
          </Link>
        </div>
      </div>
    );
  }

  const filteredItems = run.items.filter((item) => {
    if (filterDept !== "ALL" && item.departmentName !== filterDept) return false;
    if (searchQuery && !item.employeeName.includes(searchQuery) && !item.employeeCode.includes(searchQuery)) return false;
    return true;
  });

  const uniqueDepts = Array.from(new Set(run.items.map((i) => i.departmentName)));

  const handleApprove = () => {
    const res = approvePayrollRun(run.id, "أحمد سمير");
    if (res.success) {
      alert(`تم اعتماد مسير ${run.periodLabel} وتوليد قيد الاستحقاق اليومي بالمالية بنجاح.`);
    }
  };

  const handlePay = () => {
    const res = payPayrollRun(run.id, selectedTreasuryId, "BANK_TRANSFER", "أحمد سمير");
    if (res.success) {
      alert(`تم تسجيل صرف مسير ${run.periodLabel} وتحديث رصيد الخزينة/البنك.`);
    }
  };

  const handleOpenPayslip = (employeeId: string) => {
    const slip = payslips.find((p) => p.employeeId === employeeId && p.payrollRunId === run.id);
    if (slip) {
      setViewingPayslip(slip);
    }
  };

  return (
    <div className="space-y-6">
      <HrNav />

      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/hr/payroll"
              className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
              title="رجوع"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-slate-900">مسير رواتب: {run.periodLabel}</h1>
                <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-700">
                  {run.runNumber}
                </span>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-black ${
                    run.status === "PAID"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : run.status === "APPROVED"
                      ? "bg-blue-50 text-blue-800 border border-blue-200"
                      : "bg-amber-500 text-slate-950"
                  }`}
                >
                  {run.status === "PAID" ? "تم الصرف" : run.status === "APPROVED" ? "معتمد محاسبياً" : "محسوب وبانتظار الاعتماد"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                نطاق المسير: {run.branchName} • {run.employeeCount} موظف مسجل
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {run.status !== "PAID" && run.status !== "CLOSED" && (
              <button
                onClick={() => recalculatePayrollRun(run.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
              >
                <RefreshCw className="w-3.5 h-3.5 text-rewaq-gold" />
                <span>إعادة الاحتساب</span>
              </button>
            )}

            {run.status === "CALCULATED" && (
              <button
                onClick={handleApprove}
                className="inline-flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 text-rewaq-gold font-black text-xs px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-rewaq-gold" />
                <span>اعتماد المسير وتوليد قيد اليومية</span>
              </button>
            )}

            {run.status === "APPROVED" && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedTreasuryId}
                  onChange={(e) => setSelectedTreasuryId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                >
                  <optgroup label="الخزائن النقدية">
                    {treasuries.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nameAr} ({formatEGP(t.currentBalance)})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="الحسابات البنكية">
                    {bankAccounts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} - {b.accountNameAr}
                      </option>
                    ))}
                  </optgroup>
                </select>

                <button
                  onClick={handlePay}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                >
                  <Banknote className="w-4 h-4" />
                  <span>تسجيل الصرف الفعلي</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <span className="text-slate-400 block text-[11px]">الرواتب الأساسية</span>
            <span className="text-sm font-black font-mono text-slate-900">{formatEGP(run.totalBasic)}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <span className="text-slate-400 block text-[11px]">بدلات وحوافز وعمولات</span>
            <span className="text-sm font-black font-mono text-emerald-700">
              +{formatEGP(run.totalAllowances + run.totalOvertime + run.totalBonuses + run.totalCommissions)}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <span className="text-slate-400 block text-[11px]">ضرائب وتأمينات مصرية</span>
            <span className="text-sm font-black font-mono text-rose-700">
              -{formatEGP(run.totalIncomeTax + run.totalEmployeeInsurance)}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <span className="text-slate-400 block text-[11px]">سلف وغيابات مستردة</span>
            <span className="text-sm font-black font-mono text-amber-700">
              -{formatEGP(run.totalAdvanceDeductions + run.totalAbsenceDeductions + run.totalLateDeductions)}
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-white col-span-2 md:col-span-1">
            <span className="text-rewaq-gold block text-[11px] font-bold">صافي الرواتب المصروفة</span>
            <span className="text-base font-black font-mono text-rewaq-gold">{formatEGP(run.totalNetSalary)}</span>
          </div>
        </div>

        {/* Accounting Journal Link Box */}
        {run.accrualJournalEntryNumber && (
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>تم توليد قيد استحقاق اليومية رقم: <strong className="font-mono">{run.accrualJournalEntryNumber}</strong> في موديول المالية.</span>
            </div>
            <Link href="/dashboard/finance/journal" className="font-bold text-emerald-800 hover:underline">
              عرض دفتر اليومية ⬅️
            </Link>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="بحث باسم الموظف أو الكود..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 w-full md:w-60 focus:bg-white focus:outline-none focus:border-rewaq-gold"
            />
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
            >
              <option value="ALL">كل الأقسام ({run.items.length})</option>
              {uniqueDepts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-500">
            عرض <strong>{filteredItems.length}</strong> من إجمالي <strong>{run.employeeCount}</strong> موظف
          </span>
        </div>

        {/* Detailed Payroll Review Sheet Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 pr-4">الموظف والكود</th>
                  <th className="p-3">القسم والفرع</th>
                  <th className="p-3">الأساسي</th>
                  <th className="p-3">البدلات</th>
                  <th className="p-3">حوافز/عمولة</th>
                  <th className="p-3">الإجمالي (Gross)</th>
                  <th className="p-3">ضريبة كسب عمل</th>
                  <th className="p-3">تأمينات 11%</th>
                  <th className="p-3">سلف/غياب</th>
                  <th className="p-3">الصافي المستحق</th>
                  <th className="p-3">تنبيهات</th>
                  <th className="p-3 text-center">مفردات المرتب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 pr-4">
                      <div className="font-bold text-slate-900">{item.employeeName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{item.employeeCode} - {item.positionTitle}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-800">{item.departmentName}</div>
                      <div className="text-[10px] text-slate-400">{item.branchName}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-900">{formatEGP(item.basicSalary)}</td>
                    <td className="p-3 font-mono text-slate-700">{formatEGP(item.totalAllowances)}</td>
                    <td className="p-3 font-mono text-emerald-700">
                      {item.bonusAmount + item.commissionsAmount + item.overtimeAmount > 0 ? (
                        <span>+{formatEGP(item.bonusAmount + item.commissionsAmount + item.overtimeAmount)}</span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-900 bg-slate-50">{formatEGP(item.grossSalary)}</td>
                    <td className="p-3 font-mono text-rose-600">-{formatEGP(item.incomeTax)}</td>
                    <td className="p-3 font-mono text-rose-600">-{formatEGP(item.employeeSocialInsurance)}</td>
                    <td className="p-3 font-mono text-amber-700">
                      {item.advanceDeduction + item.absenceDeduction + item.lateDeduction > 0 ? (
                        <span>-{formatEGP(item.advanceDeduction + item.absenceDeduction + item.lateDeduction)}</span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3 font-mono font-black text-slate-950 bg-emerald-50/50 text-sm">
                      {formatEGP(item.netSalary)}
                    </td>
                    <td className="p-3">
                      {item.anomalies.length > 0 ? (
                        <div className="space-y-1">
                          {item.anomalies.map((anom, idx) => (
                            <span
                              key={idx}
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                anom.severity === "WARNING"
                                  ? "bg-amber-100 text-amber-900"
                                  : anom.severity === "CRITICAL"
                                  ? "bg-rose-100 text-rose-900"
                                  : "bg-blue-100 text-blue-900"
                              }`}
                            >
                              {anom.message}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">سليم ومطابق</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleOpenPayslip(item.employeeId)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 hover:text-rewaq-gold bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition"
                      >
                        <Eye className="w-3 h-3" />
                        <span>عرض القسيمة</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PayslipModal isOpen={Boolean(viewingPayslip)} onClose={() => setViewingPayslip(undefined)} payslip={viewingPayslip} />
    </div>
  );
}
