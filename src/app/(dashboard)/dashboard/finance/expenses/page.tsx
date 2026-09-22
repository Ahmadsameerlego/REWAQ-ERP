"use client";

import React, { useState } from "react";
import {
  BadgePercent,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  Wallet,
  TrendingUp,
  Receipt,
  FileText,
} from "lucide-react";
import FinanceNav from "@/components/finance/FinanceNav";
import CreateExpenseModal from "@/components/finance/CreateExpenseModal";
import { useFinance } from "@/context/FinanceContext";
import { Expense } from "@/types/finance";
import { formatEGP } from "@/lib/accountingEngine";

export default function ExpensesPage() {
  const { expenses, expenseCategories, costCenters, approveExpense, payExpense, activeRole, financialSummary } = useFinance();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.expenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const unusualExpenses = expenses.filter((e) => e.isUnusual);

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <FinanceNav onOpenExpenseModal={() => setShowCreateModal(true)} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
              <BadgePercent className="w-3 h-3" />
              المصروفات التشغيلية ومراكز التكلفة
            </span>
            <span className="text-xs text-slate-500 font-medium">| تدقيق البنود والضرائب القابلة للخصم</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
            سجل المصروفات التشغيلية والاعتمادات المالية
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            تتبع إيجارات المعارض، الرواتب والعمولات، إعلانات السوشيال ميديا، وضريبة المدخلات 14%.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل مصروف جديد</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">إجمالي مصروفات الشهر</span>
          <div className="text-xl font-black text-rose-700 font-mono">
            {formatEGP(financialSummary.totalExpensesMonth)}
          </div>
          <span className="text-[10px] text-slate-400 block">شامل جميع مراكز التكلفة والفروع</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">رواتب وعمولات المبيعات</span>
          <div className="text-xl font-black text-slate-900 font-mono">
            {formatEGP(540000)}
          </div>
          <span className="text-[10px] text-slate-400 block">فريق المبيعات والصالات</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">إيجارات المعارض والمستودعات</span>
          <div className="text-xl font-black text-slate-900 font-mono">
            {formatEGP(480000)}
          </div>
          <span className="text-[10px] text-slate-400 block">فرع التجمع وأكتوبر ومصنع دمياط</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">ضريبة المدخلات القابلة للخصم</span>
          <div className="text-xl font-black text-emerald-700 font-mono">
            {formatEGP(financialSummary.totalVatInputMonth)}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">تخصم من مخرجات القيمة المضافة</span>
        </div>
      </div>

      {/* Expense Intelligence Alert */}
      {unusualExpenses.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-black text-amber-900 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>تنبيه تدقيق المصروفات (Unusual / Needs Review):</span>
          </div>
          <div className="space-y-1">
            {unusualExpenses.map((ue) => (
              <p key={ue.id} className="text-xs text-amber-800">
                • <strong>{ue.categoryName} (#{ue.expenseNumber}):</strong> {ue.unusualReason}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Filter & Table */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="بحث برقم المصروف، الجهة، أو التصنيف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pr-9 text-xs text-slate-800 focus:outline-none focus:border-rewaq-gold"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {["ALL", "PAID", "APPROVED", "PENDING_APPROVAL"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  statusFilter === st
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st === "ALL"
                  ? "الكل"
                  : st === "PAID"
                  ? "تم الصرف ✓"
                  : st === "APPROVED"
                  ? "معتمد للصرف"
                  : "بانتظار الاعتماد ⏳"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black">
              <tr>
                <th className="p-3">رقم المصروف</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3">التصنيف والبيان</th>
                <th className="p-3">الجهة المستلمة</th>
                <th className="p-3">مركز التكلفة</th>
                <th className="p-3">الأساسي</th>
                <th className="p-3">ضريبة 14%</th>
                <th className="p-3">الإجمالي المسدد</th>
                <th className="p-3">طريقة الصرف</th>
                <th className="p-3">الحالة</th>
                <th className="p-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3 font-mono font-bold text-slate-900">{e.expenseNumber}</td>
                  <td className="p-3 font-mono text-slate-600">{e.date}</td>
                  <td className="p-3">
                    <span className="font-bold text-slate-900 block">{e.categoryName}</span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">{e.description}</span>
                  </td>
                  <td className="p-3 font-medium text-slate-800">{e.vendorName}</td>
                  <td className="p-3 text-[11px] text-slate-600">{e.costCenterName}</td>
                  <td className="p-3 font-mono font-bold text-slate-700">{formatEGP(e.amount)}</td>
                  <td className="p-3 font-mono font-bold text-emerald-700">{formatEGP(e.taxAmount)}</td>
                  <td className="p-3 font-mono font-black text-rose-700">{formatEGP(e.totalAmount)}</td>
                  <td className="p-3 text-[11px] text-slate-600">{e.paidFromName}</td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        e.status === "PAID"
                          ? "bg-emerald-100 text-emerald-800"
                          : e.status === "APPROVED"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {e.status === "PAID"
                        ? "تم الصرف ✓"
                        : e.status === "APPROVED"
                        ? "معتمد"
                        : "بانتظار الاعتماد"}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {e.status === "PENDING_APPROVAL" && (activeRole === "FINANCE_MANAGER" || activeRole === "ADMIN") ? (
                      <button
                        type="button"
                        onClick={() => approveExpense(e.id, "المدير المالي")}
                        className="px-2.5 py-1 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
                      >
                        اعتماد
                      </button>
                    ) : e.status === "APPROVED" ? (
                      <button
                        type="button"
                        onClick={() => payExpense(e.id, "أمين الخزينة")}
                        className="px-2.5 py-1 text-xs font-black bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition cursor-pointer"
                      >
                        صرف وترحيل
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">قيد: {e.journalEntryId || "مرحل"}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateExpenseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
