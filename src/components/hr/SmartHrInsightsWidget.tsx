"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  AlertTriangle,
  Clock,
  FileCheck,
  Plane,
  X,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { useHR } from "@/context/HRContext";

export default function SmartHrInsightsWidget() {
  const { insights, dismissInsight } = useHR();

  const activeInsights = insights.filter((i) => !i.resolved);

  if (activeInsights.length === 0) {
    return (
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-900">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>كل المؤشرات التشغيلية والرواتب والعقود بحالة ممتازة، لا توجد تنبيهات عاجلة اليوم.</span>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 font-mono bg-white px-2 py-0.5 rounded-md border border-emerald-200">
          منظومة رِواق الذكية
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-rewaq-gold" />
          <span>التنبيهات والملاحظات الذكية (Smart HR Insights)</span>
        </h4>
        <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
          {activeInsights.length} تنبيهات تتطلب الانتباه
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {activeInsights.map((insight) => {
          const isWarning = insight.severity === "WARNING";
          const isCritical = insight.severity === "CRITICAL";

          return (
            <div
              key={insight.id}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                isCritical
                  ? "bg-rose-50/80 border-rose-200 text-rose-950"
                  : isWarning
                  ? "bg-amber-50/80 border-amber-200 text-amber-950"
                  : "bg-blue-50/80 border-blue-200 text-blue-950"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isCritical
                        ? "bg-rose-100 text-rose-600"
                        : isWarning
                        ? "bg-amber-100 text-amber-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {insight.type === "CONTRACT_EXPIRING" ? (
                      <FileCheck className="w-3.5 h-3.5" />
                    ) : insight.type === "PENDING_LEAVE" ? (
                      <Plane className="w-3.5 h-3.5" />
                    ) : insight.type === "PAYROLL_SPIKE" ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span className="font-bold text-xs">{insight.title}</span>
                </div>

                <button
                  onClick={() => dismissInsight(insight.id)}
                  title="تجاهل التنبيه"
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs leading-relaxed text-slate-700 mb-3">{insight.message}</p>

              {insight.actionHref && (
                <div className="pt-2 border-t border-slate-200/50 flex justify-end">
                  <Link
                    href={insight.actionHref}
                    className="inline-flex items-center gap-1 text-[11px] font-black text-slate-900 hover:text-rewaq-gold-dark transition"
                  >
                    <span>{insight.actionLabel || "عرض التفاصيل"}</span>
                    <ArrowLeft className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
