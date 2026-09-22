"use client";

import React, { useState } from "react";
import {
  X,
  Truck,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  Clock,
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  DollarSign,
  UserCheck,
  ShieldCheck,
  Wrench,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Printer,
  ChevronLeft,
} from "lucide-react";
import { DeliveryOrder, DeliveryStatus } from "@/types/logistics";
import { useShowroom } from "@/context/ShowroomContext";

interface DeliveryDetailsModalProps {
  delivery: DeliveryOrder | null;
  onClose: () => void;
  onCheckReadiness: (delivery: DeliveryOrder) => void;
  onPickPack: (delivery: DeliveryOrder) => void;
  onScheduleAssign: (delivery: DeliveryOrder) => void;
  onDispatch: (delivery: DeliveryOrder) => void;
  onCompletePOD: (delivery: DeliveryOrder) => void;
  onFail: (delivery: DeliveryOrder) => void;
  onReportIssue: (delivery: DeliveryOrder) => void;
  onCreateReturn: (delivery: DeliveryOrder) => void;
}

export default function DeliveryDetailsModal({
  delivery,
  onClose,
  onCheckReadiness,
  onPickPack,
  onScheduleAssign,
  onDispatch,
  onCompletePOD,
  onFail,
  onReportIssue,
  onCreateReturn,
}: DeliveryDetailsModalProps) {
  if (!delivery) return null;

  const { checkDeliveryReadiness, updateDeliveryStatus } = useShowroom();
  const readiness = checkDeliveryReadiness(delivery.id);

  const cleanPhone = delivery.customerPhone.replace(/[^0-9]/g, "");
  const waLink = `https://wa.me/20${cleanPhone.startsWith("0") ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(
    `مرحباً ${delivery.customerName}، بخصوص شحنتك رقم ${delivery.deliveryNumber} من معارض رِواق...`
  )}`;

  const getStatusBadge = (status: DeliveryStatus) => {
    switch (status) {
      case "DRAFT":
        return { label: "مسودة غير مجهزة", className: "bg-slate-100 text-slate-800 border-slate-300" };
      case "PREPARING":
        return { label: "جاري التجهيز بالمخزن 📦", className: "bg-amber-100 text-amber-900 border-amber-300 font-bold" };
      case "READY":
        return { label: "جاهز للتسليم والتحميل ✅", className: "bg-emerald-100 text-emerald-950 border-emerald-300 font-black" };
      case "SCHEDULED":
        return { label: "مجدول بالموعد 🗓️", className: "bg-blue-100 text-blue-900 border-blue-300 font-bold" };
      case "ASSIGNED":
        return { label: "تم تعيين السائق والمركبة 🚚", className: "bg-indigo-100 text-indigo-900 border-indigo-300 font-bold" };
      case "OUT_FOR_DELIVERY":
        return { label: "خرجت الشحنة وفي الطريق 🚀", className: "bg-sky-100 text-sky-950 border-sky-400 font-black animate-pulse" };
      case "DELIVERED":
        return { label: "تم التسليم بنجاح وإثبات الوصول ✅", className: "bg-emerald-100 text-emerald-950 border-emerald-400 font-black" };
      case "FAILED":
        return { label: "تعذر التسليم ⚠️", className: "bg-rose-100 text-rose-950 border-rose-300 font-bold" };
      case "RESCHEDULED":
        return { label: "معاد جدولته 🔄", className: "bg-purple-100 text-purple-900 border-purple-300 font-bold" };
      case "CANCELLED":
        return { label: "ملغي", className: "bg-slate-100 text-slate-500 border-slate-300" };
      default:
        return { label: status, className: "bg-slate-100 text-slate-800 border-slate-300" };
    }
  };

  const badge = getStatusBadge(delivery.status);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-right">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
              <Truck className="w-6 h-6 text-rewaq-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 font-mono">
                  #{delivery.deliveryNumber}
                </h2>
                <span className={`text-xs px-2.5 py-0.5 rounded-lg border font-bold ${badge.className}`}>
                  {badge.label}
                </span>
                {delivery.isPartial && (
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-200">
                    تسليم جزئي {delivery.partialDeliveryIndex || 1}/{delivery.totalPartialDeliveries || 2}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                تاريخ الإنشاء: {delivery.createdAt} | فرع: {delivery.branch} ({delivery.warehouse})
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

        {/* Modal Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs flex-1">
          
          {/* Readiness Warning / Green Alert */}
          {delivery.status !== "DELIVERED" && delivery.status !== "CANCELLED" && (
            <div
              className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
                readiness.isReady
                  ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                  : "bg-rose-50/70 border-rose-200 text-rose-900"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {readiness.isReady ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                )}
                <div>
                  <h4 className="text-xs font-black">
                    {readiness.isReady
                      ? "الشحنة مستوفية شروط الجاهزية بنجاح 100%"
                      : "الشحنة غير جاهزة للتسليم — يوجد ملاحظات قبل التحميل"}
                  </h4>
                  {readiness.reasons.length > 0 ? (
                    <ul className="mt-1 space-y-0.5 text-[11px] text-rose-800 list-disc list-inside">
                      {readiness.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      كافة الأصناف متوفرة بالمستودع، بيانات العميل صحيحة، والعقد معتمد للتحميل.
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onCheckReadiness(delivery)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 shrink-0 shadow-2xs transition cursor-pointer"
              >
                فحص الجاهزية التفصيلي
              </button>
            </div>
          )}

          {/* 1. Customer & Contract 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                بيانات العميل والتوصيل
              </span>
              <div className="space-y-1.5">
                <div className="text-sm font-black text-slate-900">{delivery.customerName}</div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{delivery.customerPhone}</span>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-md transition"
                  >
                    <MessageCircle className="w-3 h-3" />
                    واتساب
                  </a>
                </div>
                <div className="flex items-start gap-1.5 text-slate-600 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span>{delivery.deliveryAddress} ({delivery.city} - {delivery.zone || ""})</span>
                </div>
                {delivery.specialInstructions && (
                  <div className="text-[11px] bg-amber-50 text-amber-800 p-2 rounded-xl border border-amber-200 mt-1">
                    <span className="font-bold">تعليمات خاصة:</span> {delivery.specialInstructions}
                  </div>
                )}
              </div>
            </div>

            {/* Contract Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  العقد والتحصيل المالي
                </span>
                <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border">
                  #{delivery.contractNumber}
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">إجمالي قيمة العقد:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {delivery.totalContractAmount.toLocaleString()} ج.م
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">المسدد مقدماً (عربون):</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {delivery.depositPaid.toLocaleString()} ج.م
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-900 font-black">المتبقي للتحصيل عند الباب (COD):</span>
                  <span className="font-mono font-black text-sm text-amber-700">
                    {delivery.codAmount.toLocaleString()} ج.م
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                  <Wrench className="w-3 h-3 text-slate-400" />
                  <span>الحاجة لفني تركيب: {delivery.needsAssembly ? "نعم (مطلوب نجار/فني)" : "لا"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Products List & Picking Progress */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-rewaq-gold" />
                قائمة الأصناف المطلوب تسليمها ({delivery.items.length} أصناف)
              </span>
              <button
                type="button"
                onClick={() => onPickPack(delivery)}
                className="text-xs font-bold text-rewaq-gold-dark hover:underline flex items-center gap-1"
              >
                <span>شاشة التجهيز والتجميع (Picking)</span>
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {delivery.items.map((it, idx) => {
                const isItemReady = it.pickedQty >= it.quantity;
                return (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900 text-xs">{it.productName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        {it.fabricColor && <span>اللون/الخامة: {it.fabricColor}</span>}
                        {it.isFromFloor && <span className="text-amber-700 bg-amber-50 px-1.5 rounded">عينة صالة</span>}
                        {it.notes && <span className="text-slate-500 italic">{it.notes}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-left font-mono">
                        <span className="text-xs font-bold text-slate-900 block">
                          المطلوب: {it.quantity}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            isItemReady ? "text-emerald-700" : "text-amber-700"
                          }`}
                        >
                          المجهز: {it.pickedQty} / {it.quantity}
                        </span>
                      </div>

                      <span
                        className={`text-xs p-1 rounded-lg ${
                          isItemReady ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {isItemReady ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Schedule, Driver & Vehicle Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                الجدولة والنافذة الزمنية
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>تاريخ التسليم: {delivery.scheduledDate}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-mono">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>الفترة: {delivery.timeWindow}</span>
                </div>
                {delivery.overrideConflictReason && (
                  <div className="text-[10px] text-amber-800 bg-amber-100/60 p-2 rounded-xl border border-amber-200">
                    <span className="font-bold">تجاوز إداري:</span> {delivery.overrideConflictReason}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                السائق والسيارة المعتمدة
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  <span>السائق: {delivery.driverName || "لم يتم التعيين بعد"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Truck className="w-4 h-4 text-slate-400" />
                  <span>السيارة: {delivery.vehiclePlate ? `${delivery.vehicleType || "سيارة"} (${delivery.vehiclePlate})` : "غير محددة"}</span>
                </div>
                {delivery.deliveryTeam && (
                  <div className="text-[11px] text-slate-600">
                    طاقم العمل: {delivery.deliveryTeam}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. Proof of Delivery (POD) Details (if available) */}
          {delivery.proofOfDelivery && (
            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-2">
              <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                إثبات التسليم الإلكتروني (Proof of Delivery - POD)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-emerald-950 pt-1">
                <div>
                  <span className="text-emerald-700 block">وقت التسليم الفعلي:</span>
                  <span className="font-mono font-bold">{delivery.proofOfDelivery.deliveredAt}</span>
                </div>
                <div>
                  <span className="text-emerald-700 block">اسم المستلم وصفته:</span>
                  <span className="font-bold">{delivery.proofOfDelivery.receivedBy} ({delivery.proofOfDelivery.receiverRelation})</span>
                </div>
                <div>
                  <span className="text-emerald-700 block">المبلغ المحصل نقداً:</span>
                  <span className="font-mono font-black text-emerald-800">{delivery.proofOfDelivery.codCollected.toLocaleString()} ج.م</span>
                </div>
              </div>
              {delivery.proofOfDelivery.notes && (
                <div className="text-[11px] text-emerald-900 bg-white/60 p-2 rounded-xl border border-emerald-100 mt-2">
                  <span className="font-bold">ملاحظات المستلم:</span> {delivery.proofOfDelivery.notes}
                </div>
              )}
            </div>
          )}

          {/* 5. Full Chronological Timeline */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-black text-slate-900 block">
              سجل أحداث ومسار الشحنة (Audit Trail Timeline)
            </span>
            <div className="relative pr-4 border-r-2 border-slate-200 space-y-4">
              {delivery.timeline.map((event, idx) => (
                <div key={idx} className="relative group">
                  <span className="absolute -right-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-400 group-hover:bg-rewaq-gold transition ring-4 ring-white" />
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{event.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{event.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-600">{event.description}</p>
                    <span className="text-[10px] text-slate-400 block font-medium">بواسطة: {event.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Quick Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => onReportIssue(delivery)}
              className="text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-2 rounded-xl transition cursor-pointer"
            >
              تسجيل بلاغ مشكلة
            </button>
            <button
              type="button"
              onClick={() => onCreateReturn(delivery)}
              className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-2 rounded-xl transition cursor-pointer"
            >
              طلب مرتجع مخزني
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {(delivery.status === "DRAFT" || delivery.status === "PREPARING") && (
              <button
                type="button"
                onClick={() => onPickPack(delivery)}
                className="text-xs font-bold bg-amber-200 hover:bg-amber-300 text-slate-950 px-4 py-2 rounded-xl transition cursor-pointer"
              >
                تجهيز الأصناف بالمخزن
              </button>
            )}

            {(delivery.status === "READY" || delivery.status === "DRAFT" || delivery.status === "SCHEDULED") && (
              <button
                type="button"
                onClick={() => onScheduleAssign(delivery)}
                className="text-xs font-black bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
              >
                جدولة وتعيين السائق
              </button>
            )}

            {(delivery.status === "ASSIGNED" || delivery.status === "SCHEDULED" || delivery.status === "READY") && (
              <button
                type="button"
                onClick={() => onDispatch(delivery)}
                className="text-xs font-black bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
              >
                خروج الشحنة للتسليم (Dispatch)
              </button>
            )}

            {delivery.status === "OUT_FOR_DELIVERY" && (
              <>
                <button
                  type="button"
                  onClick={() => onCompletePOD(delivery)}
                  className="text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
                >
                  إثبات التسليم والتحصيل (POD)
                </button>
                <button
                  type="button"
                  onClick={() => onFail(delivery)}
                  className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-xl shadow-xs transition cursor-pointer"
                >
                  تعثر التسليم
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-2xs transition cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
