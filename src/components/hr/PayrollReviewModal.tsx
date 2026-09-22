"use client";

import React, { useState } from "react";
import {
  X,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileCheck,
  Eye,
  ShieldCheck,
  Building,
  User,
} from "lucide-react";
import { useHR } from "@/context/HRContext";
import { PayrollRun, PayrollItem } from "@/types/hr";
import { formatEGP } from "@/lib/hrEngine";

interface PayrollReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  payrollRun?: PayrollRun;
  onOpenPayslip?: (employeeId: string) => void;
}

export default function PayrollReviewModal({
  isOpen,
  onClose,
  payrollRun,
  onOpenPayslip,
}: PayrollReviewModalProps) {
  const { recalculatePayrollRun, approvePayrollRun, payPayrollRun } = useHR();
  const [filterDept, setFilterDept] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTreasuryId, setSelectedTreasuryId] = useState("tr-cairo");

  if (!isOpen || !payrollRun) return null;

  const filteredItems = payrollRun.items.filter((item) => {
    if (filterDept !== "ALL" && item.departmentName !== filterDept) return false;
    if (searchQuery && !item.employeeName.includes(searchQuery) && !item.employeeCode.includes(searchQuery)) return false;
    return true;
  });

  const uniqueDepts = Array.from(new Set(payrollRun.items.map((i) => i.departmentName)));

  const handleApprove = () => {
    const result = approvePayrollRun(payrollRun.id, "أحمد سمير");
    if (result.success) {
      alert(`تم اعتماد مسير الرواتب بنجاح وتوليد قيد الاستحقاق اليومي التلقائي في موديول المالية.`);
      onClose();
    }
  };

  const handlePay = () => {
    const result = payPayrollRun(payrollRun.id, selectedTreasuryId, "BANK_TRANSFER", "أحمد سمير");
    if (result.success) {
      alert(`تم تسجيل صرف مسير الرواتب وتحديث رصيد الخزينة/البنك وتوليد قيد الصرف المحاسبي.`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-6xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200" dir="rtl">
        {/* Header */}
        <div className="p-5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rewaq-gold/20 border border-rewaq-gold/40 flex items-center justify-center text-rewaq-gold">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">مراجعة واعتماد مسير الرواتب: {payrollRun.periodLabel}</h3>
                <span className="text-[11px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                  {payrollRun.runNumber}
                </span>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-black ${
                    payrollRun.status === "PAID"
                      ? "bg-emerald-500 text-slate-950"
                      : payrollRun.status === "APPROVED"
                      ? "bg-blue-500 text-white"
                      : "bg-amber-500 text-slate-950"
                  }`}
                >
                  {payrollRun.status === "PAID" ? "تم الصرف" : payrollRun.status === "APPROVED" ? "معتمد محاسبياً" : "محسوب وبانتظار الاعتماد"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                فحص تفصيلي للمستحقات والبدلات والاستقطاعات والتأمينات والضرائب لكل موظف
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {payrollRun.status !== "PAID" && payrollRun.status !== "CLOSED" && (
              <button
                onClick={() => recalculatePayrollRun(payrollRun.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                title="إعادة احتساب الأرقام بناءً على آخر تحديثات الحضور"
              >
                <RefreshCw className="w-3.5 h-3.5 text-rewaq-gold" />
                <span>إعادة الاحتساب</span>
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Financial Summary Top Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 md:grid-cols-5 gap-3 shrink-0 text-xs">
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80">
            <span className="text-slate-400 block text-[11px]">إجمالي الراتب الأساسي</span>
            <span className="text-sm font-black font-mono text-slate-900">{formatEGP(payrollRun.totalBasic)}</span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200/80">
            <span className="text-slate-400 block text-[11px]">بدلات وحوافز وعمولات</span>
            <span className="text-sm font-black font-mono text-emerald-700">
              +{formatEGP(payrollRun.totalAllowances + payrollRun.totalOvertime + payrollRun.totalBonuses + payrollRun.totalCommissions)}
            </span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200/80">
            <span className="text-slate-400 block text-[11px]">ضريبة كسب العمل والتأمينات</span>
            <span className="text-sm font-black font-mono text-rose-700">
              -{formatEGP(payrollRun.totalIncomeTax + payrollRun.totalEmployeeInsurance)}
            </span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200/80">
            <span className="text-slate-400 block text-[11px]">سلف وغيابات وجزاءات</span>
            <span className="text-sm font-black font-mono text-rose-700">
              -{formatEGP(payrollRun.totalAdvanceDeductions + payrollRun.totalAbsenceDeductions + payrollRun.totalLateDeductions)}
            </span>
          </div>

          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-white col-span-2 md:col-span-1">
            <span className="text-rewaq-gold block text-[11px] font-bold">صافي المسير الواجب الصرف</span>
            <span className="text-base font-black font-mono text-rewaq-gold">{formatEGP(payrollRun.totalNetSalary)}</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-3 bg-white border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="ابحث باسم الموظف أو الكود..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 w-full md:w-60 focus:bg-white focus:outline-none focus:border-rewaq-gold"
            />
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
            >
              <option value="ALL">كل الأقسام ({payrollRun.items.length})</option>
              {uniqueDepts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-500">
            عرض <strong>{filteredItems.length}</strong> من إجمالي <strong>{payrollRun.employeeCount}</strong> موظف
          </span>
        </div>

        {/* Table Content Area */}
        <div className="overflow-auto flex-1 p-4">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 sticky top-0 z-10">
                <th className="p-2.5 pr-4">الموظف والكود</th>
                <th className="p-2.5">القسم والفرع</th>
                <th className="p-2.5">الأساسي</th>
                <th className="p-2.5">البدلات</th>
                <th className="p-2.5">حوافز/عمولة</th>
                <th className="p-2.5">الإجمالي (Gross)</th>
                <th className="p-2.5">الضرائب (كسب عمل)</th>
                <th className="p-2.5">تأمينات 11%</th>
                <th className="p-2.5">سلف/غياب</th>
                <th className="p-2.5">الصافي (Net)</th>
                <th className="p-2.5">تنبيهات / ملاحظات</th>
                <th className="p-2.5 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-2.5 pr-4">
                    <div className="font-bold text-slate-900">{item.employeeName}</div>
                    <div className="text-[10px] font-mono text-slate-400">{item.employeeCode} - {item.positionTitle}</div>
                  </td>
                  <td className="p-2.5">
                    <div className="text-slate-800">{item.departmentName}</div>
                    <div className="text-[10px] text-slate-400">{item.branchName}</div>
                  </td>
                  <td className="p-2.5 font-mono font-bold text-slate-900">{formatEGP(item.basicSalary)}</td>
                  <td className="p-2.5 font-mono text-slate-700">{formatEGP(item.totalAllowances)}</td>
                  <td className="p-2.5 font-mono text-emerald-700">
                    {item.bonusAmount + item.commissionsAmount + item.overtimeAmount > 0 ? (
                      <span>+{formatEGP(item.bonusAmount + item.commissionsAmount + item.overtimeAmount)}</span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-2.5 font-mono font-bold text-slate-900 bg-slate-50">{formatEGP(item.grossSalary)}</td>
                  <td className="p-2.5 font-mono text-rose-600">-{formatEGP(item.incomeTax)}</td>
                  <td className="p-2.5 font-mono text-rose-600">-{formatEGP(item.employeeSocialInsurance)}</td>
                  <td className="p-2.5 font-mono text-amber-700">
                    {item.advanceDeduction + item.absenceDeduction + item.lateDeduction > 0 ? (
                      <span>-{formatEGP(item.advanceDeduction + item.absenceDeduction + item.lateDeduction)}</span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-2.5 font-mono font-black text-slate-950 bg-emerald-50/50 text-sm">
                    {formatEGP(item.netSalary)}
                  </td>
                  <td className="p-2.5">
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
                  <td className="p-2.5 text-center">
                    {onOpenPayslip && (
                      <button
                        onClick={() => onOpenPayslip(item.employeeId)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-rewaq-gold bg-white border border-slate-200 hover:border-rewaq-gold px-2.5 py-1 rounded-lg transition"
                      >
                        <Eye className="w-3 h-3" />
                        <span>كشف الراتب</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            {payrollRun.accrualJournalEntryNumber && (
              <span className="inline-flex items-center gap-1 font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md font-bold">
                <FileCheck className="w-3.5 h-3.5" />
                قيد الاستحقاق: {payrollRun.accrualJournalEntryNumber}
              </span>
            )}
            {payrollRun.paymentJournalEntryNumber && (
              <span className="inline-flex items-center gap-1 font-mono bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md font-bold">
                <FileCheck className="w-3.5 h-3.5" />
                قيد الصرف: {payrollRun.paymentJournalEntryNumber}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 transition"
            >
              إغلاق النافذة
            </button>

            {payrollRun.status === "CALCULATED" && (
              <button
                type="button"
                onClick={handleApprove}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-black bg-slate-950 hover:bg-slate-800 text-rewaq-gold shadow-md transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-rewaq-gold" />
                <span>اعتماد المسير وتوليد قيد اليومية</span>
              </button>
            )}

            {payrollRun.status === "APPROVED" && (
              <button
                type="button"
                onClick={handlePay}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition cursor-pointer"
              >
                <Banknote className="w-4 h-4" />
                <span>تسجيل الصرف من الخزينة/البنك</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
