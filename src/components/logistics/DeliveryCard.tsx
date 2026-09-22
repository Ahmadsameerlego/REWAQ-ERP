"use client";

import React from "react";
import {
  Truck,
  Phone,
  MessageCircle,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Package,
  Layers,
  ChevronLeft,
  ArrowUpRight,
  ShieldCheck,
  UserCheck,
  RotateCcw,
  Wrench,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { DeliveryOrder, DeliveryStatus } from "@/types/logistics";
import { useShowroom } from "@/context/ShowroomContext";

interface DeliveryCardProps {
  delivery: DeliveryOrder;
  onSelect: (delivery: DeliveryOrder) => void;
  onCheckReadiness: (delivery: DeliveryOrder) => void;
  onPickPack: (delivery: DeliveryOrder) => void;
  onScheduleAssign: (delivery: DeliveryOrder) => void;
  onDispatch: (delivery: DeliveryOrder) => void;
  onCompletePOD: (delivery: DeliveryOrder) => void;
  onFail: (delivery: DeliveryOrder) => void;
}

export default function DeliveryCard({
  delivery,
  onSelect,
  onCheckReadiness,
  onPickPack,
  onScheduleAssign,
  onDispatch,
  onCompletePOD,
  onFail,
}: DeliveryCardProps) {
  const { checkDeliveryReadiness } = useShowroom();
  const readiness = checkDeliveryReadiness(delivery.id);

  const getStatusBadge = (status: DeliveryStatus) => {
    switch (status) {
      case "DRAFT":
        return {
          label: "مسودة",
          className: "bg-slate-100 text-slate-700 border-slate-200",
          dot: "bg-slate-400",
        };
      case "PREPARING":
        return {
          label: "جاري التجهيز",
          className: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
        };
      case "READY":
        return {
          label: "جاهز للتسليم",
          className: "bg-emerald-50 text-emerald-800 border-emerald-300 font-black",
          dot: "bg-emerald-500",
        };
      case "SCHEDULED":
        return {
          label: "تمت الجدولة",
          className: "bg-blue-50 text-blue-700 border-blue-200",
          dot: "bg-blue-500",
        };
      case "ASSIGNED":
        return {
          label: "تم تعيين السائق",
          className: "bg-indigo-50 text-indigo-700 border-indigo-200",
          dot: "bg-indigo-500",
        };
      case "OUT_FOR_DELIVERY":
        return {
          label: "في الطريق للعميل 🚚",
          className: "bg-sky-100 text-sky-900 border-sky-300 animate-pulse font-black",
          dot: "bg-sky-600",
        };
      case "DELIVERED":
        return {
          label: "تم التسليم بنجاح ✅",
          className: "bg-emerald-100 text-emerald-900 border-emerald-300 font-black",
          dot: "bg-emerald-600",
        };
      case "FAILED":
        return {
          label: "تعذر التسليم ⚠️",
          className: "bg-rose-50 text-rose-800 border-rose-200 font-bold",
          dot: "bg-rose-500",
        };
      case "RESCHEDULED":
        return {
          label: "معاد جدولته 🔄",
          className: "bg-purple-50 text-purple-800 border-purple-200",
          dot: "bg-purple-500",
        };
      case "CANCELLED":
        return {
          label: "ملغي",
          className: "bg-slate-100 text-slate-500 border-slate-200 line-through",
          dot: "bg-slate-400",
        };
      default:
        return {
          label: status,
          className: "bg-slate-100 text-slate-700 border-slate-200",
          dot: "bg-slate-400",
        };
    }
  };

  const badge = getStatusBadge(delivery.status);
  const totalItemsCount = delivery.items.reduce((sum, it) => sum + it.quantity, 0);
  const totalPickedCount = delivery.items.reduce((sum, it) => sum + it.pickedQty, 0);

  const cleanPhone = delivery.customerPhone.replace(/[^0-9]/g, "");
  const waLink = `https://wa.me/20${cleanPhone.startsWith("0") ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(
    `مرحباً ${delivery.customerName}، بخصوص شحنتك رقم ${delivery.deliveryNumber} من معارض رِواق...`
  )}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition duration-200 flex flex-col justify-between overflow-hidden">
      {/* Card Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono font-black text-sm text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
              #{delivery.deliveryNumber}
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs font-bold text-slate-600 font-mono">
              عقد: {delivery.contractNumber}
            </span>
            {delivery.isPartial && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-200">
                تسليم جزئي {delivery.partialDeliveryIndex || 1}/{delivery.totalPartialDeliveries || 2}
              </span>
            )}
          </div>
          <h3 className="text-sm font-black text-slate-900">{delivery.customerName}</h3>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${badge.className}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
            <span>{badge.label}</span>
          </span>

          {/* Readiness quick chip */}
          {delivery.status !== "DELIVERED" && delivery.status !== "CANCELLED" && (
            <button
              type="button"
              onClick={() => onCheckReadiness(delivery)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer transition ${
                readiness.isReady
                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100"
              }`}
            >
              {readiness.isReady ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>جاهز للمخزن</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-rose-600" />
                  <span>نواقص ({readiness.missingItems.length})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3 flex-1 text-xs">
        {/* Customer Location & Contact */}
        <div className="space-y-1.5">
          <div className="flex items-start gap-1.5 text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{delivery.deliveryAddress} ({delivery.city})</span>
          </div>

          <div className="flex items-center justify-between text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="flex items-center gap-1 font-mono">
              <Phone className="w-3 h-3 text-slate-400" />
              {delivery.customerPhone}
            </span>
            <div className="flex items-center gap-1">
              <a
                href={`tel:${delivery.customerPhone}`}
                className="p-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 transition"
                title="اتصال"
              >
                <Phone className="w-3 h-3" />
              </a>
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition"
                title="محادثة واتساب"
              >
                <MessageCircle className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Products Summary Box */}
        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between font-bold text-slate-700 text-[11px]">
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3 text-rewaq-gold" />
              القطع المطلوبة ({totalItemsCount} قطعة)
            </span>
            <span
              className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                totalPickedCount >= totalItemsCount
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              مجهز: {totalPickedCount}/{totalItemsCount}
            </span>
          </div>

          <ul className="space-y-1 text-[11px] text-slate-600">
            {delivery.items.slice(0, 2).map((item, idx) => (
              <li key={idx} className="flex items-center justify-between gap-2">
                <span className="truncate">• {item.productName}</span>
                <span className="font-mono font-bold text-slate-800 shrink-0">
                  ×{item.quantity}
                </span>
              </li>
            ))}
            {delivery.items.length > 2 && (
              <li className="text-[10px] text-slate-400 font-bold">
                + {delivery.items.length - 2} أصناف أخرى...
              </li>
            )}
          </ul>
        </div>

        {/* Schedule & Assignment Info */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold block mb-0.5">موعد التسليم</span>
            <div className="flex items-center gap-1 text-slate-800 font-bold truncate">
              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{delivery.scheduledDate}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
              {delivery.timeWindow}
            </span>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold block mb-0.5">السائق والسيارة</span>
            <div className="flex items-center gap-1 text-slate-800 font-bold truncate">
              <Truck className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{delivery.driverName || "لم يتم التعيين"}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono block mt-0.5 truncate">
              {delivery.vehiclePlate ? `لوحة: ${delivery.vehiclePlate}` : "سيارة غير محددة"}
            </span>
          </div>
        </div>

        {/* Financial COD Summary */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <span className="text-[11px] text-slate-500 font-bold">المتبقي للتحصيل (COD):</span>
          <span className="text-sm font-mono font-black text-amber-700">
            {delivery.codAmount.toLocaleString()} ج.م
          </span>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => onSelect(delivery)}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-2xs transition cursor-pointer"
        >
          <span>التفاصيل</span>
          <ChevronLeft className="w-3 h-3" />
        </button>

        <div className="flex items-center gap-1 flex-wrap">
          {/* Action: Pick & Pack if DRAFT or PREPARING */}
          {(delivery.status === "DRAFT" || delivery.status === "PREPARING") && (
            <button
              type="button"
              onClick={() => onPickPack(delivery)}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 bg-amber-200 hover:bg-amber-300 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
            >
              <Package className="w-3 h-3" />
              <span>تجهيز</span>
            </button>
          )}

          {/* Action: Schedule / Assign if READY or DRAFT */}
          {(delivery.status === "READY" || delivery.status === "DRAFT" || delivery.status === "SCHEDULED") && (
            <button
              type="button"
              onClick={() => onScheduleAssign(delivery)}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 bg-rewaq-gold hover:bg-rewaq-gold-dark px-2.5 py-1.5 rounded-lg transition cursor-pointer"
            >
              <Calendar className="w-3 h-3" />
              <span>جدولة</span>
            </button>
          )}

          {/* Action: Dispatch if ASSIGNED or SCHEDULED */}
          {(delivery.status === "ASSIGNED" || delivery.status === "SCHEDULED" || delivery.status === "READY") && (
            <button
              type="button"
              onClick={() => onDispatch(delivery)}
              className="inline-flex items-center gap-1 text-xs font-black text-white bg-slate-900 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg shadow-xs transition cursor-pointer"
            >
              <Truck className="w-3 h-3 text-rewaq-gold" />
              <span>خروج للتسليم</span>
            </button>
          )}

          {/* Action: Proof of Delivery if OUT_FOR_DELIVERY */}
          {delivery.status === "OUT_FOR_DELIVERY" && (
            <>
              <button
                type="button"
                onClick={() => onCompletePOD(delivery)}
                className="inline-flex items-center gap-1 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1.5 rounded-lg shadow-xs transition cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>إثبات التسليم (POD)</span>
              </button>

              <button
                type="button"
                onClick={() => onFail(delivery)}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-1.5 rounded-lg transition cursor-pointer"
                title="تسجيل تعثر التسليم"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>تعثر</span>
              </button>
            </>
          )}

          {/* Reschedule if FAILED */}
          {delivery.status === "FAILED" && (
            <button
              type="button"
              onClick={() => onScheduleAssign(delivery)}
              className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة الجدولة</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
