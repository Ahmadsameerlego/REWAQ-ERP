"use client";

import React, { useState } from "react";
import {
  Receipt,
  X,
  CheckCircle2,
  DollarSign,
  Users2,
  Calendar,
  Wallet,
  Building2,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { formatEGP } from "@/lib/accountingEngine";

interface CreateReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillCustomerName?: string;
  prefillContractId?: string;
  prefillAmount?: number;
  prefillInstallmentId?: string;
}

export default function CreateReceiptModal({
  isOpen,
  onClose,
  prefillCustomerName = "",
  prefillContractId = "",
  prefillAmount = 0,
  prefillInstallmentId = "",
}: CreateReceiptModalProps) {
  const { treasuries, bankAccounts, createReceiptVoucher, createCustomerAdvance } = useFinance();

  const [receiptType, setReceiptType] = useState<"CONTRACT_DEPOSIT" | "INSTALLMENT_PAYMENT" | "DIRECT_COLLECTION">("CONTRACT_DEPOSIT");
  const [customerName, setCustomerName] = useState(prefillCustomerName || "د. هاني ممدوح عبد الوهاب");
  const [customerPhone, setCustomerPhone] = useState("01099887766");
  const [orderNumber, setOrderNumber] = useState(prefillContractId || "RWQ-2026-8801");
  const [amount, setAmount] = useState<number>(prefillAmount || 25000);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK_TRANSFER" | "CARD" | "VALU" | "INSTAPAY" | "CHEQUE">("CASH");
  const [destinationId, setDestinationId] = useState(treasuries[0]?.id || "tr-cairo");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const destinationOptions = [
    ...treasuries.map((t) => ({ id: t.id, name: `${t.nameAr} (رصيد: ${formatEGP(t.currentBalance)})`, type: "treasury" })),
    ...bankAccounts.map((b) => ({ id: b.id, name: `${b.bankName} - ${b.accountNameAr} (رصيد: ${formatEGP(b.currentBalance)})`, type: "bank" })),
  ];

  const selectedDestination = destinationOptions.find((d) => d.id === destinationId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || amount <= 0) return;

    if (receiptType === "CONTRACT_DEPOSIT") {
      // Customer advance/deposit logic
      createCustomerAdvance({
        customerId: `cust-${Date.now().toString().slice(-4)}`,
        customerName,
        customerPhone,
        contractId: orderNumber,
        orderNumber,
        amount,
        paymentMethod,
        treasuryOrBankId: destinationId,
        treasuryOrBankName: selectedDestination?.name.split("(")[0].trim() || "الخزينة",
        date: new Date().toISOString().split("T")[0],
        notes: notes || `عربون تعاقد أثاث #${orderNumber}`,
      });
    } else {
      createReceiptVoucher({
        date: new Date().toISOString().split("T")[0],
        customerId: `cust-${Date.now().toString().slice(-4)}`,
        customerName,
        customerPhone,
        contractId: orderNumber,
        orderNumber,
        amount,
        paymentMethod,
        treasuryOrBankId: destinationId,
        treasuryOrBankName: selectedDestination?.name.split("(")[0].trim() || "الخزينة",
        referenceNumber: referenceNumber || `REF-${Date.now().toString().slice(-5)}`,
        notes,
        receivedBy: "كاشير الصالة",
        type: receiptType,
        installmentId: prefillInstallmentId || undefined,
      });
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rewaq-gold text-slate-950 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black">إصدار سند قبض وتحصيل مالي</h3>
              <p className="text-[10px] text-slate-300">يولد قيداً محاسبياً متوازناً ويحدث رصيد الخزينة/البنك آلياً</p>
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
            <h4 className="text-base font-black text-slate-900">تم تسجيل سند القبض بنجاح!</h4>
            <p className="text-xs text-slate-500">تم إنشاء القيد المحاسبي وتحديث حركة الخزينة وتغذية حساب العميل.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Receipt Type selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع التحصيل المالي:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setReceiptType("CONTRACT_DEPOSIT")}
                  className={`p-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                    receiptType === "CONTRACT_DEPOSIT"
                      ? "bg-rewaq-gold/15 border-rewaq-gold text-rewaq-gold-dark shadow-2xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  عربون حجز / دفعة مقدمة
                  <span className="block text-[10px] font-normal text-slate-500">(التزام أمانات)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReceiptType("INSTALLMENT_PAYMENT")}
                  className={`p-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                    receiptType === "INSTALLMENT_PAYMENT"
                      ? "bg-rewaq-gold/15 border-rewaq-gold text-rewaq-gold-dark shadow-2xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  سداد قسط عقد
                  <span className="block text-[10px] font-normal text-slate-500">(تسوية مديونية)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReceiptType("DIRECT_COLLECTION")}
                  className={`p-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                    receiptType === "DIRECT_COLLECTION"
                      ? "bg-rewaq-gold/15 border-rewaq-gold text-rewaq-gold-dark shadow-2xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  تحصيل مباشر
                  <span className="block text-[10px] font-normal text-slate-500">(فاتورة فورية)</span>
                </button>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم العميل:</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="د. هاني ممدوح"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-rewaq-gold focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف / الواتساب:</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="010xxxxxxxx"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-rewaq-gold focus:bg-white transition"
                />
              </div>
            </div>

            {/* Contract & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم العقد / الفاتورة المرتبطة:</label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="RWQ-2026-8801"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-rewaq-gold focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المحصل (ج.م):</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-emerald-50/70 border border-emerald-300 text-emerald-900 rounded-xl px-3 py-2 text-sm font-black font-mono focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Payment Method & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">طريقة الدفع:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-rewaq-gold cursor-pointer"
                >
                  <option value="CASH">نقداً (Cash)</option>
                  <option value="INSTAPAY">انستاباي (InstaPay)</option>
                  <option value="CARD">فيزا / ماستركارد (POS)</option>
                  <option value="BANK_TRANSFER">تحويل بنكي مباشر</option>
                  <option value="VALU">فاليو / تقسيط (Valu)</option>
                  <option value="CHEQUE">شيك بنكي</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الخزينة أو الحساب البنكي المستلم:</label>
                <select
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-rewaq-gold cursor-pointer"
                >
                  {destinationOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reference & Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات / مرجع الإيصال:</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="تحصيل قسط / إيصال بنكي رقم ..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rewaq-gold focus:bg-white transition"
              />
            </div>

            {/* Summary Box */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
              <span className="text-slate-600 font-medium">الأثر المحاسبي التلقائي:</span>
              <span className="font-bold text-slate-900">
                من حـ/ {selectedDestination?.name.split("(")[0].trim()} إلى حـ/{" "}
                {receiptType === "CONTRACT_DEPOSIT" ? "أمانات وعرابين العملاء (2020)" : "مدينو العملاء (1030)"}
              </span>
            </div>

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
                className="px-5 py-2 text-xs font-black bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 rounded-xl shadow-xs transition cursor-pointer"
              >
                إصدار وترحيل السند
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
