"use client";

import React, { useState } from "react";
import {
  X,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Package,
} from "lucide-react";
import { usePurchasing } from "@/context/PurchasingContext";
import { PurchaseOrder, PurchaseReturn } from "@/types/purchasing";
import { formatEGP } from "@/lib/accountingEngine";

interface CreateReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrder?: PurchaseOrder;
}

export default function CreateReturnModal({
  isOpen,
  onClose,
  purchaseOrder,
}: CreateReturnModalProps) {
  const { purchaseOrders, receivings, createPurchaseReturn } = usePurchasing();

  const [selectedPoId, setSelectedPoId] = useState(purchaseOrder?.id || purchaseOrders[0]?.id || "");
  const [reason, setReason] = useState<PurchaseReturn["reason"]>("DEFECTIVE_DAMAGED");
  const [notes, setNotes] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const activePO = purchaseOrders.find((p) => p.id === selectedPoId) || purchaseOrders[0];
  const activeRcv = receivings.find((r) => r.poId === activePO?.id);

  const [returnItems, setReturnItems] = useState<Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    defectReason: string;
  }>>([]);

  React.useEffect(() => {
    if (activePO) {
      setReturnItems(
        activePO.items.map((it) => ({
          productId: it.productId,
          productName: it.productName,
          quantity: it.damagedQuantity > 0 ? it.damagedQuantity : 1,
          unitPrice: it.unitPrice,
          defectReason: "تلف/خدش في الدهان أو عدم مطابقة لعينة التعاقد",
        }))
      );
    }
  }, [selectedPoId, activePO]);

  if (!isOpen) return null;

  const handleFieldChange = (idx: number, field: string, value: any) => {
    setReturnItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const subtotal = returnItems.reduce((sum, it) => sum + (Number(it.quantity) || 0) * it.unitPrice, 0);
  const taxAmount = subtotal * 0.14;
  const totalRefund = subtotal + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePO || returnItems.length === 0 || subtotal <= 0) return;

    const formattedItems = returnItems
      .filter((it) => it.quantity > 0)
      .map((it) => {
        const lineSub = it.quantity * it.unitPrice;
        const lineTax = lineSub * 0.14;
        return {
          productId: it.productId,
          productName: it.productName,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
          taxAmount: lineTax,
          total: lineSub + lineTax,
          defectReason: it.defectReason,
        };
      });

    createPurchaseReturn({
      supplierId: activePO.supplierId,
      poId: activePO.id,
      receivingId: activeRcv?.id,
      reason,
      items: formattedItems,
      notes,
      user: "كريم يونس (مسؤول المستودع)",
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-rose-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400 font-bold">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black">إصدار إذن مرتجع مشتريات (Purchase Return)</h2>
              <p className="text-[11px] text-rose-200">
                إرجاع بضاعة تالفة أو غير مطابقة وتوليد إشعار مدين (Debit Note) لتخفيض مديونية المورد
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-rose-300 hover:text-white p-1 rounded-lg transition"
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
                <p className="text-xs font-black">تم إصدار إذن المرتجع والإشعار المدين بنجاح!</p>
                <p className="text-[11px] text-emerald-700">
                  تم خصم الكميات المرتجعة من المخزون وتوليد قيد تخفيض حساب المورد (دائنون).
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                أمر الشراء والتوريد الأصلي:
              </label>
              <select
                value={selectedPoId}
                onChange={(e) => setSelectedPoId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-rewaq-gold"
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
                سبب الإرجاع:
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-rewaq-gold"
              >
                <option value="DEFECTIVE_DAMAGED">تلف أو عيوب تصنيع / كسر</option>
                <option value="WRONG_SPECIFICATION">مخالفة المواصفات أو درجات الألوان</option>
                <option value="EXCESS_DELIVERY">كميات زائدة عن أمر التوريد</option>
                <option value="PRICE_DISPUTE">خلاف سعري مع المورد</option>
                <option value="LATE_DELIVERY">تأخير أدى لإلغاء طلب العميل</option>
              </select>
            </div>
          </div>

          {/* Return Items Table */}
          <div className="space-y-2">
            <span className="text-xs font-black text-slate-900">
              الأصناف والكميات المراد إرجاعها للمورد:
            </span>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">الصنف</th>
                    <th className="p-2.5 w-24 text-center">الكمية المرتجعة</th>
                    <th className="p-2.5 w-28">سعر الوحدة</th>
                    <th className="p-2.5">سبب العيب / الملاحظة</th>
                    <th className="p-2.5 w-28 font-bold">القيمة المستردة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {returnItems.map((item, idx) => {
                    const rowSub = (Number(item.quantity) || 0) * item.unitPrice;
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900">{item.productName}</td>
                        <td className="p-2.5 text-center">
                          <input
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => handleFieldChange(idx, "quantity", Number(e.target.value))}
                            className="w-16 bg-white border border-rose-300 rounded-lg p-1 text-center font-bold text-xs text-rose-950"
                          />
                        </td>
                        <td className="p-2.5 font-mono">{formatEGP(item.unitPrice)}</td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={item.defectReason}
                            onChange={(e) => handleFieldChange(idx, "defectReason", e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="p-2.5 font-mono font-bold text-rose-700">
                          {formatEGP(rowSub)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Refund Value & Accounting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                ملاحظات الشحن وموافقة المندوب:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="تم التسليم لمندوب المصنع أثناء التفريغ مع توقيع إشعار الاستلام..."
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rewaq-gold h-20"
              />
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>قيمة البضاعة المرتجعة:</span>
                <span className="font-mono font-bold">{formatEGP(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-rose-400">
                <span>عكس ضريبة القيمة المضافة 14%:</span>
                <span className="font-mono font-bold">-{formatEGP(taxAmount)}</span>
              </div>
              <div className="flex items-center justify-between font-black text-white border-t border-slate-800 pt-2 text-sm">
                <span>إجمالي الإشعار المدين المخصوم:</span>
                <span className="font-mono text-rose-400 text-base">-{formatEGP(totalRefund)}</span>
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
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md transition cursor-pointer"
            >
              تأكيد المرتجع وإصدار الإشعار المدين
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
