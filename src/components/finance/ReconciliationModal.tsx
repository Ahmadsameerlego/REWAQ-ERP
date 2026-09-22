"use client";

import React, { useState } from "react";
import {
  Wallet,
  Building2,
  X,
  CheckCircle2,
  AlertTriangle,
  Scale,
} from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { formatEGP } from "@/lib/accountingEngine";

interface ReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReconciliationModal({
  isOpen,
  onClose,
}: ReconciliationModalProps) {
  const { treasuries, bankAccounts, createReconciliation } = useFinance();

  const [targetId, setTargetId] = useState(treasuries[0]?.id || "tr-cairo");
  const [physicalBalance, setPhysicalBalance] = useState<number>(148500);
  const [notes, setNotes] = useState("مطابقة الجرد اليومي الدوري");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const targets = [
    ...treasuries.map((t) => ({ id: t.id, name: t.nameAr, type: "TREASURY" as const, systemBalance: t.currentBalance })),
    ...bankAccounts.map((b) => ({ id: b.id, name: `${b.bankName} - ${b.accountNameAr}`, type: "BANK" as const, systemBalance: b.currentBalance })),
  ];

  const selectedTarget = targets.find((t) => t.id === targetId);
  const systemBalance = selectedTarget?.systemBalance || 0;
  const difference = physicalBalance - systemBalance;
  const isBalanced = Math.abs(difference) < 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTarget) return;

    createReconciliation({
      date: new Date().toISOString().split("T")[0],
      targetId: selectedTarget.id,
      targetName: selectedTarget.name,
      targetType: selectedTarget.type,
      systemBalance,
      physicalBalance,
      difference,
      status: isBalanced ? "BALANCED" : "DISCREPANCY",
      reconciliationNotes: notes,
      reconciledBy: "المراجع المالي",
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center justify-center font-bold">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black">مطابقة وتسوية رصيد الخزينة / البنك</h3>
              <p className="text-[10px] text-slate-300">مقارنة الرصيد الدفتري بالنقدية الفعلية أو كشف الحساب</p>
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
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-slate-900">تم حفظ سجل المطابقة بنجاح!</h4>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الخزينة أو الحساب البنكي:</label>
              <select
                value={targetId}
                onChange={(e) => {
                  const tid = e.target.value;
                  setTargetId(tid);
                  const found = targets.find((t) => t.id === tid);
                  if (found) setPhysicalBalance(found.systemBalance);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-rewaq-gold cursor-pointer"
              >
                {targets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (دفتري: {formatEGP(t.systemBalance)})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block mb-1">الرصيد الدفتري (النظام):</span>
                <span className="text-sm font-black text-slate-900 font-mono">{formatEGP(systemBalance)}</span>
              </div>

              <div>
                <label className="block text-[10px] text-slate-700 font-bold mb-1">الرصيد الفعلي (المعدود):</label>
                <input
                  type="number"
                  required
                  value={physicalBalance}
                  onChange={(e) => setPhysicalBalance(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black font-mono focus:outline-none focus:border-rewaq-gold focus:bg-white transition"
                />
              </div>
            </div>

            {/* Difference indicator */}
            <div className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
              isBalanced ? "bg-emerald-50 border-emerald-200 text-emerald-950" : "bg-rose-50 border-rose-200 text-rose-950"
            }`}>
              <div className="flex items-center gap-1.5">
                {isBalanced ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                )}
                <span>{isBalanced ? "مطابقة تامة (لا يوجد عجز أو زيادة)" : "يوجد فارق تسوية:"}</span>
              </div>
              <span className="font-mono text-sm font-black">{formatEGP(difference)}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات المطابقة:</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="محضر جرد / كشف حساب..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rewaq-gold focus:bg-white transition"
              />
            </div>

            {/* Action buttons */}
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
                className="px-5 py-2 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition cursor-pointer"
              >
                حفظ المطابقة
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
