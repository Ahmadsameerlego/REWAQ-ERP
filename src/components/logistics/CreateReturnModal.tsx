"use client";

import React, { useState } from "react";
import {
  X,
  RotateCcw,
  Package,
  Warehouse,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { DeliveryOrder, DeliveryReturn } from "@/types/logistics";
import { useShowroom } from "@/context/ShowroomContext";

interface CreateReturnModalProps {
  delivery: DeliveryOrder | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateReturnModal({
  delivery,
  onClose,
  onSuccess,
}: CreateReturnModalProps) {
  if (!delivery) return null;

  const { warehouses, addDeliveryReturn } = useShowroom();

  const [selectedProductId, setSelectedProductId] = useState<string>(
    delivery.items[0]?.productId || ""
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>("");
  const [condition, setCondition] = useState<DeliveryReturn["condition"]>("MINOR_DAMAGE");
  const [returnedToWarehouse, setReturnedToWarehouse] = useState<string>(
    delivery.warehouse || warehouses[0]?.name || "مخزن التجمع الخلفي"
  );
  const [inventoryAction, setInventoryAction] = useState<DeliveryReturn["inventoryAction"]>("WORKSHOP");

  const selectedItem = delivery.items.find((it) => it.productId === selectedProductId) || delivery.items[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !selectedItem) return;

    addDeliveryReturn({
      deliveryId: delivery.id,
      deliveryNumber: delivery.deliveryNumber,
      contractNumber: delivery.contractNumber,
      customerName: delivery.customerName,
      productId: selectedItem.productId,
      productName: selectedItem.productName,
      quantity: Number(quantity) || 1,
      reason,
      condition,
      returnedToWarehouse,
      inventoryAction,
    });

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden text-right">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-purple-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-100 text-purple-900 border border-purple-300 rounded-xl shadow-2xs">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                طلب إرجاع صنف بعد التسليم (Delivery Return)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                شحنة #{delivery.deliveryNumber} | العميل: {delivery.customerName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">الصنف المرتجع:</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-purple-500 focus:bg-white"
            >
              {delivery.items.map((it) => (
                <option key={it.productId} value={it.productId}>
                  {it.productName} (الكمية المسلمة: {it.quantity})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">الكمية المرتجعة:</label>
              <input
                type="number"
                min={1}
                max={selectedItem?.quantity || 1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">حالة القطعة المرتجعة:</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as DeliveryReturn["condition"])}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-purple-500 focus:bg-white"
              >
                <option value="PERFECT">سليمة 100% (تراجع العميل)</option>
                <option value="MINOR_DAMAGE">تلف/خدش بسيط يحتاج صيانة</option>
                <option value="HEAVILY_DAMAGED">تلف جسيم / كسر كامل</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">إرجاع إلى مستودع:</label>
              <select
                value={returnedToWarehouse}
                onChange={(e) => setReturnedToWarehouse(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-purple-500 focus:bg-white"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.name}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">التوجيه المخزني:</label>
              <select
                value={inventoryAction}
                onChange={(e) => setInventoryAction(e.target.value as DeliveryReturn["inventoryAction"])}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-purple-500 focus:bg-white"
              >
                <option value="AVAILABLE">إتاحة فورية بالمخزن للبيع</option>
                <option value="WORKSHOP">تحويل لورشة الصيانة والتجهيز</option>
                <option value="DAMAGED">تصنيف كتالف / شطب</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">سبب الإرجاع بالتفصيل:</label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="اكتب سبب رغبة العميل في الإرجاع أو تقرير الفحص..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-purple-500 focus:bg-white"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2 rounded-xl transition cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-xs font-black text-white bg-purple-700 hover:bg-purple-800 px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تسجيل طلب الإرجاع المخزني</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
