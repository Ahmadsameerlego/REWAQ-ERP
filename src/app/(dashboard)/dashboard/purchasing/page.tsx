"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  Building,
  ArrowRight,
  ArrowDownLeft,
  Scale,
  Plus,
  Search,
  Eye,
  RotateCcw,
  Layers,
  ChevronLeft,
} from "lucide-react";
import PurchasingNav from "@/components/purchasing/PurchasingNav";
import { usePurchasing } from "@/context/PurchasingContext";
import { formatEGP } from "@/lib/accountingEngine";
import CreatePurchaseOrderModal from "@/components/purchasing/CreatePurchaseOrderModal";
import CreatePurchaseRequestModal from "@/components/purchasing/CreatePurchaseRequestModal";
import CreateSupplierModal from "@/components/purchasing/CreateSupplierModal";
import SupplierPriceCompareModal from "@/components/purchasing/SupplierPriceCompareModal";
import ThreeWayMatchModal from "@/components/purchasing/ThreeWayMatchModal";
import { PurchaseOrder } from "@/types/purchasing";

export default function PurchasingDashboardPage() {
  const {
    metrics,
    suggestions,
    purchaseOrders,
    purchaseRequests,
    suppliers,
    receivings,
    approvePurchaseOrder,
  } = usePurchasing();

  const [isCreatePoOpen, setIsCreatePoOpen] = useState(false);
  const [isCreatePrOpen, setIsCreatePrOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [selectedMatchPO, setSelectedMatchPO] = useState<PurchaseOrder | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  const filteredPOs = purchaseOrders.filter(
    (po) =>
      po.poNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      po.items.some((i) => i.productName.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const pendingApprovals = purchaseOrders.filter((po) => po.status === "PENDING_APPROVAL");
  const delayedOrders = purchaseOrders.filter(
    (po) =>
      (po.status === "SENT" || po.status === "PARTIAL_RECEIVED") &&
      po.expectedDeliveryDate < new Date().toISOString().split("T")[0]
  );

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <PurchasingNav
        onOpenCreatePO={() => setIsCreatePoOpen(true)}
        onOpenCreatePR={() => setIsCreatePrOpen(true)}
        onOpenAddSupplier={() => setIsAddSupplierOpen(true)}
      />

      {/* Main Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-rewaq-gold" />
              إدارة التوريدات والمشتريات الذكية لمعارض الأثاث
            </span>
            <span className="text-xs text-slate-500 font-medium">| السوق المصري</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
            مركز متابعة المشتريات والموردين والتنبؤ بالاحتياجات
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ربط مباشر بين حجوزات عقود المبيعات ↔ تنبيهات نواقص المخزون ↔ أوامر التوريد ↔ استلام البضائع ↔ قيود الحسابات.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/dashboard/purchasing/planning"
            className="inline-flex items-center gap-1.5 bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition"
          >
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span>تخطيط الاحتياجات ({suggestions.length} اقتراح)</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsCreatePoOpen(true)}
            className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>أمر شراء جديد</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Monthly Purchase Value */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">مشتريات الشهر الحالي</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatEGP(metrics.totalPurchasesThisMonth)}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <span>إجمالي {metrics.totalOrdersThisMonth} أمر شراء صادر للمصانع</span>
          </div>
        </div>

        {/* 2. Pending Approvals */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">أوامر بانتظار الاعتماد</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {metrics.pendingApprovalCount}{" "}
            <span className="text-xs font-normal text-slate-500">أوامر</span>
          </div>
          <div className="text-[11px] text-amber-700 font-bold">
            بقيمة: {formatEGP(metrics.pendingApprovalValue)}
          </div>
        </div>

        {/* 3. Outstanding Payables */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي مستحقات الموردين</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-950 font-mono">
            {formatEGP(metrics.outstandingPayables)}
          </div>
          <div className="text-[11px] text-slate-500">
            رصيد حساب دائنون وموردون (2010)
          </div>
        </div>

        {/* 4. Shortages & Contract Risk */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">نواقص المخزون المؤثرة</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700 font-mono">
            {metrics.reservedItemsUnderShortage}{" "}
            <span className="text-xs font-normal text-slate-500">تهدد عقود بيع</span>
          </div>
          <div className="text-[11px] text-rose-600 font-bold">
            + {metrics.lowStockItemsCount} صنف تحت حد الأمان
          </div>
        </div>
      </div>

      {/* Smart Insights & Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Smart Insights Cards */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white p-5 rounded-3xl border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rewaq-gold/20 border border-rewaq-gold/40 flex items-center justify-center text-rewaq-gold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">
                  رؤى وتوصيات المشتريات الذكية (Procurement Insights)
                </h3>
                <p className="text-[10px] text-slate-400">
                  تحليل لحظي لحركة البيع، الحجوزات المؤكدة، وأسعار الموردين
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/purchasing/planning"
              className="text-xs text-rewaq-gold hover:underline flex items-center gap-1 font-bold"
            >
              <span>عرض كافة الاقتراحات</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {/* Insight 1: Shortage for contracts */}
            <div className="bg-slate-800/80 border border-amber-500/30 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-lg">⚠️</span>
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-amber-300">
                    صوفا فيرونا الفاخرة: المخزون الحالي لا يغطي العقود المؤكدة
                  </p>
                  <p className="text-[11px] text-slate-300">
                    المتاح 3 وحدات فقط بينما المحجوز لعقود وشيكة 4 وحدات. يُتوقع احتياج 15 وحدة خلال الشهر القادم بناءً على معدل المبيعات.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatePoOpen(true)}
                className="bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl shrink-0 transition cursor-pointer"
              >
                طلب 15 وحدة فوراً
              </button>
            </div>

            {/* Insight 2: Best supplier price */}
            <div className="bg-slate-800/80 border border-emerald-500/30 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-lg">💡</span>
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-emerald-300">
                    فرصة وفر: مصنع رِواق بدمياط يقدم سعراً أقل بـ 1,300 ج.م للصوفا
                  </p>
                  <p className="text-[11px] text-slate-300">
                    سعر التوريد 18,500 ج.م مقارنة بـ 19,800 ج.م لدى الموردين البدلاء مع التزام تسليم بنسبة 96%.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCompareOpen(true)}
                className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl shrink-0 transition cursor-pointer"
              >
                مقارنة الموردين
              </button>
            </div>

            {/* Insight 3: Delayed PO alert */}
            {delayedOrders.length > 0 && (
              <div className="bg-slate-800/80 border border-rose-500/30 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-lg">🚨</span>
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-rose-300">
                      أمر التوريد #{delayedOrders[0].poNumber} متأخر عن موعد التسليم المتوقع
                    </p>
                    <p className="text-[11px] text-slate-300">
                      المورد: {delayedOrders[0].supplierName} | كان متوقعاً بتاريخ {delayedOrders[0].expectedDeliveryDate}.
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/purchasing/orders"
                  className="bg-rose-950 hover:bg-rose-900 border border-rose-600 text-rose-200 text-xs font-bold px-3.5 py-2 rounded-xl shrink-0 transition text-center"
                >
                  متابعة الشحنة
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Quick Actions & Supplier Summary */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2">
              الإجراءات السريعة (Quick Actions):
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsCreatePrOpen(true)}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-right space-y-1 transition cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4 text-blue-600" />
                <p className="text-xs font-bold">طلب شراء جديد</p>
                <span className="text-[10px] text-slate-400 block">للاعتماد الداخلي</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCreatePoOpen(true)}
                className="p-3 rounded-2xl bg-amber-50/60 hover:bg-amber-100/60 border border-amber-200 text-amber-950 text-right space-y-1 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-700" />
                <p className="text-xs font-bold">أمر توريد مباشر</p>
                <span className="text-[10px] text-amber-800/70 block">إلى المصنع</span>
              </button>

              <Link
                href="/dashboard/purchasing/receiving"
                className="p-3 rounded-2xl bg-emerald-50/60 hover:bg-emerald-100/60 border border-emerald-200 text-emerald-950 text-right space-y-1 transition"
              >
                <ArrowDownLeft className="w-4 h-4 text-emerald-700" />
                <p className="text-xs font-bold">استلام وتسكين</p>
                <span className="text-[10px] text-emerald-800/70 block">تحديث المخزون</span>
              </Link>

              <button
                type="button"
                onClick={() => setIsAddSupplierOpen(true)}
                className="p-3 rounded-2xl bg-purple-50/60 hover:bg-purple-100/60 border border-purple-200 text-purple-950 text-right space-y-1 transition cursor-pointer"
              >
                <Building className="w-4 h-4 text-purple-700" />
                <p className="text-xs font-bold">إضافة مورد</p>
                <span className="text-[10px] text-purple-800/70 block">سجل تجاري وبطاقة</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">الموردين النشطين:</span>
              <span className="font-mono font-black text-slate-900">{metrics.activeSuppliersCount} موردين</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">أوامر في الطريق:</span>
              <span className="font-mono font-black text-blue-700">{metrics.orderedInTransitCount} شحنات</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">استلام جزئي مفتوح:</span>
              <span className="font-mono font-black text-amber-700">{metrics.partiallyReceivedCount} أوامر</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Purchase Orders Table Section */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900">
              أوامر الشراء والتوريد الحديثة (Active Purchase Orders)
            </h2>
            <p className="text-xs text-slate-500">
              متابعة مراحل كل أمر: الصياغة → الاعتماد → الإرسال → الاستلام بالمستودع → الفاتورة والمطابقة
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="بحث برقم الأمر، المورد، أو الموديل..."
                className="w-64 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 pr-8 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rewaq-gold"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>

            <Link
              href="/dashboard/purchasing/orders"
              className="text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition"
            >
              عرض الكل ({purchaseOrders.length})
            </Link>
          </div>
        </div>

        {/* Orders Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">رقم الأمر (PO)</th>
                <th className="p-3">المورد / المصنع</th>
                <th className="p-3">الفرع والمستودع</th>
                <th className="p-3">تاريخ التسليم المتوقع</th>
                <th className="p-3 text-center">الكمية (مطلوب/مستلم)</th>
                <th className="p-3">القيمة الإجمالية (شامل 14%)</th>
                <th className="p-3 text-center">الحالة</th>
                <th className="p-3 text-center">المطابقة 3-Way</th>
                <th className="p-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPOs.map((po) => {
                const totalQty = po.items.reduce((sum, it) => sum + it.quantity, 0);
                const receivedQty = po.items.reduce((sum, it) => sum + it.receivedQuantity, 0);

                let statusBadge = (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    مسودة
                  </span>
                );

                if (po.status === "PENDING_APPROVAL") {
                  statusBadge = (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      ⏳ بانتظار الاعتماد
                    </span>
                  );
                } else if (po.status === "APPROVED") {
                  statusBadge = (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                      معتمد
                    </span>
                  );
                } else if (po.status === "SENT") {
                  statusBadge = (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                      📦 مرسل للمورد
                    </span>
                  );
                } else if (po.status === "PARTIAL_RECEIVED") {
                  statusBadge = (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      استلام جزئي ({receivedQty}/{totalQty})
                    </span>
                  );
                } else if (po.status === "FULLY_RECEIVED") {
                  statusBadge = (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                      ✅ تم الاستلام بالكامل
                    </span>
                  );
                }

                return (
                  <tr key={po.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-slate-900">
                      {po.poNumber}
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{po.supplierName}</p>
                      <span className="text-[10px] text-slate-400">
                        {po.items.map((i) => i.productName).join("، ")}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">
                      {po.branchName} - {po.warehouseName}
                    </td>
                    <td className="p-3 font-mono text-slate-700">
                      {po.expectedDeliveryDate}
                    </td>
                    <td className="p-3 text-center font-mono">
                      <span className="font-bold text-slate-900">{receivedQty}</span>
                      <span className="text-slate-400"> / {totalQty}</span>
                    </td>
                    <td className="p-3 font-bold font-mono text-slate-900">
                      {formatEGP(po.grandTotal)}
                    </td>
                    <td className="p-3 text-center">{statusBadge}</td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedMatchPO(po)}
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full cursor-pointer transition ${
                          po.matchingStatus === "DISCREPANCY"
                            ? "bg-rose-100 text-rose-900 hover:bg-rose-200 border border-rose-300"
                            : po.matchingStatus === "MATCHED"
                            ? "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {po.matchingStatus === "DISCREPANCY"
                          ? "⚠️ عدم تطابق"
                          : po.matchingStatus === "MATCHED"
                          ? "✅ متطابق"
                          : "فحص 3-Way"}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {po.status === "PENDING_APPROVAL" && (
                          <button
                            type="button"
                            onClick={() => approvePurchaseOrder(po.id, "أحمد سمير")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg transition"
                          >
                            اعتماد
                          </button>
                        )}
                        <Link
                          href={`/dashboard/purchasing/orders?id=${po.id}`}
                          className="p-1 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {isCreatePoOpen && (
        <CreatePurchaseOrderModal
          isOpen={isCreatePoOpen}
          onClose={() => setIsCreatePoOpen(false)}
        />
      )}

      {isCreatePrOpen && (
        <CreatePurchaseRequestModal
          isOpen={isCreatePrOpen}
          onClose={() => setIsCreatePrOpen(false)}
        />
      )}

      {isAddSupplierOpen && (
        <CreateSupplierModal
          isOpen={isAddSupplierOpen}
          onClose={() => setIsAddSupplierOpen(false)}
        />
      )}

      {isCompareOpen && (
        <SupplierPriceCompareModal
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
        />
      )}

      {selectedMatchPO && (
        <ThreeWayMatchModal
          isOpen={!!selectedMatchPO}
          onClose={() => setSelectedMatchPO(null)}
          purchaseOrder={selectedMatchPO}
        />
      )}
    </div>
  );
}
