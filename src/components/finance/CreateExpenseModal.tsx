"use client";

import React, { useState } from "react";
import {
  BadgePercent,
  X,
  CheckCircle2,
  Building2,
  Wallet,
  Receipt,
  Upload,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { formatEGP } from "@/lib/accountingEngine";

interface CreateExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateExpenseModal({
  isOpen,
  onClose,
}: CreateExpenseModalProps) {
  const {
    expenseCategories,
    treasuries,
    bankAccounts,
    costCenters,
    createExpense,
    activeRole,
  } = useFinance();

  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id || "cat-utilities");
  const [amount, setAmount] = useState<number>(5000);
  const [isVatApplicable, setIsVatApplicable] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK_TRANSFER" | "CARD" | "CHEQUE">("CASH");
  const [paidFromId, setPaidFromId] = useState(treasuries[0]?.id || "tr-cairo");
  const [branchId, setBranchId] = useState("branch-cairo");
  const [costCenterId, setCostCenterId] = useState(costCenters[0]?.id || "cc-cairo");
  const [vendorName, setVendorName] = useState("");
  const [vendorTaxId, setVendorTaxId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [description, setDescription] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const selectedCategory = expenseCategories.find((c) => c.id === categoryId);
  const selectedCostCenter = costCenters.find((cc) => cc.id === costCenterId);

  const destinationOptions = [
    ...treasuries.map((t) => ({ id: t.id, name: `${t.nameAr} (خزينة)`, type: "treasury" })),
    ...bankAccounts.map((b) => ({ id: b.id, name: `${b.bankName} - ${b.accountNameAr} (بنك)`, type: "bank" })),
  ];
  const selectedPaidFrom = destinationOptions.find((d) => d.id === paidFromId);

  const taxRate = isVatApplicable ? 0.14 : 0;
  const taxAmount = Math.round(amount * taxRate);
  const totalAmount = amount + taxAmount;

  // Check if this expense looks unusual (e.g. above 50,000 or high marketing)
  const isUnusual = amount > 40000;
  const unusualReason = isUnusual
    ? "مبلغ المصروف يتجاوز 40,000 ج.م ويصنف كعملية غير اعتيادية تتطلب مراجعة واعتماد إداري خاص"
    : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName || amount <= 0) return;

    createExpense({
      date: new Date().toISOString().split("T")[0],
      categoryId,
      categoryName: selectedCategory?.nameAr || "مصروف تشغيلي",
      accountCode: selectedCategory?.defaultAccountCode || "6060",
      amount,
      taxRate,
      taxAmount,
      totalAmount,
      paymentMethod,
      paidFromId,
      paidFromName: selectedPaidFrom?.name || "الخزينة",
      branchId,
      branchName: branchId === "branch-cairo" ? "فرع التجمع الرئيسي" : branchId === "branch-october" ? "فرع 6 أكتوبر" : "فرع طنطا",
      costCenterId,
      costCenterName: selectedCostCenter?.nameAr || "مركز التكلفة",
      vendorName,
      vendorTaxId,
      invoiceNumber,
      description,
      attachmentName: invoiceNumber ? `inv_${invoiceNumber}.pdf` : undefined,
      requestedBy: "مسؤول الفرع",
      isUnusual,
      unusualReason,
    });

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
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center font-bold">
              <BadgePercent className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black">تسجيل مصروف تشغيلي جديد</h3>
              <p className="text-[10px] text-slate-300">تخصيص مركز التكلفة، احتساب ضريبة المدخلات، ودورة الاعتماد</p>
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
            <h4 className="text-base font-black text-slate-900">تم تسجيل المصروف بنجاح!</h4>
            <p className="text-xs text-slate-500">تم إدراج المصروف في دورة التدقيق المحاسبي ومراكز التكلفة.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Category & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">بند / تصنيف المصروف:</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-rewaq-gold cursor-pointer"
                >
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ الأساسي (قبل الضريبة):</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-none focus:border-rewaq-gold focus:bg-white transition"
                />
              </div>
            </div>

            {/* Tax toggle & summary */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVatApplicable}
                  onChange={(e) => setIsVatApplicable(e.target.checked)}
                  className="rounded text-rewaq-gold focus:ring-rewaq-gold w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  خاضع لضريبة القيمة المضافة 14% (فاتورة ضريبية بمدخلات قابلة للخصم)
                </span>
              </label>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">إجمالي السداد شامل الضريبة:</span>
                <span className="text-xs font-black text-rose-600 font-mono">{formatEGP(totalAmount)}</span>
              </div>
            </div>

            {/* Vendor Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المورد / الجهة المستلمة:</label>
                <input
                  type="text"
                  required
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="مثال: شركة الكهرباء / مطبعة الأهرام"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rewaq-gold focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم الفاتورة الضريبية / الإيصال:</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="INV-99281"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-rewaq-gold focus:bg-white transition"
                />
              </div>
            </div>

            {/* Branch & Cost Center */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الفرع التابع:</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
                >
                  <option value="branch-cairo">فرع التجمع الخامس (الرئيسي)</option>
                  <option value="branch-october">فرع 6 أكتوبر (المول)</option>
                  <option value="branch-tanta">فرع طنطا (الدلتا)</option>
                  <option value="all-branches">الإدارة المركزية (موزع)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">مركز التكلفة (Cost Center):</label>
                <select
                  value={costCenterId}
                  onChange={(e) => setCostCenterId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
                >
                  {costCenters.map((cc) => (
                    <option key={cc.id} value={cc.id}>
                      {cc.code} - {cc.nameAr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Paid From & Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">طريقة السداد:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
                >
                  <option value="CASH">نقداً من الخزينة</option>
                  <option value="BANK_TRANSFER">تحويل بنكي</option>
                  <option value="CARD">بطاقة بنكية / POS</option>
                  <option value="CHEQUE">شيك آجل</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">مصدر الصرف (الخزينة / البنك):</label>
                <select
                  value={paidFromId}
                  onChange={(e) => setPaidFromId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
                >
                  {destinationOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">وصف وتفاصيل المصروف:</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أدخل بياناً واضحاً للغرض من الصرف..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-rewaq-gold focus:bg-white transition"
              />
            </div>

            {isUnusual && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black block">تنبيه تدقيق ذكي:</span>
                  <span>{unusualReason}</span>
                </div>
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
                className="px-5 py-2 text-xs font-black bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition cursor-pointer"
              >
                حفظ وإرسال للاعتماد
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
