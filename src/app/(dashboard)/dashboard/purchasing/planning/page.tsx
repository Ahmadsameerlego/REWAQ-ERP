"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  AlertTriangle,
  Package,
  ShoppingCart,
  Plus,
  Scale,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Clock,
  ShieldAlert,
  Building,
  Filter,
} from "lucide-react";
import PurchasingNav from "@/components/purchasing/PurchasingNav";
import { usePurchasing } from "@/context/PurchasingContext";
import { useShowroom } from "@/context/ShowroomContext";
import { formatEGP } from "@/lib/accountingEngine";
import CreatePurchaseOrderModal from "@/components/purchasing/CreatePurchaseOrderModal";
import CreatePurchaseRequestModal from "@/components/purchasing/CreatePurchaseRequestModal";
import SupplierPriceCompareModal from "@/components/purchasing/SupplierPriceCompareModal";
import { SmartPurchaseSuggestion } from "@/types/purchasing";

export default function PurchasePlanningPage() {
  const { suggestions, createPurchaseOrder } = usePurchasing();
  const { products } = useShowroom();

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("ALL");
  const [activeSuggestionForPO, setActiveSuggestionForPO] = useState<SmartPurchaseSuggestion | null>(null);
  const [compareProductId, setCompareProductId] = useState<string | null>(null);
  const [isSuccessToast, setIsSuccessToast] = useState<string | null>(null);

  const categories = Array.from(new Set(suggestions.map((s) => s.category)));

  const filteredSuggestions = suggestions.filter((s) => {
    const matchesCat = selectedCategory === "ALL" || s.category === selectedCategory;
    const matchesUrgency = urgencyFilter === "ALL" || s.urgency === urgencyFilter;
    return matchesCat && matchesUrgency;
  });

  const handleQuickCreatePO = (sug: SmartPurchaseSuggestion) => {
    setActiveSuggestionForPO(sug);
  };

  return (
    <div className="space-y-6">
      <PurchasingNav />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 text-white p-6 rounded-3xl border border-purple-800/40 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-[11px] font-black bg-purple-500/20 text-purple-300 border border-purple-400/40 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rewaq-gold" />
              محرك التنبؤ بالاحتياج ومصفوفة الشراء الذكية
            </span>
            <span className="text-xs text-slate-400">| عقود ومخزون معارض الأثاث</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white mt-1">
            تخطيط المشتريات والطلبات المقترحة (Smart Purchase Planning)
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            النظام يحلل المخزون المتاح، الحجوزات المؤكدة للعقود، معدل السحب الشهري، وأوامر الشراء المفتوحة، ويقترح عليك الكمية والمورد الأنسب مع بيان السبب الفعلي.
          </p>
        </div>

        <div className="bg-slate-800/80 border border-purple-400/30 p-4 rounded-2xl text-center shrink-0">
          <span className="text-[11px] text-purple-300 block font-bold">إجمالي المقترحات النشطة</span>
          <span className="text-2xl font-black text-rewaq-gold font-mono">
            {suggestions.length}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {suggestions.filter((s) => s.urgency === "CRITICAL").length} أصناف في حالة حرجة
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold ml-2">
            <Filter className="w-3.5 h-3.5" />
            تصفية حسب:
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-rewaq-gold"
          >
            <option value="ALL">جميع الأقسام والغرف</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Urgency Filter */}
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-rewaq-gold"
          >
            <option value="ALL">كل درجات الاستعجال</option>
            <option value="CRITICAL">🔴 حرج (عقود بدون رصيد كافٍ)</option>
            <option value="HIGH">🟠 هام (وصل لحد إعادة الطلب)</option>
            <option value="MEDIUM">🟡 متوسط (تأمين المخزون الشهري)</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-bold">
          يعرض <span className="text-slate-900 font-black">{filteredSuggestions.length}</span> من أصل{" "}
          {suggestions.length} صنف مقترح
        </div>
      </div>

      {/* Suggestions Cards Grid */}
      <div className="space-y-4">
        {filteredSuggestions.map((sug) => {
          let urgencyBadge = (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-200">
              متوسط الأولوية
            </span>
          );

          if (sug.urgency === "CRITICAL") {
            urgencyBadge = (
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-950 border border-rose-300 flex items-center gap-1 animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                ⚠️ حرج: يهدد تسليم عقود مؤكدة
              </span>
            );
          } else if (sug.urgency === "HIGH") {
            urgencyBadge = (
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-950 border border-amber-300">
                🟠 تحت حد الأمان (Reorder Point)
              </span>
            );
          }

          return (
            <div
              key={sug.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition"
            >
              {/* Top Row: Title, Urgency, Category */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-black text-slate-900">{sug.productName}</h3>
                    <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-lg font-bold">
                      {sug.category}
                    </span>
                    {urgencyBadge}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{sug.primaryReason}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCompareProductId(sug.productId)}
                    className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>مقارنة الموردين</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickCreatePO(sug)}
                    className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إنشاء أمر شراء ({sug.suggestedOrderQty} وحدة)</span>
                  </button>
                </div>
              </div>

              {/* Middle Row: Inventory Equation Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 block">المتاح الفعلي (Available)</span>
                  <span
                    className={`font-mono font-black text-sm ${
                      sug.currentAvailableStock <= 2 ? "text-rose-700" : "text-slate-900"
                    }`}
                  >
                    {sug.currentAvailableStock} وحدة
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 block">المحجوز لعقود (Reserved)</span>
                  <span className="font-mono font-black text-sm text-purple-900">
                    {sug.reservedStockForContracts} وحدة
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 block">طلبيات مفتوحة (Open PO)</span>
                  <span className="font-mono font-bold text-sm text-blue-700">
                    {sug.openPoQuantity} وحدة
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 block">متوسط البيع الشهري</span>
                  <span className="font-mono font-bold text-sm text-slate-800">
                    {sug.averageMonthlySales} وحدة / شهر
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 block">فترة التوريد (Lead Time)</span>
                  <span className="font-mono font-bold text-sm text-slate-800">
                    {sug.leadTimeDays} يوم
                  </span>
                </div>

                <div className="space-y-1 bg-amber-50 p-2 rounded-xl border border-amber-200/60">
                  <span className="text-[10px] text-amber-900 font-black block">الكمية المقترحة</span>
                  <span className="font-mono font-black text-sm text-amber-950">
                    💡 {sug.suggestedOrderQty} وحدة
                  </span>
                </div>
              </div>

              {/* Bottom Row: Recommendation Rationale & Recommended Supplier */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-900 text-white p-3.5 rounded-2xl">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-rewaq-gold font-black text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>تفسير الاقتراح والخوارزمية:</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{sug.whyExplanation}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 block">المورد الموصى به:</span>
                    <strong className="text-white text-xs">{sug.recommendedSupplierName}</strong>
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 block">التكلفة الإجمالية المقدرة:</span>
                    <strong className="text-rewaq-gold font-mono text-xs">
                      {formatEGP(sug.estimatedTotalCost)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {activeSuggestionForPO && (
        <CreatePurchaseOrderModal
          isOpen={!!activeSuggestionForPO}
          onClose={() => setActiveSuggestionForPO(null)}
          prefillSupplierId={activeSuggestionForPO.recommendedSupplierId}
          prefillItems={[
            {
              productId: activeSuggestionForPO.productId,
              quantity: activeSuggestionForPO.suggestedOrderQty,
            },
          ]}
        />
      )}

      {compareProductId && (
        <SupplierPriceCompareModal
          isOpen={!!compareProductId}
          onClose={() => setCompareProductId(null)}
          productId={compareProductId}
          onSelectSupplier={(supId, price) => {
            const sug = suggestions.find((s) => s.productId === compareProductId);
            if (sug) {
              setActiveSuggestionForPO(sug);
            }
          }}
        />
      )}
    </div>
  );
}
