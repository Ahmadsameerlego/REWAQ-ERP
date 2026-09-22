"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  Truck,
  Users2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useShowroom } from "@/context/ShowroomContext";
import { DeliveryOrder, TimeWindow } from "@/types/logistics";
import LogisticsNav from "@/components/logistics/LogisticsNav";
import ScheduleAssignModal from "@/components/logistics/ScheduleAssignModal";
import DeliveryDetailsModal from "@/components/logistics/DeliveryDetailsModal";
import RouteIntelligenceCard from "@/components/logistics/RouteIntelligenceCard";

export default function LogisticsSchedulePage() {
  const { deliveries, drivers, vehicles } = useShowroom();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [scheduleModalDelivery, setScheduleModalDelivery] = useState<DeliveryOrder | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOrder | null>(null);

  const timeSlots: TimeWindow[] = [
    "10:00 - 12:00",
    "12:00 - 14:00",
    "14:00 - 16:00",
    "16:00 - 18:00",
    "18:00 - 20:00",
  ];

  const deliveriesOnDate = useMemo(() => {
    return deliveries.filter((d) => d.scheduledDate === selectedDate);
  }, [deliveries, selectedDate]);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  return (
    <div className="space-y-6 pb-12">
      <LogisticsNav />

      {/* Header & Date Selector */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">
            مخطط الجدولة وتوزيع الفترات الزمنية (Dispatch Calendar)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            توزيع الشحنات على النوافذ الزمنية ومنع تعارض السائقين والسيارات.
          </p>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={handleNextDay}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 shadow-2xs transition cursor-pointer"
            title="اليوم التالي"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-xl border border-slate-200 shadow-2xs font-mono font-black text-xs text-slate-900">
            <Calendar className="w-4 h-4 text-rewaq-gold" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={handlePrevDay}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 shadow-2xs transition cursor-pointer"
            title="اليوم السابق"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Route Intelligence Card */}
      <RouteIntelligenceCard />

      {/* Time Slots Timeline Matrix */}
      <div className="space-y-4">
        {timeSlots.map((slot) => {
          const slotDeliveries = deliveriesOnDate.filter((d) => d.timeWindow === slot);

          return (
            <div
              key={slot}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 space-y-3"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-900 text-rewaq-gold rounded-xl shadow-2xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 font-mono">{slot}</h3>
                    <span className="text-[11px] text-slate-400">
                      {slotDeliveries.length} شحنات مجدولة في هذه الفترة
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-xl border ${
                    slotDeliveries.length > 2
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : slotDeliveries.length > 0
                      ? "bg-blue-50 text-blue-800 border-blue-200"
                      : "bg-slate-50 text-slate-500 border-slate-200"
                  }`}
                >
                  {slotDeliveries.length > 2 ? "ضغط تشغيلي مرتفع" : slotDeliveries.length > 0 ? "نشط" : "شاغر"}
                </span>
              </div>

              {slotDeliveries.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  لا توجد شحنات مجدولة في هذه الفترة الزمنية
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {slotDeliveries.map((del) => (
                    <div
                      key={del.id}
                      onClick={() => setSelectedDelivery(del)}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-rewaq-gold bg-slate-50/60 hover:bg-white transition cursor-pointer shadow-2xs space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-slate-900">
                          #{del.deliveryNumber}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-white border border-slate-200">
                          {del.status}
                        </span>
                      </div>

                      <div className="font-bold text-slate-800">{del.customerName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{del.deliveryAddress} ({del.city})</span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700">
                          السائق: {del.driverName || "غير محدد"}
                        </span>
                        <span className="font-mono font-bold text-amber-700">
                          {del.codAmount.toLocaleString()} ج
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {selectedDelivery && (
        <DeliveryDetailsModal
          delivery={selectedDelivery}
          onClose={() => setSelectedDelivery(null)}
          onCheckReadiness={() => {}}
          onPickPack={() => {}}
          onScheduleAssign={(d) => {
            setSelectedDelivery(null);
            setScheduleModalDelivery(d);
          }}
          onDispatch={() => {}}
          onCompletePOD={() => {}}
          onFail={() => {}}
          onReportIssue={() => {}}
          onCreateReturn={() => {}}
        />
      )}

      {scheduleModalDelivery && (
        <ScheduleAssignModal
          delivery={scheduleModalDelivery}
          onClose={() => setScheduleModalDelivery(null)}
        />
      )}
    </div>
  );
}
