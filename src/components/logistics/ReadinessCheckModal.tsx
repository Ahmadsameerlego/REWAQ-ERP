"use client";

import React from "react";
import {
  X,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Package,
  MapPin,
  Phone,
  FileCheck,
  Layers,
  ArrowRight,
} from "lucide-react";
import { DeliveryOrder } from "@/types/logistics";
import { useShowroom } from "@/context/ShowroomContext";

interface ReadinessCheckModalProps {
  delivery: DeliveryOrder | null;
  onClose: () => void;
  onMarkReadySuccess?: () => void;
}

export default function ReadinessCheckModal({
  delivery,
  onClose,
  onMarkReadySuccess,
}: ReadinessCheckModalProps) {
  if (!delivery) return null;

  const { products, stockLevels, checkDeliveryReadiness, markDeliveryReady } = useShowroom();
  const readiness = checkDeliveryReadiness(delivery.id);

  const handleConfirmReady = () => {
    const res = markDeliveryReady(delivery.id);
    if (res.success) {
      if (onMarkReadySuccess) onMarkReadySuccess();
      onClose();
    } else {
      alert(res.error || "تعذر اعتماد الجاهزية");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden text-right">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl border shadow-2xs ${
                readiness.isReady
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-rose-50 border-rose-200 text-rose-700"
              }`}
            >
              {readiness.isReady ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                فاحص جاهزية التسليم قبل التحميل (Delivery Readiness)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                إذن شحن #{delivery.deliveryNumber} | عقد: #{delivery.contractNumber}
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

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Main Status Banner */}
          <div
            className={`p-4 rounded-2xl border ${
              readiness.isReady
                ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                : "bg-rose-50/80 border-rose-200 text-rose-950"
            }`}
          >
            <div className="flex items-start gap-2.5">
              {readiness.isReady ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
              )}
              <div>
                <h3 className="text-xs font-black">
                  {readiness.isReady
                    ? "✓ إذن الشحن جاهز ومستوفٍ لكافة المعايير"
                    : "❌ Delivery cannot be prepared — يوجد نواقص أو تعارض بالمخزون"}
                </h3>
                <p className="text-[11px] mt-0.5 opacity-90">
                  {readiness.isReady
                    ? "جميع المنتجات موجودة بالمستودع والكميات صحيحة وليست محجوزة لعميل آخر، والعنوان وبيانات العميل معتمدة."
                    : "النظام يمنع تحويل الشحنة إلى (Ready) لتفادي اكتشاف المشكلة أثناء التحميل عند بوابة المستودع."}
                </p>
              </div>
            </div>
          </div>

          {/* Checklist 1: Products & Stock Levels */}
          <div className="space-y-2">
            <span className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
              <Package className="w-4 h-4 text-rewaq-gold" />
              1. فحص توفر الأصناف بالمستودع المخصص
            </span>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-slate-50/40 p-2">
              {delivery.items.map((item, idx) => {
                const prod = products.find((p) => p.id === item.productId || p.name.includes(item.productName) || item.productName.includes(p.name));
                const levels = stockLevels.filter((sl) => sl.productId === (prod?.id || item.productId));
                const totalAvailable = levels.reduce(
                  (sum, sl) => sum + Math.max(0, sl.onHand - sl.display - sl.damaged),
                  0
                );
                const hasSufficientStock = totalAvailable >= item.quantity || item.pickedQty >= item.quantity;

                return (
                  <div key={idx} className="p-2.5 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900 text-xs">{item.productName}</div>
                      <div className="text-[11px] text-slate-500">
                        الكمية المطلوبة: <span className="font-mono font-bold text-slate-800">{item.quantity}</span> |
                        المتاح فعلياً بالمستودع: <span className="font-mono font-bold text-slate-800">{totalAvailable}</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {hasSufficientStock ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>متوفر بالمخزن</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100 px-2 py-1 rounded-lg border border-rose-200">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>عجز في المخزون ⚠️</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Checklist 2: Customer & Address Check */}
          <div className="space-y-2">
            <span className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
              <MapPin className="w-4 h-4 text-rewaq-gold" />
              2. فحص بيانات الاتصال والعنوان
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  readiness.isCustomerValid
                    ? "bg-emerald-50/50 border-emerald-200 text-emerald-950"
                    : "bg-rose-50/50 border-rose-200 text-rose-950"
                }`}
              >
                <div>
                  <span className="font-bold block">هاتف العميل</span>
                  <span className="font-mono text-[10px] opacity-80">{delivery.customerPhone || "غير مسجل"}</span>
                </div>
                {readiness.isCustomerValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  readiness.isAddressValid
                    ? "bg-emerald-50/50 border-emerald-200 text-emerald-950"
                    : "bg-rose-50/50 border-rose-200 text-rose-950"
                }`}
              >
                <div className="truncate pr-1">
                  <span className="font-bold block">عنوان التسليم</span>
                  <span className="truncate block text-[10px] opacity-80">{delivery.deliveryAddress || "غير محدد"}</span>
                </div>
                {readiness.isAddressValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2 rounded-xl transition cursor-pointer"
          >
            إغلاق
          </button>

          {readiness.isReady ? (
            <button
              type="button"
              onClick={handleConfirmReady}
              className="inline-flex items-center gap-1.5 text-xs font-black text-slate-950 bg-rewaq-gold hover:bg-rewaq-gold-dark px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>اعتماد الجاهزية (Mark as Ready)</span>
            </button>
          ) : (
            <div className="text-[11px] font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
              يرجى معالجة النواقص أو إنشاء تسليم جزئي للقطع المتوفرة
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
