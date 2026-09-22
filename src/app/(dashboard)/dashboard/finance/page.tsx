"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Users2,
  Receipt,
  BadgePercent,
  FileCheck,
  Building2,
  Calendar,
  Layers,
  ArrowRightLeft,
  ArrowUpRight,
  ShieldCheck,
  Plus,
  Coins,
  History,
  Sparkles,
  AlertTriangle,
  Scale,
  DollarSign,
  PieChart,
  BarChart3,
  Bot,
} from "lucide-react";
import FinanceNav from "@/components/finance/FinanceNav";
import SmartFinanceInsights from "@/components/finance/SmartFinanceInsights";
import FinanceAssistantWidget from "@/components/finance/FinanceAssistantWidget";
import CreateReceiptModal from "@/components/finance/CreateReceiptModal";
import CreateExpenseModal from "@/components/finance/CreateExpenseModal";
import CreateJournalEntryModal from "@/components/finance/CreateJournalEntryModal";
import TreasuryTransferModal from "@/components/finance/TreasuryTransferModal";
import ReconciliationModal from "@/components/finance/ReconciliationModal";
import PeriodClosingModal from "@/components/finance/PeriodClosingModal";
import { useFinance } from "@/context/FinanceContext";
import { formatEGP } from "@/lib/accountingEngine";

