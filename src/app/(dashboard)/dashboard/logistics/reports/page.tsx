"use client";

import React from "react";
import {
  BarChart3,
  TrendingUp,
  Truck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Users2,
  DollarSign,
  Calendar,
  Building2,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { useShowroom } from "@/context/ShowroomContext";
import LogisticsNav from "@/components/logistics/LogisticsNav";

export default function LogisticsReportsPage() {
  const { deliveries, drivers, vehicles, deliveryIssues, deliveryReturns } = useShowroom();

  const totalDeliveries = deliveries.length;
  const deliveredCount = deliveries.filter((d) => d.status === "DELIVERED").length;
  const failedCount = deliveries.filter((d) => d.status === "FAILED" || d.status === "RESCHEDULED").length;
  const inTransitCount = deliveries.filter((d) => d.status === "OUT_FOR_DELIVERY").length;

  const onTimeRate = totalDeliveries > 0 ? Math.round(((totalDeliveries - failedCount) / totalDeliveries) * 100) : 100;

  const totalCodCollected = deliveries
    .filter((d) => d.status === "DELIVERED" && d.proofOfDelivery)
    .reduce((sum, d) => sum + (d.proofOfDelivery?.codCollected || d.codAmount), 0);

  const totalCodPending = deliveries
    .filter((d) => d.status === "OUT_FOR_DELIVERY" || d.status === "ASSIGNED" || d.status === "SCHEDULED")
    .reduce((sum, d) => sum + d.codAmount, 0);

  // Group by branch
  const branchMap: Record<string, { total: number; delivered: number; cod: number }> = {};
  deliveries.forEach((d) => {
    const branchName = d.branch || "الفرع الرئيسي";
    if (!branchMap[branchName]) {
      branchMap[branchName] = { total: 0, delivered: 0, cod: 0 };
    }
    branchMap[branchName].total += 1;
    if (d.status === "DELIVERED") {
      branchMap[branchName].delivered += 1;
      branchMap[branchName].cod += d.proofOfDelivery?.codCollected || d.codAmount;
    }
  });

  return (
    <div className="space-y-6 pb-12">
      <LogisticsNav />

      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">
            تقارير ومؤشرات أداء الشحن واللوجستيات (Logistics Reports)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            مؤشرات تشغيلية عملية لدقة المواعيد، تحصيلات السائقين، ونسب الإنجاز.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            تحديث لحظي لجميع الفروع
          </span>
        </div>
      </div>

      {/* KPI Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>معدل التسليم في الموعد (On-Time)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-700 font-mono">{onTimeRate}%</div>
          <span className="text-[11px] text-emerald-600 font-bold">وفق أعلى معايير الجودة</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>إجمالي التحصيلات النقدية (COD)</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {totalCodCollected.toLocaleString()} <span className="text-xs font-bold text-slate-500">ج.م</span>
          </div>
          <span className="text-[11px] text-slate-400">تم توريدها للخزينة</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>مبالغ قيد التحصيل بالشارع</span>
            <Truck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-700 font-mono">
            {totalCodPending.toLocaleString()} <span className="text-xs font-bold text-slate-500">ج.م</span>
          </div>
          <span className="text-[11px] text-amber-700 font-bold">مع سيارات الشحن الآن</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>البلاغات والمرتجعات</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-700 font-mono">
            {deliveryIssues.length + deliveryReturns.length}
          </div>
          <span className="text-[11px] text-rose-700 font-bold">
            {deliveryIssues.filter((i) => i.status !== "RESOLVED").length} بلاغات مفتوحة
          </span>
        </div>
      </div>

      {/* Grid: Deliveries by Branch & Driver Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Deliveries by Branch */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-rewaq-gold" />
              أداء الشحن والتسليم حسب الفروع والمستودعات
            </h3>
          </div>

          <div className="space-y-3">
            {Object.entries(branchMap).map(([branchName, stats]) => {
              const bRate = stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0;
              return (
                <div key={branchName} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900">{branchName}</span>
                    <span className="text-slate-600 font-mono">
                      {stats.delivered} / {stats.total} شحنة ({bRate}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-rewaq-gold h-full rounded-full transition-all"
                      style={{ width: `${bRate}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 font-mono">
                    <span>تحصيلات كاش: {stats.cod.toLocaleString()} ج.م</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Driver Performance Table */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Users2 className="w-4 h-4 text-rewaq-gold" />
              أداء السائقين والتحصيلات الميدانية
            </h3>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {drivers.map((drv) => {
              const driverDeliveries = deliveries.filter((d) => d.driverId === drv.id);
              const driverDelivered = driverDeliveries.filter((d) => d.status === "DELIVERED").length;
              const driverCod = driverDeliveries
                .filter((d) => d.status === "DELIVERED" && d.proofOfDelivery)
                .reduce((s, d) => s + (d.proofOfDelivery?.codCollected || d.codAmount), 0);

              return (
                <div key={drv.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{drv.name}</span>
                      <span className="text-[10px] text-amber-600 font-bold">★ {drv.rating}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {drv.phone} | {drv.vehicleAssigned}
                    </div>
                  </div>

                  <div className="text-left font-mono shrink-0">
                    <span className="font-bold text-slate-900 block">
                      {driverDelivered} / {driverDeliveries.length} مكتمل
                    </span>
                    <span className="text-[11px] text-emerald-700 font-bold block">
                      توريد: {driverCod.toLocaleString()} ج.م
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
