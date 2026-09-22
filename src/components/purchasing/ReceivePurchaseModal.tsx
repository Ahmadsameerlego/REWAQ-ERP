"use client";

import React, { useState } from "react";
import {
  X,
  ArrowDownLeft,
  CheckCircle2,
  AlertTriangle,
  Package,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { usePurchasing } from "@/context/PurchasingContext";
import { PurchaseOrder, ReceivingItemQuality } from "@/types/purchasing";

interface ReceivePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrder: PurchaseOrder;
}

export default function ReceivePurchaseModal({
  isOpen,
  onClose,
  purchaseOrder,
}: ReceivePurchaseModalProps) {
  const { receiveGoods } = usePurchasing();

  const [deliveryNoteNumber, setDeliveryNoteNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [receiverName, setReceiverName] = useState("كريم يونس (أمين المستودع)");
  const [notes, setNotes] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Quality and Receiving breakdown per item
  const [itemsQuality, setItemsQuality] = useState<ReceivingItemQuality[]>(
    purchaseOrder.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      orderedQty: item.quantity,
      expectedQty: item.remainingQuantity > 0 ? item.remainingQuantity : item.quantity,
      receivedQty: item.remainingQuantity > 0 ? item.remainingQuantity : item.quantity,
      goodQty: item.remainingQuantity > 0 ? item.remainingQuantity : item.quantity,
      damagedQty: 0,
      defectReason: "",
      actionOnDamaged: "RETURN_TO_SUPPLIER",
      warehouseLocationCode: "WH-A01",
    }))
  );

  if (!isOpen) return null;

  const handleQtyChange = (
    index: number,
    field: "receivedQty" | "goodQty" | "damagedQty",
    value: number
  ) => {
    setItemsQuality((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          const updated = { ...item, [field]: value };
          if (field === "receivedQty") {
            updated.goodQty = value;
            updated.damagedQty = 0;
          } else if (field === "damagedQty") {
            updated.goodQty = Math.max(0, updated.receivedQty - value);
          } else if (field === "goodQty") {
            updated.damagedQty = Math.max(0, updated.receivedQty - value);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleFieldChange = (index: number, field: string, value: any) => {
    setItemsQuality((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const totalReceived = itemsQuality.reduce((sum, it) => sum + it.receivedQty, 0);
  const totalGood = itemsQuality.reduce((sum, it) => sum + it.goodQty, 0);
  const totalDamaged = itemsQuality.reduce((sum, it) => sum + it.damagedQty, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalReceived <= 0) return;

    receiveGoods({
      poId: purchaseOrder.id,
      deliveryNoteNumber,
      driverName,
      receiverName,
      items: itemsQuality,
      notes,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-bold">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black">
                استلام وفحص جودة شحنة التوريد لأمر #{purchaseOrder.poNumber}
              </h2>
              <p className="text-[11px] text-emerald-200">
                المورد: {purchaseOrder.supplierName} | المستودع المستهدف: {purchaseOrder.warehouseName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {isSuccess && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-black">تم تسجيل الاستلام وتحديث رصيد المخزون الفعلي بنجاح!</p>
                <p className="text-[11px] text-emerald-700">
                  تم إضافة الكميات السليمة إلى المستودع تلقائياً وتحديث حالة أمر الشراء.
                </p>
              </div>
            </div>
          )}

          {/* Delivery Note & Logistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                رقم إذن تسليم / بوليصة شحن المورد:
              </label>
              <input
                type="text"
                value={deliveryNoteNumber}
                onChange={(e) => setDeliveryNoteNumber(e.target.value)}
                placeholder="مثال: DN-DAM-9942"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-rewaq-gold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                اسم السائق ورقم السيارة:
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="مثال: عم صبحي (نقل د ب أ 124)"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-rewaq-gold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                مسؤول الفحص والاستلام:
              </label>
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-rewaq-gold"
                required
              />
            </div>
          </div>

          {/* Items Quality Breakdown */}
          <div className="space-y-3">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              مطابقة الكميات وفحص الجودة (سليم / تالف):
            </span>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">الصنف / الموديل</th>
                    <th className="p-3 w-20 text-center">المطلوب</th>
                    <th className="p-3 w-24 text-center">المستلم الفعلي</th>
                    <th className="p-3 w-24 text-center text-emerald-700">سليم ومقبول</th>
                    <th className="p-3 w-24 text-center text-rose-700">تالف / مرفوض</th>
                    <th className="p-3 w-28">كود الرف / الموقع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {itemsQuality.map((it, idx) => (
                    <React.Fragment key={idx}>
                      <tr className="hover:bg-slate-50 transition">
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{it.productName}</p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            المتبقي سابقاً: {it.expectedQty}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-slate-700">
                          {it.orderedQty}
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="0"
                            value={it.receivedQty}
                            onChange={(e) => handleQtyChange(idx, "receivedQty", Number(e.target.value))}
                            className="w-20 bg-white border border-slate-300 rounded-lg p-1 text-center font-bold text-xs"
                            required
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max={it.receivedQty}
                            value={it.goodQty}
                            onChange={(e) => handleQtyChange(idx, "goodQty", Number(e.target.value))}
                            className="w-20 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg p-1 text-center font-black text-xs"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max={it.receivedQty}
                            value={it.damagedQty}
                            onChange={(e) => handleQtyChange(idx, "damagedQty", Number(e.target.value))}
                            className={`w-20 rounded-lg p-1 text-center font-black text-xs ${
                              it.damagedQty > 0
                                ? "bg-rose-100 border border-rose-400 text-rose-900"
                                : "bg-slate-50 border border-slate-200 text-slate-400"
                            }`}
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={it.warehouseLocationCode}
                            onChange={(e) => handleFieldChange(idx, "warehouseLocationCode", e.target.value)}
                            placeholder="مثال: WH-A12"
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
                          />
                        </td>
                      </tr>

                      {/* Discrepancy / Damaged Action sub-row */}
                      {it.damagedQty > 0 && (
                        <tr className="bg-rose-50/60 border-t border-rose-100">
                          <td colSpan={6} className="p-3 space-y-2">
                            <div className="flex items-center gap-2 text-rose-800 font-bold text-[11px]">
                              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                              <span>يوجد {it.damagedQty} وحدة تالفة أو غير مطابقة للمواصفات:</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={it.defectReason || ""}
                                onChange={(e) => handleFieldChange(idx, "defectReason", e.target.value)}
                                placeholder="سبب العيب أو التلف (مثال: كسر بالزجاج / خدش بالقوائم الخشبية)..."
                                className="bg-white border border-rose-300 rounded-xl px-3 py-1.5 text-xs text-rose-950"
                                required
                              />
                              <select
                                value={it.actionOnDamaged || "RETURN_TO_SUPPLIER"}
                                onChange={(e) => handleFieldChange(idx, "actionOnDamaged", e.target.value)}
                                className="bg-white border border-rose-300 rounded-xl px-3 py-1.5 text-xs font-bold text-rose-950"
                              >
                                <option value="RETURN_TO_SUPPLIER">إعادة فورية للمورد (مرتجع مشتريات)</option>
                                <option value="ACCEPT_WITH_DISCOUNT">قبول مع خصم سعري من الفاتورة</option>
                                <option value="HOLD_FOR_INSPECTION">حجز في منطقة الفحص الفني</option>
                                <option value="SUPPLIER_REPLACE">استبدال من المورد في الشحنة القادمة</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Banner */}
          <div className="grid grid-cols-3 gap-3 bg-slate-900 text-white p-4 rounded-2xl text-center">
            <div className="border-l border-slate-800">
              <span className="text-[10px] text-slate-400 block">إجمالي المستلم</span>
              <span className="text-base font-black font-mono">{totalReceived} وحدة</span>
            </div>
            <div className="border-l border-slate-800">
              <span className="text-[10px] text-emerald-400 block">إجمالي السليم (يضاف للمخزون)</span>
              <span className="text-base font-black font-mono text-emerald-400">+{totalGood} وحدة</span>
            </div>
            <div>
              <span className="text-[10px] text-rose-400 block">إجمالي التالف / المرفوض</span>
              <span className="text-base font-black font-mono text-rose-400">{totalDamaged} وحدة</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              ملاحظات محضر الاستلام:
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات تخص حالة الشاحنة، التغليف، أو أوقات التفريغ..."
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rewaq-gold h-16"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition cursor-pointer"
            >
              تأكيد الاستلام وتحديث المخزون
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
