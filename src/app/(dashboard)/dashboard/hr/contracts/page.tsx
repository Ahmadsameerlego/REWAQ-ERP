"use client";

import React, { useState } from "react";
import { FileCheck, AlertTriangle, CheckCircle2, Clock, Calendar, Search, RefreshCw, X } from "lucide-react";
import HrNav from "@/components/hr/HrNav";
import { useHR } from "@/context/HRContext";
import { formatEGP } from "@/lib/hrEngine";
import { EmploymentContract } from "@/types/hr";

export default function ContractsPage() {
  const { contracts, renewContract } = useHR();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [renewingContract, setRenewingContract] = useState<EmploymentContract | null>(null);
  const [newEndDate, setNewEndDate] = useState("2027-12-31");
  const [newSalary, setNewSalary] = useState<number>(0);

  const filteredContracts = contracts.filter((c) => {
    if (filterStatus !== "ALL" && c.status !== filterStatus) return false;
    if (searchQuery && !c.employeeName.includes(searchQuery) && !c.contractNumber.includes(searchQuery)) return false;
    return true;
  });

  const expiringCount = contracts.filter((c) => c.status === "EXPIRING_SOON").length;

  const handleOpenRenew = (c: EmploymentContract) => {
    setRenewingContract(c);
    setNewSalary(c.basicSalary);
  };

  const handleConfirmRenew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewingContract) return;
    renewContract(renewingContract.id, newEndDate, newSalary, "أحمد سمير");
    setRenewingContract(null);
  };

  return (
    <div className="space-y-6">
      <HrNav />

      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-rewaq-gold" />
              <span>إدارة وتجديد عقود العمل (Employment Contracts)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              متابعة مدد العقود، فترات الاختبار، وتنبيهات انتهاء العقود قبل 30 و 60 يوماً
            </p>
          </div>

          {expiringCount > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
              <span className="font-bold">تنبيه عاجل: يوجد {expiringCount} عقود قاربت على الانتهاء</span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث باسم الموظف أو رقم العقد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-8 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-rewaq-gold"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
            >
              <option value="ALL">كل حالات العقود ({contracts.length})</option>
              <option value="ACTIVE">عقود سارية ونشطة</option>
              <option value="EXPIRING_SOON">تنتهي قريباً (أقل من 30 يوم)</option>
              <option value="EXPIRED">منتهية</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5 pr-6">رقم العقد</th>
                <th className="p-3.5">الموظف</th>
                <th className="p-3.5">نوع العقد</th>
                <th className="p-3.5">تاريخ البداية</th>
                <th className="p-3.5">تاريخ النهاية</th>
                <th className="p-3.5">الراتب التعاقدي</th>
                <th className="p-3.5">الإجازة السنوية</th>
                <th className="p-3.5">الحالة</th>
                <th className="p-3.5 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContracts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="p-3.5 pr-6 font-mono font-bold text-slate-900">{c.contractNumber}</td>
                  <td className="p-3.5">
                    <span className="font-bold text-slate-900 block">{c.employeeName}</span>
                  </td>
                  <td className="p-3.5">
                    {c.contractType === "FULL_TIME"
                      ? "دوام كامل محدد المدة"
                      : c.contractType === "PROBATION"
                      ? "فترة اختبار (3 أشهر)"
                      : "دوام جزئي"}
                  </td>
                  <td className="p-3.5 font-mono">{c.startDate}</td>
                  <td className="p-3.5 font-mono font-bold text-slate-800">{c.endDate || "غير محدد"}</td>
                  <td className="p-3.5 font-mono font-bold text-slate-900">{formatEGP(c.basicSalary)}</td>
                  <td className="p-3.5 font-mono">{c.annualLeaveDays} يوم</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        c.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : c.status === "EXPIRING_SOON"
                          ? "bg-rose-500 text-white font-bold animate-pulse"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {c.status === "ACTIVE" ? "ساري" : c.status === "EXPIRING_SOON" ? "ينتهي قريباً" : "منتهي"}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => handleOpenRenew(c)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-rewaq-gold px-3 py-1.5 rounded-xl transition"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>تجديد العقد</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Renew Modal */}
      {renewingContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">تجديد عقد عمل الموظف: {renewingContract.employeeName}</h3>
              <button onClick={() => setRenewingContract(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmRenew} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">تاريخ نهاية العقد الجديد *</label>
                <input
                  type="date"
                  required
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الراتب الأساسي الجديد بعد التجديد (ج.م)</label>
                <input
                  type="number"
                  required
                  value={newSalary}
                  onChange={(e) => setNewSalary(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setRenewingContract(null)} className="px-4 py-2 rounded-xl text-slate-500 font-bold">
                  إلغاء
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black">
                  تأكيد وتجديد العقد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
