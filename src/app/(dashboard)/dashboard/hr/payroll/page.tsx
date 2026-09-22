"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Banknote, Plus, Calendar, CheckCircle2, ShieldCheck, Eye, RefreshCw, ArrowLeft, FileCheck } from "lucide-react";
import HrNav from "@/components/hr/HrNav";
import CreatePayrollRunModal from "@/components/hr/CreatePayrollRunModal";
import { useHR } from "@/context/HRContext";
import { formatEGP } from "@/lib/hrEngine";

export default function PayrollPage() {
  const { payrollRuns } = useHR();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <HrNav onOpenPayrollModal={() => setIsModalOpen(true)} />

      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Banknote className="w-5 h-5 text-rewaq-gold" />
            <span>مسيرات الرواتب الشهرية (Payroll Runs)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            دورة احتساب ومراجعة واعتماد وصرف الرواتب وتوليد القيود المحاسبية التلقائية
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-rewaq-gold font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء مسير راتب جديد</span>
        </button>
      </div>

      {/* Payroll Runs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {payrollRuns.map((run) => (
          <div
            key={run.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base text-slate-900">{run.periodLabel}</h3>
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {run.runNumber}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 mt-0.5 block">{run.branchName} • {run.employeeCount} موظف</span>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-black ${
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

              {/* Financial Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">الراتب الأساسي:</span>
                  <span className="font-mono font-bold text-slate-800">{formatEGP(run.totalBasic)}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">البدلات والحوافز:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    +{formatEGP(run.totalAllowances + run.totalOvertime + run.totalBonuses + run.totalCommissions)}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">الضرائب والتأمينات:</span>
                  <span className="font-mono font-bold text-rose-700">
                    -{formatEGP(run.totalIncomeTax + run.totalEmployeeInsurance)}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">سلف وغيابات:</span>
                  <span className="font-mono font-bold text-amber-700">
                    -{formatEGP(run.totalAdvanceDeductions + run.totalAbsenceDeductions + run.totalLateDeductions)}
                  </span>
                </div>
              </div>

              {/* Net Output Box */}
              <div className="mt-3 p-4 bg-slate-950 text-white rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-rewaq-gold font-bold block">صافي الرواتب المستحقة</span>
                  <span className="text-[10px] text-slate-400">Net Payable Amount</span>
                </div>
                <div className="text-left font-mono font-black text-xl text-rewaq-gold">
                  {formatEGP(run.totalNetSalary)}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {run.accrualJournalEntryNumber ? (
                <span className="text-[11px] font-mono text-emerald-800 flex items-center gap-1 font-bold">
                  <FileCheck className="w-3.5 h-3.5" />
                  قيد اليومية: {run.accrualJournalEntryNumber}
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">بانتظار قيد الاستحقاق</span>
              )}

              <Link
                href={`/dashboard/hr/payroll/${run.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-slate-100 hover:bg-slate-200 text-slate-900 transition"
              >
                <span>شاشة المراجعة والتفاصيل</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <CreatePayrollRunModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
