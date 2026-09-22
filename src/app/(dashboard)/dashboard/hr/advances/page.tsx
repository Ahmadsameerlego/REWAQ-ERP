"use client";

import React, { useState } from "react";
import { HandCoins, Plus, CheckCircle2, Calendar, Users2, ShieldCheck, AlertCircle } from "lucide-react";
import HrNav from "@/components/hr/HrNav";
import CreateAdvanceModal from "@/components/hr/CreateAdvanceModal";
import { useHR } from "@/context/HRContext";
import { formatEGP } from "@/lib/hrEngine";

export default function AdvancesPage() {
  const { advances, hrMetrics } = useHR();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <HrNav onOpenAdvanceModal={() => setIsModalOpen(true)} />

      {/* Header & KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-slate-400 block text-xs font-bold mb-1">إجمالي رصيد السلف القائمة</span>
          <span className="text-2xl font-black font-mono text-purple-900">
            {formatEGP(hrMetrics.totalActiveAdvancesBalance)}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-slate-400 block text-xs font-bold mb-1">عدد السلف النشطة</span>
          <span className="text-2xl font-black font-mono text-slate-900">
            {advances.filter((a) => a.status === "ACTIVE").length} سلف
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-slate-400 block text-xs font-bold mb-1">الربط مع الرواتب</span>
          <span className="text-sm font-bold text-emerald-800 flex items-center gap-1.5 mt-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            خصم آلي مجدول شهرياً بالـ Payroll
          </span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <HandCoins className="w-5 h-5 text-purple-600" />
              <span>سجل السلف والقروض الشخصية (Employee Advances)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              إدارة سلف الموظفين وجداول السداد والأرصدة المتبقية لكل فرع
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-purple-700 hover:bg-purple-800 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>طلب سلفة جديدة</span>
          </button>
        </div>

        {/* Advances Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 pr-6">رقم السلفة</th>
                  <th className="p-3.5">الموظف والفرع</th>
                  <th className="p-3.5">تاريخ الطلب</th>
                  <th className="p-3.5">المبلغ الإجمالي</th>
                  <th className="p-3.5">عدد الأقساط</th>
                  <th className="p-3.5">القسط الشهري</th>
                  <th className="p-3.5">الرصيد المتبقي</th>
                  <th className="p-3.5">شهر البدء</th>
                  <th className="p-3.5">السبب</th>
                  <th className="p-3.5">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {advances.map((adv) => (
                  <tr key={adv.id} className="hover:bg-slate-50">
                    <td className="p-3.5 pr-6 font-mono font-bold text-slate-900">{adv.advanceNumber}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 block">{adv.employeeName}</span>
                      <span className="text-[10px] text-slate-400">{adv.branchName} • {adv.departmentName}</span>
                    </td>
                    <td className="p-3.5 font-mono">{adv.requestDate}</td>
                    <td className="p-3.5 font-mono font-bold text-slate-900">{formatEGP(adv.totalAmount)}</td>
                    <td className="p-3.5 font-mono">{adv.installmentCount} أشهر</td>
                    <td className="p-3.5 font-mono font-bold text-purple-800">{formatEGP(adv.monthlyInstallment)}</td>
                    <td className="p-3.5 font-mono font-black text-purple-950 text-sm">
                      {formatEGP(adv.remainingBalance)}
                    </td>
                    <td className="p-3.5 font-mono">{adv.startMonth}</td>
                    <td className="p-3.5 text-slate-600">{adv.reason}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          adv.status === "ACTIVE"
                            ? "bg-purple-100 text-purple-900 border border-purple-200"
                            : adv.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {adv.status === "ACTIVE" ? "سارية قيد السداد" : adv.status === "COMPLETED" ? "مسددة بالكامل" : "معلقة"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CreateAdvanceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
