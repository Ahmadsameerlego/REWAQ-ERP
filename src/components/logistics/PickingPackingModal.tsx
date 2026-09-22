"use client";

import React, { useState } from "react";
import {
  X,
  Package,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  CheckCheck,
  RotateCcw,
} from "lucide-react";
import { DeliveryOrder } from "@/types/logistics";
import { useShowroom } from "@/context/ShowroomContext";

interface PickingPackingModalProps {
  delivery: DeliveryOrder | null;
  onClose: () => void;
  onPickingCompleted?: () => void;
}

export default function PickingPackingModal({
  delivery,
  onClose,
  onPickingCompleted,
}: PickingPackingModalProps) {
  if (!delivery) return null;

  const { updatePickingStatus, markDeliveryReady } = useShowroom();
  const [localPickedState, setLocalPickedState] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    delivery.items.forEach((it) => {
      map[it.productId] = it.pickedQty;
    });
    return map;
  });

  const handleSetPicked = (productId: string, qty: number, maxQty: number) => {
    const validQty = Math.max(0, Math.min(maxQty, qty));
    setLocalPickedState((prev) => ({ ...prev, [productId]: validQty }));
    updatePickingStatus(delivery.id, productId, validQty);
  };

  const handlePickAll = () => {
    delivery.items.forEach((it) => {
      setLocalPickedState((prev) => ({ ...prev, [it.productId]: it.quantity }));
      updatePickingStatus(delivery.id, it.productId, it.quantity);
    });
  };

  const handleResetAll = () => {
    delivery.items.forEach((it) => {
      setLocalPickedState((prev) => ({ ...prev, [it.productId]: 0 }));
      updatePickingStatus(delivery.id, it.productId, 0);
    });
  };

  const totalRequired = delivery.items.reduce((s, it) => s + it.quantity, 0);
  const totalPicked = delivery.items.reduce((s, it) => s + (localPickedState[it.productId] ?? it.pickedQty), 0);
  const allComplete = totalPicked >= totalRequired;

  const handleFinish = () => {
    if (allComplete) {
      markDeliveryReady(delivery.id);
    }
    if (onPickingCompleted) onPickingCompleted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden text-right">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <Package className="w-5 h-5 text-rewaq-gold" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                تجهيز وتجميع الشحنة بالمستودع (Picking & Packing)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                إذن #{delivery.deliveryNumber} | العميل: {delivery.customerName}
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

        {/* Picking Body */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Progress Bar Header */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between font-bold">
              <span className="text-slate-700">نسبة اكتمال التجهيز:</span>
              <span className="font-mono text-sm font-black text-slate-900">
                {totalPicked} / {totalRequired} قطعة ({Math.round((totalPicked / (totalRequired || 1)) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  allComplete ? "bg-emerald-500" : "bg-rewaq-gold"
                }`}
                style={{ width: `${Math.min(100, Math.round((totalPicked / (totalRequired || 1)) * 100))}%` }}
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handlePickAll}
                className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>تأكيد تجهيز الكل دفعة واحدة</span>
              </button>
              <button
                type="button"
                onClick={handleResetAll}
                className="text-[11px] font-bold text-slate-500 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة ضبط</span>
              </button>
            </div>
          </div>

          {/* Product Items Checklist */}
          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {delivery.items.map((item) => {
              const currentPicked = localPickedState[item.productId] ?? item.pickedQty;
              const isItemComplete = currentPicked >= item.quantity;
              const missingCount = item.quantity - currentPicked;

              return (
                <div
                  key={item.productId}
                  className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    isItemComplete
                      ? "bg-emerald-50/40 border-emerald-200"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      {isItemComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                      <span>{item.productName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      {item.fabricColor && <span>اللون: {item.fabricColor}</span>}
                      <span>•</span>
                      <span className="font-mono">
                        المطلوب: {item.quantity} | المجهز: {currentPicked}
                        {missingCount > 0 && (
                          <span className="text-rose-600 font-bold mr-1"> (ناقص: {missingCount})</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Increment / Decrement Counter */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSetPicked(item.productId, currentPicked - 1, item.quantity)}
                      className="w-7 h-7 rounded-lg bg-white font-black text-slate-800 flex items-center justify-center hover:bg-slate-200 transition"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono font-black text-xs">
                      {currentPicked}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSetPicked(item.productId, currentPicked + 1, item.quantity)}
                      className="w-7 h-7 rounded-lg bg-white font-black text-slate-800 flex items-center justify-center hover:bg-slate-200 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {!allComplete && (
            <div className="bg-amber-50 text-amber-800 p-3 rounded-2xl border border-amber-200 text-[11px] font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                تنبيه: لا يمكن اعتماد الشحنة كـ (Ready) حتى يتم استكمال كافة الأصناف المطلوبة أو تأكيد تسليم جزئي.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2 rounded-xl transition cursor-pointer"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleFinish}
            className={`inline-flex items-center gap-1.5 text-xs font-black px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer ${
              allComplete
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-slate-900 hover:bg-slate-800 text-white"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{allComplete ? "اعتماد التجهيز وتحويلها لـ Ready" : "حفظ تقدم التجهيز"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
