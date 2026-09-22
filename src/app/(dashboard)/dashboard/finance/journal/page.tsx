"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  History,
  Search,
  Plus,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Eye,
  FileSpreadsheet,
  Building2,
  Layers,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import FinanceNav from "@/components/finance/FinanceNav";
import CreateJournalEntryModal from "@/components/finance/CreateJournalEntryModal";
import { useFinance } from "@/context/FinanceContext";
import { JournalEntry } from "@/types/finance";
import { formatEGP } from "@/lib/accountingEngine";

export default function JournalPage() {
  const { journalEntries, accounts, reverseJournalEntry, activeRole } = useFinance();
  const [searchQuery, setSearchQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEntryForDetails, setSelectedEntryForDetails] = useState<JournalEntry | null>(null);
  const [selectedEntryForReverse, setSelectedEntryForReverse] = useState<JournalEntry | null>(null);
  const [reversalReason, setReversalReason] = useState("");

  const filteredEntries = journalEntries.filter((je) => {
    const matchesSearch =
      je.entryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      je.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      je.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (je.sourceTransactionId && je.sourceTransactionId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesModule = moduleFilter === "ALL" || je.sourceModule === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const handleExecuteReversal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntryForReverse || !reversalReason) return;

    reverseJournalEntry(selectedEntryForReverse.id, "المدير المالي", reversalReason);
    setSelectedEntryForReverse(null);
    setReversalReason("");
  };

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <FinanceNav onOpenJournalModal={() => setShowCreateModal(true)} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1">
              <History className="w-3 h-3" />
              دفتر قيود اليومية والأستاذ العام (General Ledger)
            </span>
            <span className="text-xs text-slate-500 font-medium">| التوازن المحاسبي وتتبع المصدر</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
            سجل قيود اليومية العامة وترحيل الحسابات
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            كل قيد مرتبط بمعاملته المصدرية (POS / عقود / مخزون / شحن) مع ضمان توازن القيد المزدوج (Debit = Credit).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-rewaq-gold font-bold text-xs px-4 py-2 rounded-xl shadow-2xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء قيد يدوي جديد</span>
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="بحث برقم القيد، المرجع، البيان، أو رقم العقد..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pr-9 text-xs text-slate-800 focus:outline-none focus:border-rewaq-gold"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["ALL", "POS", "CONTRACT", "EXPENSE", "TREASURY", "MANUAL"].map((m) => (
            <button
              key={m}
              onClick={() => setModuleFilter(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                moduleFilter === m
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {m === "ALL"
                ? "جميع المصادر"
                : m === "POS"
                ? "نقاط البيع (POS)"
                : m === "CONTRACT"
                ? "عقود الأثاث"
                : m === "EXPENSE"
                ? "المصروفات"
                : m === "TREASURY"
                ? "التحويلات"
                : "قيود يدوية"}
            </button>
          ))}
        </div>
      </div>

      {/* Journal Entries List */}
      <div className="space-y-4">
        {filteredEntries.map((entry) => {
          const isReversed = entry.status === "REVERSED";
          return (
            <div
              key={entry.id}
              className={`bg-white rounded-2xl border p-5 shadow-2xs space-y-4 transition ${
                isReversed ? "opacity-70 bg-slate-50/80 border-slate-300" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Entry Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-black font-mono text-slate-900 text-sm bg-slate-100 px-2.5 py-1 rounded-lg">
                    {entry.entryNumber}
                  </span>

                  <div>
                    <h3 className="text-xs font-black text-slate-900">{entry.description}</h3>
                    <p className="text-[10px] text-slate-500 font-mono">
                      تاريخ: {entry.date} | مرجع: {entry.reference} | الفرع: {entry.branchName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    مصدر: {entry.sourceModule}
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      isReversed
                        ? "bg-rose-100 text-rose-800 line-through"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {isReversed ? "ملغي / معكوس" : "مرحل ومتوازن ✓"}
                  </span>

                  {!isReversed && (activeRole === "FINANCE_MANAGER" || activeRole === "ADMIN") && (
                    <button
                      type="button"
                      onClick={() => setSelectedEntryForReverse(entry)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition border border-rose-200 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>عكس القيد</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Journal Lines Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">كود واسم الحساب</th>
                      <th className="p-2.5 w-36">مدين (Debit)</th>
                      <th className="p-2.5 w-36">دائن (Credit)</th>
                      <th className="p-2.5">بيان السطر المحاسبي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-xs">
                    {entry.lines.map((line) => (
                      <tr key={line.id} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-sans">
                          <strong className="text-slate-900 ml-1.5 font-mono">{line.accountCode}</strong>
                          <span className="text-slate-700">{line.accountNameAr}</span>
                        </td>
                        <td className="p-2.5 font-bold text-slate-900">
                          {line.debit > 0 ? formatEGP(line.debit) : "-"}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900">
                          {line.credit > 0 ? formatEGP(line.credit) : "-"}
                        </td>
                        <td className="p-2.5 font-sans text-slate-600 text-[11px]">
                          {line.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100/70 border-t border-slate-200 font-mono font-black text-xs">
                    <tr>
                      <td className="p-2.5 font-sans font-black text-slate-900">إجمالي توازن القيد:</td>
                      <td className="p-2.5 text-slate-900">{formatEGP(entry.totalDebit)}</td>
                      <td className="p-2.5 text-slate-900">{formatEGP(entry.totalCredit)}</td>
                      <td className="p-2.5 font-sans font-normal text-[10px] text-emerald-800">
                        ✓ متوازن ومطابق لمعايير المحاسبة المصرية
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reversal Reason Modal */}
      {selectedEntryForReverse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-black text-sm">
              <ShieldAlert className="w-5 h-5" />
              <span>عكس وإلغاء القيد رقم: {selectedEntryForReverse.entryNumber}</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              سيقوم النظام بإنشاء قيد عكسي تلقائياً (تتبدل فيه الأطراف المدينة والدائنة) وتوثيق من قام بالعكس مع السبب في الـ Audit Trail.
            </p>

            <form onSubmit={handleExecuteReversal} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">سبب عكس القيد:</label>
                <textarea
                  rows={2}
                  required
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  placeholder="مثال: خطأ في توجيه الحساب / إلغاء العقد من العميل..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-rose-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedEntryForReverse(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  تراجع
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
                >
                  تأكيد عكس القيد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CreateJournalEntryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
