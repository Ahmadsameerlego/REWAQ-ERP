"use client";

import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  RotateCcw,
  Warehouse,
  CheckCircle2,
  FileWarning,
} from "lucide-react";
import { DeliveryOrder } from "@/types/logistics";
import { useShowroom } from "@/context/ShowroomContext";

interface FailedDeliveryModalProps {
  delivery: DeliveryOrder | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function FailedDeliveryModal({
  delivery,
  onClose,
  onSuccess,
}: FailedDeliveryModalProps) {
  if (!delivery) return null;

  const { failDelivery } = useShowroom();

  const [reason, setReason] = useState<DeliveryOrder["failureReason"]>("CUSTOMER_UNAVAILABLE");
  const [action, setAction] = useState<"RESCHEDULE" | "RETURN_WAREHOUSE">("RESCHEDULE");
  const [notes, setNotes] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;

    failDelivery(delivery.id, reason, action, notes || "تعذر التسليم وتسجيل الإجراء المطلوب");
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden text-right">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-100 text-rose-800 border border-rose-300 rounded-xl shadow-2xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                تسجيل تعذر التسليم (Failed Delivery)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                إذن شحن #{delivery.deliveryNumber} | العميل: {delivery.customerName}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">سبب تعذر التسليم:</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as DeliveryOrder["failureReason"])}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-rose-500 focus:bg-white"
            >
              <option value="CUSTOMER_UNAVAILABLE">العميل غير متواجد / مغلق الهاتف (Customer Unavailable)</option>
              <option value="CUSTOMER_RESCHEDULE_REQUEST">طلب العميل تأجيل الاستلام (Customer Requested Reschedule)</option>
              <option value="WRONG_ADDRESS">العنوان غير دقيق أو تعذر الوصول (Wrong Address)</option>
              <option value="PRODUCT_ISSUE">ملاحظة بالمنتج رفضها العميل (Product Issue)</option>
              <option value="VEHICLE_ISSUE">عطل بسيارة التوصيل (Vehicle Issue)</option>
              <option value="OTHER">أسباب تشغيلية أخرى (Other)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 block">الإجراء المطلوب تنفيذه:</label>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition text-center ${
                  action === "RESCHEDULE"
                    ? "bg-purple-50 border-purple-300 text-purple-900 font-black shadow-2xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <input
                  type="radio"
                  name="actionType"
                  value="RESCHEDULE"
                  checked={action === "RESCHEDULE"}
                  onChange={() => setAction("RESCHEDULE")}
                  className="hidden"
                />
                <RotateCcw className="w-4 h-4 text-purple-700" />
                <span className="text-[11px]">إعادة الجدولة لموعد لاحق</span>
              </label>

              <label
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition text-center ${
                  action === "RETURN_WAREHOUSE"
                    ? "bg-amber-50 border-amber-300 text-amber-900 font-black shadow-2xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <input
                  type="radio"
                  name="actionType"
                  value="RETURN_WAREHOUSE"
                  checked={action === "RETURN_WAREHOUSE"}
                  onChange={() => setAction("RETURN_WAREHOUSE")}
                  className="hidden"
                />
                <Warehouse className="w-4 h-4 text-amber-700" />
                <span className="text-[11px]">إرجاع البضاعة للمستودع</span>
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">تفاصيل وملاحظات السائق:</label>
            <textarea
              rows={3}
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب بالتفصيل ما حدث مع العميل أو سبب تعذر الوصول..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-rose-500 focus:bg-white"
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
              className="inline-flex items-center gap-1.5 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
            >
              <FileWarning className="w-4 h-4" />
              <span>تسجيل تعثر الشحنة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
