"use client";

import React, { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  Truck,
  Users2,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Info,
} from "lucide-react";
import { DeliveryOrder, TimeWindow } from "@/types/logistics";
import { useShowroom } from "@/context/ShowroomContext";

interface ScheduleAssignModalProps {
  delivery: DeliveryOrder | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ScheduleAssignModal({
  delivery,
  onClose,
  onSuccess,
}: ScheduleAssignModalProps) {
  if (!delivery) return null;

  const { drivers, vehicles, deliveries, scheduleDelivery } = useShowroom();

  const [date, setDate] = useState<string>(delivery.scheduledDate || new Date().toISOString().split("T")[0]);
  const [timeWindow, setTimeWindow] = useState<string>(delivery.timeWindow || "12:00 - 14:00");
  const [driverId, setDriverId] = useState<string>(delivery.driverId || "");
  const [vehicleId, setVehicleId] = useState<string>(delivery.vehicleId || "");
  const [deliveryTeam, setDeliveryTeam] = useState<string>(delivery.deliveryTeam || "");
  const [notes, setNotes] = useState<string>("");
  const [forceOverride, setForceOverride] = useState<boolean>(false);
  const [overrideReason, setOverrideReason] = useState<string>("");
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Live Conflict Evaluation
  const selectedDriver = drivers.find((d) => d.id === driverId);
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  const checkLiveConflicts = () => {
    let warn: string | null = null;
    if (driverId) {
      const conflict = deliveries.find(
        (d) =>
          d.id !== delivery.id &&
          d.driverId === driverId &&
          d.scheduledDate === date &&
          d.timeWindow === timeWindow &&
          d.status !== "DELIVERED" &&
          d.status !== "CANCELLED"
      );
      if (conflict) {
        warn = `⚠️ السائق (${selectedDriver?.name}) مسند إليه شحنة أخرى (#${conflict.deliveryNumber}) في نفس اليوم والنافذة الزمنية (${timeWindow}).`;
      }
    }

    if (!warn && vehicleId) {
      const vConflict = deliveries.find(
        (d) =>
          d.id !== delivery.id &&
          d.vehicleId === vehicleId &&
          d.scheduledDate === date &&
          d.timeWindow === timeWindow &&
          d.status !== "DELIVERED" &&
          d.status !== "CANCELLED"
      );
      if (vConflict) {
        warn = `⚠️ السيارة (${selectedVehicle?.plateNumber}) مشغولة في نفس التوقيت بشحنة #${vConflict.deliveryNumber}.`;
      }
    }

    if (!warn && selectedVehicle) {
      const totalItemCount = delivery.items.reduce((s, it) => s + it.quantity, 0);
      if (totalItemCount > selectedVehicle.maxItemsCapacity) {
        warn = `⚠️ سعة السيارة (${selectedVehicle.maxItemsCapacity} قطع) قد لا تتسع لحجم هذه الشحنة (${totalItemCount} قطع).`;
      }
    }

    return warn;
  };

  const currentConflict = checkLiveConflicts();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const res = scheduleDelivery(delivery.id, {
      date,
      timeWindow,
      driverId: driverId || undefined,
      vehicleId: vehicleId || undefined,
      deliveryTeam: deliveryTeam || undefined,
      notes,
      forceOverride,
      overrideReason,
    });

    if (!res.success) {
      setWarningMessage(res.warning || "يوجد تعارض في المواعيد");
    } else {
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden text-right">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <Calendar className="w-5 h-5 text-rewaq-gold" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                جدولة وتعيين الأسطول للشحنة #{delivery.deliveryNumber}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                العميل: {delivery.customerName} ({delivery.city})
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
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          
          {/* Conflict Live Warning Box */}
          {(currentConflict || warningMessage) && (
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <span className="font-black text-xs block">تحذير تعارض في المواعيد أو السعة</span>
                  <p className="text-[11px] leading-relaxed font-medium">
                    {currentConflict || warningMessage}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-200/80 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="overrideCheck"
                  checked={forceOverride}
                  onChange={(e) => setForceOverride(e.target.checked)}
                  className="rounded text-rewaq-gold focus:ring-rewaq-gold"
                />
                <label htmlFor="overrideCheck" className="text-[11px] font-bold text-amber-950 cursor-pointer">
                  تجاوز إداري واستكمال التعيين رغم التعارض
                </label>
              </div>

              {forceOverride && (
                <input
                  type="text"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="سبب التجاوز (مثال: رحلة مدمجة / موافقة العميل على موعد مرن)..."
                  className="w-full bg-white border border-amber-300 rounded-xl p-2 text-[11px] text-slate-800 focus:outline-none"
                />
              )}
            </div>
          )}

          {/* Date & Time Window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">تاريخ التسليم المعتمد:</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-rewaq-gold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">النافذة الزمنية (Time Slot):</label>
              <select
                value={timeWindow}
                onChange={(e) => setTimeWindow(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-rewaq-gold"
              >
                <option value="10:00 - 12:00">10:00 ص – 12:00 م (صباحي 1)</option>
                <option value="12:00 - 14:00">12:00 م – 02:00 م (صباحي 2)</option>
                <option value="14:00 - 16:00">02:00 م – 04:00 م (ظهيرة)</option>
                <option value="16:00 - 18:00">04:00 م – 06:00 م (مسائي)</option>
                <option value="18:00 - 20:00">06:00 م – 08:00 م (مسائي متأخر)</option>
              </select>
            </div>
          </div>

          {/* Driver & Vehicle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">السائق:</label>
              <select
                value={driverId}
                onChange={(e) => {
                  setDriverId(e.target.value);
                  const drv = drivers.find((d) => d.id === e.target.value);
                  if (drv) {
                    const matchedV = vehicles.find((v) => v.currentDriverId === drv.id || v.plateNumber === drv.vehicleAssigned);
                    if (matchedV) setVehicleId(matchedV.id);
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-rewaq-gold"
              >
                <option value="">-- بدون سائق (جدولة موعد فقط) --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.status === "AVAILABLE" ? "متاح" : "مشغول"})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">سيارة الشحن:</label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-rewaq-gold"
              >
                <option value="">-- بدون سيارة --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.model} ({v.plateNumber}) - سعة {v.maxItemsCapacity}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Delivery Team / Techs */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">طاقم التوصيل والتركيب (اختياري):</label>
            <input
              type="text"
              value={deliveryTeam}
              onChange={(e) => setDeliveryTeam(e.target.value)}
              placeholder="مثال: أشرف عادل (سائق) + م/ إبراهيم (فني تركيب صالونات)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-rewaq-gold focus:bg-white"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">ملاحظات خط السير:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات للسائق أو تفاصيل الوصول..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-rewaq-gold focus:bg-white"
            />
          </div>

          {/* Footer Actions */}
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
              className="inline-flex items-center gap-1.5 text-xs font-black text-slate-950 bg-rewaq-gold hover:bg-rewaq-gold-dark px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تثبيت الجدولة والتعيين</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
