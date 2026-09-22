"use client";

import React, { useState } from "react";
import {
  ArrowRightLeft,
  X,
  CheckCircle2,
  Wallet,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { formatEGP } from "@/lib/accountingEngine";

interface TreasuryTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TreasuryTransferModal({
  isOpen,
  onClose,
}: TreasuryTransferModalProps) {
  const {
    treasuries,
    bankAccounts,
    createTreasuryTransfer,
    approveTreasuryTransfer,
    activeRole,
  } = useFinance();

  const [fromId, setFromId] = useState(treasuries[0]?.id || "tr-cairo");
  const [toId, setToId] = useState(treasuries[2]?.id || "tr-tanta");
  const [amount, setAmount] = useState<number>(25000);
  const [reference, setReference] = useState("تغذية عهدة تشغيلية");
  const [notes, setNotes] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const options = [
    ...treasuries.map((t) => ({ id: t.id, name: `${t.nameAr} (رصيد: ${formatEGP(t.currentBalance)})`, rawName: t.nameAr, type: "TREASURY" as const, balance: t.currentBalance })),
    ...bankAccounts.map((b) => ({ id: b.id, name: `${b.bankName} - ${b.accountNameAr} (رصيد: ${formatEGP(b.currentBalance)})`, rawName: b.accountNameAr, type: "BANK" as const, balance: b.currentBalance })),
  ];

  const selectedFrom = options.find((o) => o.id === fromId);
  const selectedTo = options.find((o) => o.id === toId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromId === toId) {
      setError("لا يمكن التحويل لنفس الحساب أو الخزينة!");
      return;
    }
    if (!selectedFrom || selectedFrom.balance < amount) {
      setError(`الرصيد المتاح في ${selectedFrom?.rawName} (${formatEGP(selectedFrom?.balance || 0)}) غير كافٍ لتحويل ${formatEGP(amount)}!`);
      return;
    }

    const transfer = createTreasuryTransfer({
      fromId,
      fromName: selectedFrom.rawName,
      fromType: selectedFrom.type,
      toId,
      toName: selectedTo?.rawName || "الخزينة",
      toType: selectedTo?.type || "TREASURY",
      amount,
      date: new Date().toISOString().split("T")[0],
      reference,
      requestedBy: "أمين الخزينة",
      notes,
    });

    // If manager or admin, auto approve
    if (activeRole === "FINANCE_MANAGER" || activeRole === "ADMIN") {
      approveTreasuryTransfer(transfer.id, "المدير المالي");
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/40 flex items-center justify-center font-bold">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black">تحويل مالي بين الخزائن والبنوك</h3>
              <p className="text-[10px] text-slate-300">نقل السيولة النقدية مع الترحيل والتوثيق المحاسبي الآمن</p>
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
            <h4 className="text-base font-black text-slate-900">تم تسجيل أمر التحويل بنجاح!</h4>
            <p className="text-xs text-slate-500">تم إنشاء القيد المحاسبي وتحديث أرصدة الخزائن والبنوك.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* From & To */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">التحويل من (المصدر):</label>
              <select
                value={fromId}
                onChange={(e) => {
                  setFromId(e.target.value);
                  setError(null);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-rewaq-gold cursor-pointer"
              >
                {options.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">التحويل إلى (الوجهة):</label>
              <select
                value={toId}
                onChange={(e) => {
                  setToId(e.target.value);
                  setError(null);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-rewaq-gold cursor-pointer"
              >
                {options.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount & Reference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المحول (ج.م):</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => {
                    setAmount(Number(e.target.value));
                    setError(null);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:border-rewaq-gold focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">السبب / المرجع:</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="تغذية عهدة / إيداع بنكي"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rewaq-gold focus:bg-white transition"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات التحويل:</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="رقم إيصال الإيداع أو إشعار التحويل..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rewaq-gold focus:bg-white transition"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
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
                className="px-5 py-2 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition cursor-pointer"
              >
                تنفيذ أمر التحويل
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
