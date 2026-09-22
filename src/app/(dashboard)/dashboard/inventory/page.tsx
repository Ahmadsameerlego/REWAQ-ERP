"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Package,
  Layers,
  TrendingUp,
  ArrowRightLeft,
  ArrowDownLeft,
  ShieldCheck,
  FileCheck,
  History,
  Sparkles,
  DollarSign,
  Store,
  Warehouse as WarehouseIcon,
  ChevronLeft,
  CheckCircle2,
  X,
  Plus
} from "lucide-react";
import {
  useShowroom,
  SmartInsight
} from "@/context/ShowroomContext";

export default function InventoryDashboardPage() {
  const {
    products,
    warehouses,
    stockLevels,
    stockReservations,
    transferOrders,
    receivingOrders,
    stockCounts,
    stockMovements,
    smartInsights,
    applyTransferSuggestion,
    dismissInsight
  } = useShowroom();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getProductStockSummary = (productId: string) => {
    const levels = stockLevels.filter((sl) => sl.productId === productId);
    const onHand = levels.reduce((sum, sl) => sum + sl.onHand, 0);
    const reserved = levels.reduce((sum, sl) => sum + sl.reserved, 0);
    const inTransit = levels.reduce((sum, sl) => sum + sl.inTransit, 0);
    const display = levels.reduce((sum, sl) => sum + sl.display, 0);
    const damaged = levels.reduce((sum, sl) => sum + sl.damaged, 0);
    const available = Math.max(0, onHand - reserved - display - damaged);
    return { onHand, reserved, inTransit, display, damaged, available, levels };
  };

  const totalValuation = useMemo(() => {
    return products.reduce((acc, p) => {
      const summary = getProductStockSummary(p.id);
      return acc + summary.onHand * p.retailPrice;
    }, 0);
  }, [products, stockLevels]);

  const totalOnHand = useMemo(() => stockLevels.reduce((sum, sl) => sum + sl.onHand, 0), [stockLevels]);
  const totalReserved = useMemo(() => stockLevels.reduce((sum, sl) => sum + sl.reserved, 0), [stockLevels]);
  const totalInTransit = useMemo(() => stockLevels.reduce((sum, sl) => sum + sl.inTransit, 0), [stockLevels]);
  const totalAvailable = Math.max(0, totalOnHand - totalReserved);
  const activeInsights = useMemo(() => smartInsights.filter((i) => !i.resolved), [smartInsights]);

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-rewaq-gold/40 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-rewaq-gold" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rewaq-gold/15 text-rewaq-gold-dark border border-rewaq-gold/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              مركز قيادة المخزون المتكامل
            </span>
            <span className="text-xs text-slate-500 font-medium">| التحديث اللحظي لجميع الفروع</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
            لوحة تحكم المخزون والذكاء الاصطناعي
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            رؤية استراتيجية شاملة لقيمة المخزون، توازن الفروع، وتنبؤات الطلب والتوريد.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/dashboard/inventory/transfers"
            className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 text-xs font-black px-3.5 py-2.5 rounded-xl shadow-xs transition"
          >
            <ArrowRightLeft className="w-4 h-4" />
            طلب تحويل فروع
          </Link>
          <Link
            href="/dashboard/inventory/receiving"
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition"
          >
            <ArrowDownLeft className="w-4 h-4" />
            إذن استلام توريد
          </Link>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">إجمالي قيمة المخزون (سعر البيع)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {totalValuation.toLocaleString()} <span className="text-xs text-slate-500 font-normal">ج.م</span>
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>موزعة عبر 4 فروع و 7 مستودعات</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">الفعلي (On Hand)</span>
          <p className="text-xl font-black text-slate-900 mt-1.5 font-mono">{totalOnHand}</p>
          <span className="text-[10px] text-slate-400">إجمالي القطع بالمخازن</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium text-emerald-600">المتاح للبيع (Available)</span>
          <p className="text-xl font-black text-emerald-600 mt-1.5 font-mono">{totalAvailable}</p>
          <span className="text-[10px] text-slate-400">جاهز للتعاقد فوراً</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium text-amber-600">المحجوز (Reserved)</span>
          <p className="text-xl font-black text-amber-600 mt-1.5 font-mono">{totalReserved}</p>
          <span className="text-[10px] text-slate-400">لعقود وعرابين نشطة</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium text-blue-600">بالطريق (In Transit)</span>
          <p className="text-xl font-black text-blue-600 mt-1.5 font-mono">{totalInTransit}</p>
          <span className="text-[10px] text-slate-400">بين الفروع للشحن</span>
        </div>
      </div>

      {/* Quick Navigation Cards Grid */}
      <div>
        <h2 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-rewaq-gold-dark" />
          أقسام موديول المخزون والمستودعات
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              title: "دليل الأصناف والمخزون الفعلي",
              desc: "بطاقات المنتجات والمواصفات وتوزيع القطع في كل مستودع بالباركود.",
              href: "/dashboard/inventory/products",
              icon: Package,
              count: `${products.length} صنف`,
              color: "text-blue-600 bg-blue-50 border-blue-200",
            },
            {
              title: "أوامر التحويل بين الفروع",
              desc: "إدارة دورة شحن وتحويل البضائع بين معارض القاهرة وطنطا ودمياط.",
              href: "/dashboard/inventory/transfers",
              icon: ArrowRightLeft,
              count: `${transferOrders.length} تحويل`,
              color: "text-amber-600 bg-amber-50 border-amber-200",
            },
            {
              title: "أذون الاستلام والتوريدات",
              desc: "استلام شحنات المصانع وفحص مطابقة الكميات ورصد التوالف والتسكين.",
              href: "/dashboard/inventory/receiving",
              icon: ArrowDownLeft,
              count: `${receivingOrders.length} إذن`,
              color: "text-emerald-600 bg-emerald-50 border-emerald-200",
            },
            {
              title: "حجوزات عقود المبيعات والعملاء",
              desc: "الحجوزات الآلية المرتبطة بالعقود وعرابين العملاء ومواعيد التسليم.",
              href: "/dashboard/inventory/reservations",
              icon: ShieldCheck,
              count: `${stockReservations.filter((r) => r.status === "ACTIVE").length} حجز نشط`,
              color: "text-purple-600 bg-purple-50 border-purple-200",
            },
            {
              title: "الجرد الدوري والتسويات",
              desc: "جلسات الجرد ومطابقة الفعلي مع الدفتري واعتماد فروقات الجرد.",
              href: "/dashboard/inventory/stock-count",
              icon: FileCheck,
              count: `${stockCounts.length} جلسات`,
              color: "text-indigo-600 bg-indigo-50 border-indigo-200",
            },
            {
              title: "سجل حركات المخزون (Ledger)",
              desc: "دفتر الأستاذ للحركات غير القابل للتعديل لتدقيق كل عمليات الصرف والإضافة.",
              href: "/dashboard/inventory/movements",
              icon: History,
              count: `${stockMovements.length} حركة`,
              color: "text-slate-700 bg-slate-100 border-slate-200",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-rewaq-gold hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold border ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {item.count}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-3 group-hover:text-rewaq-gold-dark transition">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-slate-950">
                  <span>فتح الصفحة المخصصة</span>
                  <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:translate-x-[-2px] transition" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* AI Smart Inventory Insights Panel */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-rewaq-dark text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-rewaq-gold/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rewaq-gold/20 border border-rewaq-gold/40 text-rewaq-gold flex items-center justify-center">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">مركز توصيات الذكاء الاصطناعي للمخزون (Rewaq AI)</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
                  تحليل لحظي نشط
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                اكتشاف تلقائي لتوازن الفروع، توقعات نفاد المخزون، وحلول لتفادي تعطل المبيعات
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono">{activeInsights.length} توصيات ذات أولوية</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 relative z-10">
          {activeInsights.map((insight) => {
            return (
              <div
                key={insight.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between transition hover:border-slate-600 ${
                  insight.severity === "CRITICAL"
                    ? "bg-rose-950/20 border-rose-800/40"
                    : insight.severity === "WARNING"
                    ? "bg-amber-950/20 border-amber-800/40"
                    : "bg-blue-950/20 border-blue-800/40"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        insight.severity === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : insight.severity === "WARNING"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}
                    >
                      {insight.type === "TRANSFER_SUGGESTION"
                        ? "موازنة مخزون بين الفروع"
                        : insight.type === "LOW_STOCK"
                        ? "تنبؤ بنفاد المخزون"
                        : insight.type === "SLOW_MOVING"
                        ? "تنبيه ركود صنف"
                        : "تنبيه مخزني"}
                    </span>
                    {insight.relatedProductName && (
                      <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                        {insight.relatedProductName}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white mt-2.5 leading-snug">
                    {insight.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    {insight.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (insight.type === "TRANSFER_SUGGESTION") {
                        applyTransferSuggestion(insight.id);
                        triggerToast("✅ تم إنشاء أمر التحويل بين الفروع بنجاح!");
                      } else {
                        dismissInsight(insight.id);
                        triggerToast("✅ تم اعتماد التوصية!");
                      }
                    }}
                    className="flex-1 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 text-xs font-black py-2 px-3 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {insight.actionLabel || "تطبيق التوصية فوراً"}
                  </button>
                  <button
                    type="button"
                    onClick={() => dismissInsight(insight.id)}
                    className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 text-xs"
                    title="تجاهل"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Warehouses Summary Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Store className="w-4 h-4 text-rewaq-gold-dark" />
            توزيع المخزون الفعلي بحسب الفروع والمستودعات
          </h2>
          <span className="text-xs text-slate-500">{warehouses.length} مستودعات متصلة</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {warehouses.map((wh) => {
            const whLevels = stockLevels.filter((sl) => sl.warehouseId === wh.id);
            const whOnHand = whLevels.reduce((s, l) => s + l.onHand, 0);
            const whReserved = whLevels.reduce((s, l) => s + l.reserved, 0);
            const whAvailable = Math.max(
              0,
              whLevels.reduce((s, l) => s + (l.onHand - l.reserved - l.display - l.damaged), 0)
            );
            return (
              <div key={wh.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                      <WarehouseIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{wh.name}</p>
                      <p className="text-[10px] text-slate-400">{wh.branchName}</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 font-mono text-slate-600">
                    {wh.code}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                  <div>
                    <p className="text-[10px] text-slate-400">الفعلي</p>
                    <p className="text-xs font-black text-slate-800 font-mono">{whOnHand}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">محجوز</p>
                    <p className="text-xs font-black text-amber-600 font-mono">{whReserved}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">متاح</p>
                    <p className="text-xs font-black text-emerald-600 font-mono">{whAvailable}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
