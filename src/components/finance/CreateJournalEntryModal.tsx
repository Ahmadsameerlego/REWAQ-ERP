"use client";

import React, { useState } from "react";
import {
  History,
  X,
  CheckCircle2,
  Plus,
  Trash2,
  AlertTriangle,
  Layers,
  Building2,
} from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { JournalLine } from "@/types/finance";
import { validateJournalBalance, formatEGP } from "@/lib/accountingEngine";

interface CreateJournalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateJournalEntryModal({
  isOpen,
  onClose,
}: CreateJournalEntryModalProps) {
  const { accounts, costCenters, createJournalEntry, postJournalEntry, activeRole } = useFinance();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");
  const [branchId, setBranchId] = useState("branch-cairo");
  const [costCenterId, setCostCenterId] = useState(costCenters[0]?.id || "cc-cairo");

  const [lines, setLines] = useState<JournalLine[]>([
    {
      id: "jl-new-1",
      accountCode: "1010",
      accountNameAr: "خزينة فرع التجمع الخامس",
      debit: 50000,
      credit: 0,
      description: "مدين",
    },
    {
      id: "jl-new-2",
      accountCode: "4010",
      accountNameAr: "إيرادات مبيعات معارض الأثاث",
      debit: 0,
      credit: 50000,
      description: "دائن",
    },
  ]);

  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const { isBalanced, totalDebit, totalCredit, difference } = validateJournalBalance(lines);

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: `jl-new-${Date.now()}`,
        accountCode: accounts[0]?.code || "1010",
        accountNameAr: accounts[0]?.nameAr || "",
        debit: 0,
        credit: 0,
        description: "",
      },
    ]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 2) {
      setErrorMessage("يجب أن يحتوي القيد المحاسبي على طرفين على الأقل (مدين ودائن)");
      return;
    }
    setLines((prev) => prev.filter((_, i) => i !== index));
    setErrorMessage(null);
  };

  const updateLine = (index: number, updates: Partial<JournalLine>) => {
    setLines((prev) =>
      prev.map((l, i) => {
        if (i === index) {
          const updated = { ...l, ...updates };
          if (updates.accountCode) {
            const acc = accounts.find((a) => a.code === updates.accountCode);
            if (acc) updated.accountNameAr = acc.nameAr;
          }
          return updated;
        }
        return l;
      })
    );
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage("يرجى إدخال شرح وتفاصيل القيد المحاسبي");
      return;
    }

    if (!isBalanced) {
      setErrorMessage(`القيد غير متوازن! يوجد فارق قدره ${formatEGP(difference)} بين المدين والدائن.`);
      return;
    }

    const selectedCC = costCenters.find((c) => c.id === costCenterId);

    const entry = createJournalEntry({
      date,
      reference: reference || `MANUAL-${Date.now().toString().slice(-4)}`,
      sourceModule: "MANUAL",
      description,
      lines,
      totalDebit,
      totalCredit,
      branchId,
      branchName: branchId === "branch-cairo" ? "فرع التجمع الرئيسي" : branchId === "branch-october" ? "فرع 6 أكتوبر" : "فرع طنطا",
      costCenterId,
      costCenterName: selectedCC?.nameAr || "الإدارة العامة",
      status: "POSTED",
      createdBy: "المحاسب المالي",
      postedAt: new Date().toISOString(),
      postedBy: "المحاسب المالي",
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 flex items-center justify-center font-bold">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black">إنشاء قيد يومية يدوي (Journal Entry)</h3>
              <p className="text-[10px] text-slate-300">نظام القيد المزدوج مع التحقق اللحظي من التوازن المحاسبي</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-black text-slate-900">تم ترحيل قيد اليومية بنجاح!</h4>
            <p className="text-xs text-slate-500">تم تحديث ميزان المراجعة ودفتر الأستاذ العام للحسابات المتأثرة.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            {/* Top Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ القيد:</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-rewaq-gold cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المرجع / السند:</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="تسوية بنكية / إهلاك"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rewaq-gold focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">مركز التكلفة:</label>
                <select
                  value={costCenterId}
                  onChange={(e) => setCostCenterId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-rewaq-gold cursor-pointer"
                >
                  {costCenters.map((cc) => (
                    <option key={cc.id} value={cc.id}>
                      {cc.code} - {cc.nameAr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">شرح وبيان القيد المحاسبي:</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أدخل بياناً شاملاً ومفصلاً لسبب القيد..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rewaq-gold focus:bg-white transition"
              />
            </div>

            {/* Dynamic Journal Lines Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-800">أطراف القيد (أكواد الحسابات):</span>
                <button
                  type="button"
                  onClick={addLine}
                  className="inline-flex items-center gap-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1 rounded-xl transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة طرف جديد</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                    <tr>
                      <th className="p-2.5">الحساب المالي</th>
                      <th className="p-2.5 w-32">مدين (Debit)</th>
                      <th className="p-2.5 w-32">دائن (Credit)</th>
                      <th className="p-2.5">البيان</th>
                      <th className="p-2.5 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {lines.map((line, idx) => (
                      <tr key={line.id}>
                        <td className="p-2">
                          <select
                            value={line.accountCode}
                            onChange={(e) => updateLine(idx, { accountCode: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-bold focus:outline-none"
                          >
                            {accounts.map((acc) => (
                              <option key={acc.code} value={acc.code}>
                                {acc.code} - {acc.nameAr} ({acc.category})
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            min={0}
                            value={line.debit || ""}
                            onChange={(e) => updateLine(idx, { debit: Number(e.target.value), credit: 0 })}
                            placeholder="0"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:bg-white"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            min={0}
                            value={line.credit || ""}
                            onChange={(e) => updateLine(idx, { credit: Number(e.target.value), debit: 0 })}
                            placeholder="0"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:bg-white"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="text"
                            value={line.description}
                            onChange={(e) => updateLine(idx, { description: e.target.value })}
                            placeholder="بيان الطرف..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-none"
                          />
                        </td>

                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeLine(idx)}
                            aria-label="حذف الطرف"
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Balance Checker Footer */}
            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
              isBalanced ? "bg-emerald-50 border-emerald-200 text-emerald-950" : "bg-rose-50 border-rose-200 text-rose-950"
            }`}>
              <div className="flex items-center gap-2">
                {isBalanced ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                )}
                <span>
                  {isBalanced
                    ? "القيد متوازن تماماً وجاهز للترحيل"
                    : `القيد غير متوازن (فارق: ${formatEGP(difference)})`}
                </span>
              </div>

              <div className="flex items-center gap-4 font-mono">
                <span>إجمالي المدين: <strong className="text-slate-900">{formatEGP(totalDebit)}</strong></span>
                <span>إجمالي الدائن: <strong className="text-slate-900">{formatEGP(totalCredit)}</strong></span>
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2 rounded-lg border border-rose-200">
                {errorMessage}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={!isBalanced}
                className={`px-5 py-2 text-xs font-black rounded-xl shadow-xs transition cursor-pointer ${
                  isBalanced
                    ? "bg-slate-900 hover:bg-slate-800 text-rewaq-gold"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                حفظ وترحيل القيد
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
