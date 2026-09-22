"use client";

import React, { useState } from "react";
import {
  X,
  Scale,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Building,
} from "lucide-react";
import { usePurchasing } from "@/context/PurchasingContext";
import { PurchaseOrder } from "@/types/purchasing";
import { formatEGP } from "@/lib/accountingEngine";

interface CreateSupplierBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrder?: PurchaseOrder;
}

export default function CreateSupplierBillModal({
  isOpen,
  onClose,
  purchaseOrder,
}: CreateSupplierBillModalProps) {
  const { purchaseOrders, receivings, createSupplierInvoice } = usePurchasing();

  const [selectedPoId, setSelectedPoId] = useState(purchaseOrder?.id || purchaseOrders[0]?.id || "");
  const [supplierInvoiceRef, setSupplierInvoiceRef] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [matchWarnings, setMatchWarnings] = useState<string[]>([]);

  const activePO = purchaseOrders.find((p) => p.id === selectedPoId) || purchaseOrders[0];
  const activeRcv = receivings.find((r) => r.poId === activePO?.id);

  // Bill items state initialized from PO
  const [items, setItems] = useState<Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>>([]);

  React.useEffect(() => {
    if (activePO) {
      setItems(
        activePO.items.map((it) => ({
          productId: it.productId,
          productName: it.productName,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
        }))
      );
      // Auto-set due date based on payment terms
      const days = activePO.paymentTermsDays || 30;
      setDueDate(new Date(Date.now() + days * 86400000).toISOString().split("T")[0]);
    }
  }, [selectedPoId, activePO]);

  if (!isOpen) return null;

  const handleFieldChange = (idx: number, field: "quantity" | "unitPrice", value: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const subtotal = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
  const taxAmount = subtotal * 0.14;
  const totalAmount = subtotal + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePO || !supplierInvoiceRef.trim()) return;

    const formattedItems = items.map((it) => {
      const lineSub = it.quantity * it.unitPrice;
      const lineTax = lineSub * 0.14;
      return {
        productId: it.productId,
        productName: it.productName,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
        taxAmount: lineTax,
        total: lineSub + lineTax,
      };
    });

    const res = createSupplierInvoice({
      supplierInvoiceRef,
      poId: activePO.id,
      receivingId: activeRcv?.id,
      invoiceDate,
      dueDate,
      items: formattedItems,
      notes,
      user: "أحمد سمير (المدير العام)",
    });

    if (res.warnings.length > 0) {
      setMatchWarnings(res.warnings);
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rewaq-gold/20 border border-rewaq-gold/40 flex items-center justify-center text-rewaq-gold font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black">تسجيل فاتورة شراء مورد ومطابقة (3-Way Matching)</h2>
              <p className="text-[11px] text-slate-300">
                إثبات الفاتورة الضريبية وتوليد قيد اليومية وإثبات الاستحقاق للمورد تلقائياً
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {isSuccess && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-black">تم تسجيل فاتورة الشراء وترحيل القيد المحاسبي بنجاح!</p>
                <p className="text-[11px] text-emerald-700">
                  تم قيد: مدين المخزون (1040) + مدين ضريبة المدخلات 14% (1060) | دائن حسابات الموردين (2010).
                </p>
              </div>
            </div>
          )}

          {matchWarnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-300 text-amber-950 p-3.5 rounded-2xl space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>تنبيه المطابقة الثلاثية (Three-Way Match Alert):</span>
              </div>
              <ul className="list-disc pr-5 space-y-0.5 text-[11px] text-amber-800">
                {matchWarnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* PO & Reference Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                أمر الشراء المرتبط:
              </label>
              <select
                value={selectedPoId}
                onChange={(e) => setSelectedPoId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-rewaq-gold"
              >
                {purchaseOrders.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.poNumber} - {po.supplierName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                رقم فاتورة المورد (الورقية/الإلكترونية):
              </label>
              <input
                type="text"
                value={supplierInvoiceRef}
                onChange={(e) => setSupplierInvoiceRef(e.target.value)}
                placeholder="مثال: INV-DAM-8891"
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold font-mono focus:outline-none focus:border-rewaq-gold"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                تاريخ الفاتورة:
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                تاريخ الاستحقاق (Due Date):
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                required
              />
            </div>
          </div>

          {/* 3-Way Match Preview Pill */}
          {activePO && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-blue-900">
                <Scale className="w-4 h-4 text-blue-700" />
                <span className="font-bold">
                  المورد: {activePO.supplierName} (س.ت: {activePO.supplierTaxId})
                </span>
              </div>
              <span className="text-[11px] text-blue-700 font-mono">
                شروط السداد: {activePO.paymentTerms} ({activePO.paymentTermsDays} يوم)
              </span>
            </div>
          )}

          {/* Items Invoiced Table */}
          <div className="space-y-2">
            <span className="text-xs font-black text-slate-900">
              بنود وقيم الفاتورة (للمطابقة مع أمر الشراء والاستلام):
            </span>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">الصنف</th>
                    <th className="p-2.5 w-24 text-center">الكمية المفوترة</th>
                    <th className="p-2.5 w-32">سعر الوحدة (ج.م)</th>
                    <th className="p-2.5 w-32 font-bold">الإجمالي قبل الضريبة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => {
                    const rowSub = item.quantity * item.unitPrice;
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900">{item.productName}</td>
                        <td className="p-2.5 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleFieldChange(idx, "quantity", Number(e.target.value))}
                            className="w-20 bg-white border border-slate-300 rounded-lg p-1 text-center font-bold font-mono text-xs"
                            required
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => handleFieldChange(idx, "unitPrice", Number(e.target.value))}
                            className="w-28 bg-white border border-slate-300 rounded-lg p-1 font-bold font-mono text-xs"
                            required
                          />
                        </td>
                        <td className="p-2.5 font-mono font-bold text-slate-900">
                          {formatEGP(rowSub)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tax & Financial Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                ملاحظات المراجعة المحاسبية:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أية تسويات أو خصومات أو أرقام إشعارات مرتبطة..."
                className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rewaq-gold h-20"
              />
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>المبلغ الخاضع للضريبة:</span>
                <span className="font-mono font-bold">{formatEGP(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-400">
                <span>ضريبة القيمة المضافة (14% مدخلات):</span>
                <span className="font-mono font-bold">{formatEGP(taxAmount)}</span>
              </div>
              <div className="flex items-center justify-between font-black text-white border-t border-slate-800 pt-2 text-sm">
                <span>إجمالي الفاتورة المستحق للمورد:</span>
                <span className="font-mono text-rewaq-gold text-base">{formatEGP(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <FileCheck className="w-4 h-4" />
              ترحيل الفاتورة للقيد المحاسبي
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
