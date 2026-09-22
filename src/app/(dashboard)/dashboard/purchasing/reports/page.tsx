"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Building,
  DollarSign,
  PieChart,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Package,
} from "lucide-react";
import PurchasingNav from "@/components/purchasing/PurchasingNav";
import { usePurchasing } from "@/context/PurchasingContext";
import { formatEGP } from "@/lib/accountingEngine";

export default function PurchasingReportsPage() {
  const { suppliers, supplierProducts, purchaseOrders, receivings, metrics } = usePurchasing();

  const [period, setPeriod] = useState("CURRENT_MONTH");

  // Supplier purchase totals
  const supplierSpending = suppliers.map((sup) => {
    const orders = purchaseOrders.filter((po) => po.supplierId === sup.id);
    const total = orders.reduce((sum, po) => sum + po.grandTotal, 0);
    return {
      supplierId: sup.id,
      supplierName: sup.nameAr,
      category: sup.category,
      orderCount: orders.length,
      totalSpent: total,
      onTimeRate: sup.performance.onTimeDeliveryRate,
    };
  }).sort((a, b) => b.totalSpent - a.totalSpent);

  // Price changes tracker
  const priceIncreases = supplierProducts.filter((sp) => sp.lastPrice && sp.purchasePrice > sp.lastPrice);

  return (
    <div className="space-y-6">
      <PurchasingNav />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>المشتريات</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">التقارير وتحليلات التكاليف</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">
            تحليلات المشتريات ومؤشرات تكاليف وتضخم الخامات
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            توزيع النفقات على المصانع، تتبع تغيرات أسعار الخشب والأقمشة، ومعدلات كفاءة الاستلام والتوريد.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-rewaq-gold"
          >
            <option value="CURRENT_MONTH">الشهر الحالي (سبتمبر 2026)</option>
            <option value="LAST_QUARTER">الربع الثالث 2026 (Q3)</option>
            <option value="YEAR_TO_DATE">من بداية العام 2026 (YTD)</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">إجمالي قيمة التوريدات</span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatEGP(metrics.totalPurchasesThisMonth)}
          </div>
          <span className="text-[10px] text-slate-400">عبر كافة الفروع والمستودعات</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">متوسط قيمة أمر الشراء</span>
          <div className="text-2xl font-black text-blue-700 font-mono">
            {formatEGP(metrics.totalPurchasesThisMonth / (metrics.totalOrdersThisMonth || 1))}
          </div>
          <span className="text-[10px] text-slate-400">لكل أمر توريد صادر</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">معدل الالتزام بالمواعيد</span>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            94.2%
          </div>
          <span className="text-[10px] text-emerald-700">التزام المصانع بالجدول الزمني</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">أصناف شهدت زيادة في السعر</span>
          <div className="text-2xl font-black text-amber-600 font-mono">
            {priceIncreases.length}{" "}
            <span className="text-xs font-normal text-slate-500">أصناف</span>
          </div>
          <span className="text-[10px] text-amber-700">تغيرات خامات مؤخراً</span>
        </div>
      </div>

      {/* Supplier Spending Matrix */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-black text-slate-900">
          توزيع المشتريات والإنفاق حسب المورد / المصنع:
        </h2>

        <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
          <table className="w-full text-right">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">المورد</th>
                <th className="p-3">نشاط التوريد</th>
                <th className="p-3 text-center">عدد الأوامر</th>
                <th className="p-3">إجمالي قيمة المسحوبات</th>
                <th className="p-3 text-center">معدل الالتزام بالمواعيد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {supplierSpending.map((sup, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{sup.supplierName}</td>
                  <td className="p-3 text-slate-600">{sup.category}</td>
                  <td className="p-3 text-center font-mono font-bold">{sup.orderCount}</td>
                  <td className="p-3 font-mono font-black text-slate-900">
                    {formatEGP(sup.totalSpent)}
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {sup.onTimeRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Material Inflation & Price Increase Alerts */}
      {priceIncreases.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-300/80 rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-950 font-black text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>تنبيهات حركة أسعار الشراء وتضخم الخامات (Price Trend Alerts):</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {priceIncreases.map((sp) => {
              const diff = sp.purchasePrice - (sp.lastPrice || sp.purchasePrice);
              const percent = ((diff / (sp.lastPrice || 1)) * 100).toFixed(1);

              return (
                <div key={sp.id} className="bg-white p-3.5 rounded-2xl border border-amber-200 space-y-1 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{sp.productName}</span>
                    <span className="text-amber-800 font-mono font-black">+{percent}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>المورد: {sp.supplierName}</span>
                    <span>
                      من {formatEGP(sp.lastPrice || 0)} ← <strong>{formatEGP(sp.purchasePrice)}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
