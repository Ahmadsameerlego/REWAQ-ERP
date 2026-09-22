"use client";

import React from "react";
import {
  X,
  Scale,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ArrowDownLeft,
  Receipt,
  Info,
} from "lucide-react";
import { usePurchasing } from "@/context/PurchasingContext";
import { PurchaseOrder } from "@/types/purchasing";
import { formatEGP } from "@/lib/accountingEngine";

interface ThreeWayMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrder: PurchaseOrder;
}

export default function ThreeWayMatchModal({
  isOpen,
  onClose,
  purchaseOrder,
}: ThreeWayMatchModalProps) {
  const { receivings, supplierInvoices } = usePurchasing();

  if (!isOpen) return null;

  const rcv = receivings.find((r) => r.poId === purchaseOrder.id || purchaseOrder.receivingIds.includes(r.id));
  const inv = supplierInvoices.find((i) => i.poId === purchaseOrder.id || purchaseOrder.invoiceIds.includes(i.id));

  // Compute 3-way status
  const orderedQty = purchaseOrder.items.reduce((s, it) => s + it.quantity, 0);
  const receivedQty = rcv ? rcv.totalReceivedQty : purchaseOrder.items.reduce((s, it) => s + it.receivedQuantity, 0);
  const invoicedQty = inv ? inv.items.reduce((s, it) => s + it.quantity, 0) : orderedQty;

  const orderedTotal = purchaseOrder.grandTotal;
  const receivedValue = rcv ? (rcv.totalGoodQty * (purchaseOrder.items[0]?.unitPrice || 0) * 1.14) : orderedTotal;
  const invoicedTotal = inv ? inv.totalAmount : orderedTotal;

  const hasQtyMismatch = invoicedQty !== receivedQty;
  const hasPriceMismatch = Math.abs(invoicedTotal - orderedTotal) > 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rewaq-gold/20 border border-rewaq-gold/40 flex items-center justify-center text-rewaq-gold font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black">
                المطابقة الثلاثية (Three-Way Matching) لأمر #{purchaseOrder.poNumber}
              </h2>
              <p className="text-[11px] text-slate-300">
                المقارنة التلقائية بين: أمر الشراء (Ordered) ↔ محضر الاستلام بالمستودع (Received) ↔ فاتورة المورد (Invoiced)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Alert Banner */}
          {hasQtyMismatch || hasPriceMismatch ? (
            <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-black text-amber-900">
                  ⚠️ تنبيه عدم تطابق في المطابقة الثلاثية (Discrepancy Detected)
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  {hasQtyMismatch && `• فرق في الكمية: الفاتورة تطالب بـ (${invoicedQty}) وحدة بينما المستلم الفعلي بالمستودع (${receivedQty}) وحدة.`}
                  {hasPriceMismatch && ` • فرق في القيمة الإجمالية بين أمر الشراء وفاتورة المورد.`}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-black text-emerald-900">
                  ✅ تطابق تام 100% بين أمر الشراء وإذن الاستلام وفاتورة المورد
                </p>
                <p className="text-[11px] text-emerald-700">
                  الكميات المستلمة مطابقة تماماً للمفوترة والأسعار متوافقة مع شروط التعاقد.
                </p>
              </div>
            </div>
          )}

          {/* 3 Pillars Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Purchase Order */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  <span>1. أمر الشراء (PO)</span>
                </div>
                <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                  {purchaseOrder.poNumber}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>الكمية المطلوبة:</span>
                  <strong className="font-mono text-slate-900">{orderedQty} وحدة</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>تاريخ الأمر:</span>
                  <span className="font-mono">{purchaseOrder.orderDate}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>شروط السداد:</span>
                  <span>{purchaseOrder.paymentTerms}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-2">
                  <span>القيمة الإجمالية:</span>
                  <span className="font-mono text-blue-700">{formatEGP(orderedTotal)}</span>
                </div>
              </div>
            </div>

            {/* 2. Goods Receiving */}
            <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
                  <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                  <span>2. محضر الاستلام (Receipt)</span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  {rcv?.receivingNumber || "قيد الاستلام"}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>الكمية المستلمة فعلياً:</span>
                  <strong className="font-mono text-emerald-900 font-bold">{receivedQty} وحدة</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>سليم بالمستودع:</span>
                  <span className="font-mono text-emerald-700">{rcv ? rcv.totalGoodQty : receivedQty} وحدة</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>تالف / مرفوض:</span>
                  <span className="font-mono text-rose-600 font-bold">{rcv ? rcv.totalDamagedQty : 0} وحدة</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold border-t border-emerald-200 pt-2">
                  <span>قيمة البضاعة المستلمة:</span>
                  <span className="font-mono text-emerald-700">{formatEGP(receivedValue)}</span>
                </div>
              </div>
            </div>

            {/* 3. Supplier Invoice */}
            <div className="bg-purple-50/40 p-4 rounded-2xl border border-purple-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-purple-200">
                <div className="flex items-center gap-1.5 font-bold text-xs text-purple-900">
                  <Receipt className="w-4 h-4 text-purple-600" />
                  <span>3. فاتورة المورد (Invoice)</span>
                </div>
                <span className="text-[10px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">
                  {inv?.supplierInvoiceRef || "بانتظار الفاتورة"}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>الكمية المفوترة:</span>
                  <strong className="font-mono text-purple-900 font-bold">{invoicedQty} وحدة</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>تاريخ الفاتورة:</span>
                  <span className="font-mono">{inv?.invoiceDate || "-"}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>تاريخ الاستحقاق:</span>
                  <span className="font-mono">{inv?.dueDate || "-"}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold border-t border-purple-200 pt-2">
                  <span>إجمالي المطالبة:</span>
                  <span className="font-mono text-purple-700">{formatEGP(invoicedTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line by Line Breakdown */}
          <div className="space-y-2">
            <span className="text-xs font-black text-slate-900">
              مقارنة بنود الأصناف التفصيلية:
            </span>

            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-right">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">الصنف</th>
                    <th className="p-3 text-center">أمر الشراء (PO)</th>
                    <th className="p-3 text-center">المستلم بالمستودع</th>
                    <th className="p-3 text-center">فاتورة المورد</th>
                    <th className="p-3 text-center">حالة المطابقة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchaseOrder.items.map((item, idx) => {
                    const rcvItem = rcv?.items.find((r) => r.productId === item.productId);
                    const invItem = inv?.items.find((i) => i.productId === item.productId);

                    const rcvQty = rcvItem ? rcvItem.receivedQty : item.receivedQuantity;
                    const invQty = invItem ? invItem.quantity : item.quantity;
                    const isMatched = rcvQty === invQty;

                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{item.productName}</td>
                        <td className="p-3 text-center font-mono">{item.quantity} وحدة</td>
                        <td className="p-3 text-center font-mono font-bold text-emerald-700">
                          {rcvQty} وحدة
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-purple-700">
                          {invQty} وحدة
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                              isMatched
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-900 border border-amber-300"
                            }`}
                          >
                            {isMatched ? "مطابق تماماً" : "⚠️ يوجد عجز / عدم تطابق"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-rewaq-gold shrink-0" />
            النظام لا يمنع سداد الفاتورة تلقائياً، بل ينبه الإدارة والمحاسب لتسوية الفروق عبر إشعار مدين أو خصم.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            إغلاق المراجعة
          </button>
        </div>
      </div>
    </div>
  );
}
