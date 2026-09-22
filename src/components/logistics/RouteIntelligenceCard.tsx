"use client";

import React from "react";
import {
  Sparkles,
  MapPin,
  Truck,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronLeft,
  Navigation,
} from "lucide-react";
import { useShowroom } from "@/context/ShowroomContext";

interface RouteIntelligenceCardProps {
  onGroupRouteSuccess?: () => void;
}

export default function RouteIntelligenceCard({ onGroupRouteSuccess }: RouteIntelligenceCardProps) {
  const { logisticsInsights, applyLogisticsInsight, deliveries } = useShowroom();

  const routeInsights = logisticsInsights.filter(
    (i) => i.type === "ROUTE_GROUPING" && !i.resolved
  );

  if (routeInsights.length === 0) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900">
              خطوط السير والرحلات موزعة بكفاءة ممتازة
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              لا توجد اقتراحات دمج جغرافية معلقة حالياً — الأسطول يعمل بأعلى معدلات الكفاءة.
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
          مسارات متوازنة
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {routeInsights.map((insight) => {
        const affected = deliveries.filter((d) => insight.affectedDeliveryIds?.includes(d.id));

        return (
          <div
            key={insight.id}
            className="bg-gradient-to-r from-amber-500/10 via-amber-50/60 to-white p-5 rounded-2xl border border-amber-300 shadow-2xs space-y-3 relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-slate-900 text-rewaq-gold rounded-2xl shadow-xs shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-slate-900 text-rewaq-gold px-2 py-0.5 rounded-md">
                      ذكاء المسارات (Route Intelligence)
                    </span>
                    {insight.targetZone && (
                      <span className="text-[10px] font-bold bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-md">
                        منطقة: {insight.targetZone}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-black text-slate-900 mt-1">
                    {insight.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    applyLogisticsInsight(insight.id);
                    if (onGroupRouteSuccess) onGroupRouteSuccess();
                  }}
                  className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Navigation className="w-4 h-4 text-rewaq-gold" />
                  <span>{insight.actionLabel || "دمج في خط سير موحد"}</span>
                </button>
              </div>
            </div>

            {/* Affected Deliveries Stops Preview */}
            {affected.length > 0 && (
              <div className="bg-white/80 p-3 rounded-xl border border-amber-200/70 space-y-2 text-xs">
                <span className="text-[11px] font-bold text-slate-700 block">
                  المحطات المقترحة للرحلة الموحدة (Suggested Stop Order):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {affected.map((del, stopIdx) => (
                    <div
                      key={del.id}
                      className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100"
                    >
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-rewaq-gold font-bold text-[10px] flex items-center justify-center shrink-0">
                        {stopIdx + 1}
                      </span>
                      <div className="truncate">
                        <span className="font-bold text-slate-900 text-[11px] block truncate">
                          {del.customerName} (#{del.deliveryNumber})
                        </span>
                        <span className="text-[10px] text-slate-500 truncate block">
                          {del.deliveryAddress}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 italic pt-1">
                  💡 {insight.recommendation}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
