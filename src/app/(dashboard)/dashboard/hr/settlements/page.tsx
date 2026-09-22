"use client";

import React, { useState } from "react";
import { UserCheck, Plus, CheckCircle2, AlertTriangle, FileText, Banknote, ShieldCheck } from "lucide-react";
import HrNav from "@/components/hr/HrNav";
import FinalSettlementModal from "@/components/hr/FinalSettlementModal";
import { useHR } from "@/context/HRContext";
import { formatEGP } from "@/lib/hrEngine";

export default function SettlementsPage() {
  const { finalSettlements } = useHR();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <HrNav />

      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-600" />
            <span>مخالصات نهاية الخدمة والتسوية النهائية (Final Settlements)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            احتساب مستحقات نهاية الخدمة، تصفية السلف القائمة، والتعويض عن الإجازات غير المستهلكة
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إجراء مخالصة جديدة</span>
        </button>
      </div>

      {/* Settlements Table or Empty State */}
      {finalSettlements.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-800">لا توجد مخالصات نهاية خدمة مسجلة حالياً</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            عند استقالة موظف أو انتهاء تعاقده، يمكنك إجراء مخالصة نهائية لحساب مكافأة نهاية الخدمة وتصفية العهد والسلف القائمة آلياً.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-rewaq-gold font-bold text-xs px-4 py-2 rounded-xl transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إنشاء أول مخالصة</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 pr-6">رقم المخالصة</th>
                  <th className="p-3.5">الموظف</th>
                  <th className="p-3.5">الفرع والقسم</th>
                  <th className="p-3.5">تاريخ الإنهاء</th>
                  <th className="p-3.5">السبب</th>
                  <th className="p-3.5">إجمالي المستحقات</th>
                  <th className="p-3.5">استقطاع السلف والعهد</th>
                  <th className="p-3.5">صافي مبلغ المخالصة</th>
                  <th className="p-3.5">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {finalSettlements.map((set) => (
                  <tr key={set.id} className="hover:bg-slate-50">
                    <td className="p-3.5 pr-6 font-mono font-bold text-slate-900">{set.settlementNumber}</td>
                    <td className="p-3.5 font-bold text-slate-900">{set.employeeName}</td>
                    <td className="p-3.5">
                      <span className="text-slate-800 block">{set.branchName}</span>
                      <span className="text-[10px] text-slate-400">{set.departmentName}</span>
                    </td>
                    <td className="p-3.5 font-mono">{set.terminationDate}</td>
                    <td className="p-3.5">
                      {set.reason === "RESIGNATION"
                        ? "استقالة"
                        : set.reason === "CONTRACT_END"
                        ? "انتهاء عقد"
                        : "إنهاء خدمة"}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-700">{formatEGP(set.totalEntitlements)}</td>
                    <td className="p-3.5 font-mono text-rose-700">-{formatEGP(set.totalDeductions)}</td>
                    <td className="p-3.5 font-mono font-black text-slate-950 text-sm">
                      {formatEGP(set.netSettlementAmount)}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        معتمدة ومصفاة
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <FinalSettlementModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
