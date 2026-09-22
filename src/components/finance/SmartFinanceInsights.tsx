"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  AlertTriangle,
  Info,
  ArrowLeft,
  CheckCircle2,
  X,
  TrendingUp,
  Wallet,
  Calendar,
  Building2,
} from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { SmartFinanceInsight } from "@/types/finance";

interface SmartFinanceInsightsProps {
  maxItems?: number;
  showDismiss?: boolean;
}

export default function SmartFinanceInsights({
  maxItems = 4,
  showDismiss = true,
}: SmartFinanceInsightsProps) {
  const { insights, dismissInsight } = useFinance();
  const activeInsights = insights.filter((i) => !i.resolved).slice(0, maxItems);

  if (activeInsights.length === 0) {
    return (
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-emerald-950">جميع المؤشرات المالية متوازنة</h4>
            <p className="text-[11px] text-emerald-700">لا توجد شذوذات في المصروفات أو متأخرات حرجة تتطلب تدخلاً فورياً.</p>
          </div>
        </div>
      </div>
    );
  }

  const getSeverityStyle = (severity: SmartFinanceInsight["severity"]) => {
    switch (severity) {
      case "HIGH":
        return {
          bg: "bg-rose-50 border-rose-200 text-rose-950",
          badge: "bg-rose-100 text-rose-800 border border-rose-200",
          icon: <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />,
          whyBadge: "bg-rose-100/70 text-rose-900 border-rose-200",
        };
      case "MEDIUM":
        return {
          bg: "bg-amber-50 border-amber-200 text-amber-950",
          badge: "bg-amber-100 text-amber-900 border border-amber-200",
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
          whyBadge: "bg-amber-100/70 text-amber-900 border-amber-200",
        };
      case "INFO":
      default:
        return {
          bg: "bg-blue-50 border-blue-200 text-blue-950",
          badge: "bg-blue-100 text-blue-900 border border-blue-200",
          icon: <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />,
          whyBadge: "bg-blue-100/70 text-blue-900 border-blue-200",
        };
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rewaq-gold/15 text-rewaq-gold-dark flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">تنبيهات ورؤى الذكاء المالي (Smart Financial Insights)</h3>
            <p className="text-[11px] text-slate-500">تحليلات لحظية تشرح الأسباب بدقة ومبنية على بيانات حركة رِواق الفعلية</p>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
          {activeInsights.length} تنبيهات نشطة
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {activeInsights.map((insight) => {
          const style = getSeverityStyle(insight.severity);
          return (
            <div
              key={insight.id}
              className={`rounded-2xl border p-4 transition-all hover:shadow-xs relative ${style.bg}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white/80 shadow-2xs">
                    {style.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-tight">
                      {insight.title}
                    </h4>
                    <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>

                {showDismiss && (
                  <button
                    onClick={() => dismissInsight(insight.id)}
                    aria-label="إغلاق التنبيه"
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-white/60 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* The "Why" reasoning box */}
              <div className={`mt-3 p-2.5 rounded-xl border text-[11px] ${style.whyBadge}`}>
                <div className="flex items-center gap-1 font-bold text-slate-900 mb-0.5">
                  <Info className="w-3 h-3 text-slate-700 shrink-0" />
                  <span>السبب والتحليل المالي:</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-normal">
                  {insight.whyExplanation}
                </p>
              </div>

              {/* Action Link */}
              {insight.actionLabel && insight.actionHref && (
                <div className="mt-3 flex justify-end">
                  <Link
                    href={insight.actionHref}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-slate-900 hover:text-rewaq-gold-dark bg-white/90 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-white transition"
                  >
                    <span>{insight.actionLabel}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
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