export default function FinanceDashboardPage() {
  const {
    financialSummary,
    treasuries,
    bankAccounts,
    customerInstallments,
    etaInvoices,
    expenses,
    activePeriod,
  } = useFinance();

  // Modals state
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [showReconciliationModal, setShowReconciliationModal] = useState(false);
  const [showClosingModal, setShowClosingModal] = useState(false);

  const overdueInstallments = customerInstallments.filter((i) => i.status === "OVERDUE");
  const dueThisWeekInstallments = customerInstallments.filter((i) => i.status === "DUE");

  return (
    <div className="space-y-6">
      {/* Sub Navigation Bar */}
      <FinanceNav
        onOpenReceiptModal={() => setShowReceiptModal(true)}
        onOpenExpenseModal={() => setShowExpenseModal(true)}
        onOpenJournalModal={() => setShowJournalModal(true)}
        onOpenTransferModal={() => setShowTransferModal(true)}
        onOpenAssistantModal={() => setShowAssistantModal(true)}
      />

      {/* Main Header with Period & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rewaq-gold/15 text-rewaq-gold-dark border border-rewaq-gold/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              المحرك المالي والمحاسبي المتكامل
            </span>
            <span className="text-xs text-slate-500 font-medium">| {activePeriod.nameAr}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
            لوحة القيادة والتحليلات المالية الذكية
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            رؤية لحظية للسيولة النقدية، ربحية المعارض، موقف القيمة المضافة ETA، ومتأخرات العملاء.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowReconciliationModal(true)}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-200 transition cursor-pointer"
          >
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>مطابقة الخزينة / البنك</span>
          </button>

          <button
            type="button"
            onClick={() => setShowClosingModal(true)}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-rewaq-gold font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>إقفال الفترة المحاسبية</span>
          </button>
        </div>
      </div>

      {/* 1. Core Financial KPI Cards (Cash, Sales, Receivables, Expenses, Profitability, VAT) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* 1. Total Liquid Cash */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2 relative overflow-hidden group hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">إجمالي السيولة النقدية</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900 font-mono tracking-tight">
            {formatEGP(financialSummary.totalLiquidCash)}
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
            <span>خزائن: {formatEGP(financialSummary.totalCashInTreasuries)}</span>
            <span>بنوك: {formatEGP(financialSummary.totalCashInBanks)}</span>
          </div>
        </div>

        {/* 2. Sales Month */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2 relative overflow-hidden group hover:border-rewaq-gold transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">صافي المبيعات (الشهر)</span>
            <div className="w-7 h-7 rounded-lg bg-rewaq-gold/15 text-rewaq-gold-dark flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900 font-mono tracking-tight">
            {formatEGP(financialSummary.totalNetSalesMonth)}
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
            <span>إجمالي: {formatEGP(financialSummary.totalSalesMonth)}</span>
            <span className="text-emerald-700 font-bold">+18% نمو</span>
          </div>
        </div>

        {/* 3. Customer Receivables & Overdue */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2 relative overflow-hidden group hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">مستحقات وأقساط العملاء</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900 font-mono tracking-tight">
            {formatEGP(financialSummary.totalCustomerReceivables)}
          </div>
          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100">
            <span className="text-slate-500">عرابين: {formatEGP(financialSummary.totalCustomerAdvancesHeld)}</span>
            <span className="text-rose-600 font-bold font-mono">
              متأخر: {formatEGP(financialSummary.totalOverdueReceivables)}
            </span>
          </div>
        </div>

        {/* 4. Operating Expenses */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2 relative overflow-hidden group hover:border-rose-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">المصروفات التشغيلية</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <BadgePercent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-rose-700 font-mono tracking-tight">
            {formatEGP(financialSummary.totalExpensesMonth)}
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
            <span>إيجارات + رواتب</span>
            <span className="text-amber-700 font-bold">24% تسويق</span>
          </div>
        </div>

        {/* 5. Gross & Net Profit */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2 relative overflow-hidden group hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">الأرباح وهوامش الربحية</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-emerald-700 font-mono tracking-tight">
            {formatEGP(financialSummary.grossProfit)}
          </div>
          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100">
            <span className="text-slate-500">مجمل: {financialSummary.grossMarginPercent.toFixed(1)}%</span>
            <span className="font-bold text-emerald-800">صافي: {financialSummary.netMarginPercent.toFixed(1)}%</span>
          </div>
        </div>

        {/* 6. ETA VAT Position */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2 relative overflow-hidden group hover:border-amber-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">صافي القيمة المضافة ETA</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-amber-900 font-mono tracking-tight">
            {formatEGP(financialSummary.netVatPosition)}
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
            <span>مخرجات: {formatEGP(financialSummary.totalVatOutputMonth)}</span>
            <span>مدخلات: {formatEGP(financialSummary.totalVatInputMonth)}</span>
          </div>
        </div>
      </div>

      {/* 2. Smart Financial Insights Card Feed */}
      <SmartFinanceInsights />

      {/* 3. Mid Grid: Live Treasuries & Cash Breakdown + Customer Installments Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Treasuries & Banks */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-rewaq-gold flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">أرصدة الخزائن والبنوك اللحظية</h3>
                <p className="text-[11px] text-slate-500">السيولة المتاحة ومستويات الأمان التشغيلي</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowTransferModal(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>أمر تحويل</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {/* Treasuries */}
            <p className="text-[10px] font-bold text-slate-400 uppercase">خزائن الفروع والصالات (Cash Vaults):</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {treasuries.map((t) => {
                const isBelowMin = t.currentBalance < t.minOperationalLimit;
                return (
                  <div
                    key={t.id}
                    className={`p-3 rounded-xl border transition ${
                      isBelowMin
                        ? "bg-rose-50/70 border-rose-300"
                        : "bg-slate-50 border-slate-200/80 hover:bg-slate-100/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">{t.nameAr}</span>
                      {isBelowMin && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-600 text-white animate-pulse">
                          أقل من الحد
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-black font-mono text-slate-900">
                      {formatEGP(t.currentBalance)}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                      <span>الأمين: {t.managerName}</span>
                      <span>حد أدنى: {formatEGP(t.minOperationalLimit)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Banks */}
            <p className="text-[10px] font-bold text-slate-400 uppercase pt-2">الحسابات البنكية ونقاط POS:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {bankAccounts.map((b) => (
                <div key={b.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-xs font-bold text-slate-800 block">{b.bankName}</span>
                  <span className="text-[10px] text-slate-500 block">{b.accountNameAr}</span>
                  <div className="text-sm font-black font-mono text-emerald-800 mt-1">
                    {formatEGP(b.currentBalance)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    IBAN: {b.iban.substring(0, 12)}...
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Installments Timeline & Overdue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">الأقساط المستحقة والتحصيلات القريبة</h3>
                <p className="text-[11px] text-slate-500">متابعة مواعيد استحقاق أقساط عقود الأثاث</p>
              </div>
            </div>

            <Link
              href="/dashboard/finance/installments"
              className="text-xs font-bold text-rewaq-gold-dark hover:underline flex items-center gap-1"
            >
              <span>عرض الجدول كاملاً</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {customerInstallments.slice(0, 5).map((inst) => {
              const isOverdue = inst.status === "OVERDUE";
              const isDue = inst.status === "DUE";
              const isPaid = inst.status === "PAID";

              return (
                <div
                  key={inst.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                    isOverdue
                      ? "bg-rose-50/80 border-rose-200"
                      : isDue
                      ? "bg-amber-50/80 border-amber-200"
                      : isPaid
                      ? "bg-emerald-50/50 border-emerald-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isOverdue
                          ? "bg-rose-100 text-rose-700"
                          : isDue
                          ? "bg-amber-100 text-amber-800"
                          : isPaid
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {isPaid ? "✓" : isOverdue ? "⚠️" : "⏳"}
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-slate-900">{inst.customerName}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">
                        عقد #{inst.orderNumber} | قسط {inst.installmentNumber} من {inst.totalInstallments} | تاريخ: {inst.dueDate}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div>
                      <span className="text-xs font-black font-mono text-slate-900 block">
                        {formatEGP(inst.amount)}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                          isPaid
                            ? "bg-emerald-100 text-emerald-800"
                            : isOverdue
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {isPaid ? "تم السداد" : isOverdue ? "متأخر" : "مستحق هذا الأسبوع"}
                      </span>
                    </div>

                    {!isPaid && (
                      <button
                        type="button"
                        onClick={() => setShowReceiptModal(true)}
                        className="bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-[10px] px-2.5 py-1.5 rounded-lg shadow-2xs transition cursor-pointer"
                      >
                        تحصيل
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Bottom Grid: Egyptian ETA Compliance Status + Interactive AI Finance Advisor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ETA Compliance Status */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">مصلحة الضرائب المصرية (ETA)</h3>
                <p className="text-[10px] text-slate-500">الفاتورة والإيصال الإلكتروني</p>
              </div>
            </div>

            <Link href="/dashboard/finance/taxes" className="text-xs font-bold text-rewaq-gold-dark hover:underline">
              تفاصيل
            </Link>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">رقم التسجيل الضريبي:</span>
                <span className="font-mono font-bold text-slate-900">614-829-103</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">التوقيع الإلكتروني Token:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  نشط ومصرح
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">نسبة الضريبة العامة VAT:</span>
                <span className="font-bold text-slate-900 font-mono">14% (قابلة للتعديل)</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">آخر الفواتير المرسلة:</span>
              {etaInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{inv.receiverName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{inv.internalId}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold font-mono block">{formatEGP(inv.totalAmount)}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        inv.etaStatus === "VALID"
                          ? "bg-emerald-100 text-emerald-800"
                          : inv.etaStatus === "REJECTED"
                          ? "bg-rose-100 text-rose-800 font-black"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {inv.etaStatus === "VALID" ? "معتمدة VALID" : "مرفوضة REJECTED"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Embedded Interactive AI Finance Assistant */}
        <div className="lg:col-span-2">
          <FinanceAssistantWidget isInline={true} />
        </div>
      </div>

      {/* Interactive Modals */}
      <CreateReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
      />

      <CreateExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
      />

      <CreateJournalEntryModal
        isOpen={showJournalModal}
        onClose={() => setShowJournalModal(false)}
      />

      <TreasuryTransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
      />

      <FinanceAssistantWidget
        isOpen={showAssistantModal}
        onClose={() => setShowAssistantModal(false)}
      />

      <ReconciliationModal
        isOpen={showReconciliationModal}
        onClose={() => setShowReconciliationModal(false)}
      />

      <PeriodClosingModal
        isOpen={showClosingModal}
        onClose={() => setShowClosingModal(false)}
      />
    </div>
  );
}
