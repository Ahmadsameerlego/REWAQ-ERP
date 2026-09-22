"use client";

import React, { useState } from "react";
import {
  Wallet,
  Building2,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Scale,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  Search,
} from "lucide-react";
import FinanceNav from "@/components/finance/FinanceNav";
import TreasuryTransferModal from "@/components/finance/TreasuryTransferModal";
import ReconciliationModal from "@/components/finance/ReconciliationModal";
import { useFinance } from "@/context/FinanceContext";
import { formatEGP } from "@/lib/accountingEngine";

export default function TreasuryPage() {
  const {
    treasuries,
    bankAccounts,
    treasuryTransfers,
    reconciliations,
    approveTreasuryTransfer,
    financialSummary,
    activeRole,
  } = useFinance();

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showReconciliationModal, setShowReconciliationModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"ACCOUNTS" | "TRANSFERS" | "RECONCILIATION">("ACCOUNTS");

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <FinanceNav
        onOpenTransferModal={() => setShowTransferModal(true)}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <Wallet className="w-3 h-3" />
              الخزائن والبنوك وحركات السيولة
            </span>
            <span className="text-xs text-slate-500 font-medium">| Treasury & Bank Accounts</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
            إدارة الخزائن النقدية والحسابات البنكية والتحويلات
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            متابعة أرصدة خزن الفروع اللحظية، طلبات التحويل بين الخزائن، والمطابقات الدورية.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowReconciliationModal(true)}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-200 transition cursor-pointer"
          >
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>تسجيل جرد ومطابقة</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTransferModal(true)}
            className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>تحويل مالي بين الخزن</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">إجمالي السيولة النقدية (خزائن + بنوك)</span>
          <div className="text-2xl font-black text-emerald-800 font-mono">
            {formatEGP(financialSummary.totalLiquidCash)}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">جاهزة لتغطية الالتزامات التشغيلية</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">نقدية خزائن الفروع (Cash on Hand)</span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatEGP(financialSummary.totalCashInTreasuries)}
          </div>
          <span className="text-[10px] text-slate-400 block">موزعة على 4 خزائن وصالات عرض</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">أرصدة الحسابات البنكية ونقاط POS</span>
          <div className="text-2xl font-black text-blue-800 font-mono">
            {formatEGP(financialSummary.totalCashInBanks)}
          </div>
          <span className="text-[10px] text-slate-400 block">حساب CIB التجاري + بنك مصر</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab("ACCOUNTS")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "ACCOUNTS"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            خزائن الفروع والحسابات البنكية
          </button>

          <button
            onClick={() => setActiveTab("TRANSFERS")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "TRANSFERS"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>أوامر التحويل بين الخزائن</span>
            {treasuryTransfers.filter((t) => t.status === "PENDING_APPROVAL").length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                {treasuryTransfers.filter((t) => t.status === "PENDING_APPROVAL").length} معلق
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("RECONCILIATION")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "RECONCILIATION"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            سجلات المطابقة والجرد
          </button>
        </div>

        {activeTab === "ACCOUNTS" && (
          <div className="space-y-4">
            {/* Cash Vaults */}
            <div>
              <h3 className="text-xs font-black text-slate-900 mb-3 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-rewaq-gold" />
                <span>خزائن الفروع والصالات (Cash Vaults):</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {treasuries.map((t) => {
                  const isBelowMin = t.currentBalance < t.minOperationalLimit;
                  return (
                    <div
                      key={t.id}
                      className={`p-4 rounded-2xl border transition space-y-2 ${
                        isBelowMin
                          ? "bg-rose-50/70 border-rose-300"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{t.nameAr}</span>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">{t.code}</span>
                      </div>

                      <div className="text-xl font-black font-mono text-slate-900">
                        {formatEGP(t.currentBalance)}
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                        <div className="flex justify-between">
                          <span>المسؤول:</span>
                          <strong className="text-slate-800">{t.managerName}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>حد الأمان الأدنى:</span>
                          <strong className="font-mono">{formatEGP(t.minOperationalLimit)}</strong>
                        </div>
                      </div>

                      {isBelowMin && (
                        <div className="pt-1 text-[10px] font-black text-rose-700 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>تتطلب تغذية نقدية عاجلة</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bank Accounts */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-black text-slate-900 mb-3 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>الحسابات البنكية ونقاط البيع (Bank Accounts):</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bankAccounts.map((b) => (
                  <div key={b.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">{b.bankName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                        حساب نشط
                      </span>
                    </div>

                    <div className="text-2xl font-black font-mono text-emerald-800">
                      {formatEGP(b.currentBalance)}
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-200/60 font-mono">
                      <div>الحساب: {b.accountNameAr}</div>
                      <div>رقم الحساب: {b.accountNumber}</div>
                      <div>IBAN: {b.iban}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "TRANSFERS" && (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black">
                <tr>
                  <th className="p-3">رقم الأمر</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">من حساب / خزينة</th>
                  <th className="p-3">إلى حساب / خزينة</th>
                  <th className="p-3">المبلغ</th>
                  <th className="p-3">السبب / المرجع</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3 text-center">اعتماد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {treasuryTransfers.map((tr) => (
                  <tr key={tr.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-bold font-mono text-slate-900">{tr.transferNumber}</td>
                    <td className="p-3 font-mono text-slate-600">{tr.date}</td>
                    <td className="p-3 font-bold text-slate-800">{tr.fromName}</td>
                    <td className="p-3 font-bold text-slate-800">{tr.toName}</td>
                    <td className="p-3 font-mono font-black text-slate-900 text-sm">
                      {formatEGP(tr.amount)}
                    </td>
                    <td className="p-3 text-slate-600">{tr.reference}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          tr.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {tr.status === "COMPLETED" ? "مكتمل ومرحل ✓" : "بانتظار الاعتماد ⏳"}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {tr.status === "PENDING_APPROVAL" && (activeRole === "FINANCE_MANAGER" || activeRole === "ADMIN") ? (
                        <button
                          type="button"
                          onClick={() => approveTreasuryTransfer(tr.id, "المدير المالي")}
                          className="px-3 py-1 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition cursor-pointer"
                        >
                          اعتماد وترحيل
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">معتمد مسبقاً</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "RECONCILIATION" && (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black">
                <tr>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">الخزينة / الحساب المستهدف</th>
                  <th className="p-3">الرصيد الدفتري</th>
                  <th className="p-3">الرصيد الفعلي (المعدود)</th>
                  <th className="p-3">الفارق</th>
                  <th className="p-3">المطابقة</th>
                  <th className="p-3">القائم بالجرد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reconciliations.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-mono text-slate-600">{rec.date}</td>
                    <td className="p-3 font-bold text-slate-900">{rec.targetName}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">{formatEGP(rec.systemBalance)}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">{formatEGP(rec.physicalBalance)}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">{formatEGP(rec.difference)}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.status === "BALANCED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {rec.status === "BALANCED" ? "مطابق تماماً ✓" : "يوجد فارق"}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{rec.reconciledBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TreasuryTransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
      />

      <ReconciliationModal
        isOpen={showReconciliationModal}
        onClose={() => setShowReconciliationModal(false)}
      />
    </div>
  );
}
