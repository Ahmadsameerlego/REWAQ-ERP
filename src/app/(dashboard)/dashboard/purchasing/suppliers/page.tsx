"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Star,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Package,
  ArrowRight,
  Eye,
  ShieldCheck,
  Edit3,
} from "lucide-react";
import PurchasingNav from "@/components/purchasing/PurchasingNav";
import { usePurchasing } from "@/context/PurchasingContext";
import { formatEGP } from "@/lib/accountingEngine";
import CreateSupplierModal from "@/components/purchasing/CreateSupplierModal";
import CreatePurchaseOrderModal from "@/components/purchasing/CreatePurchaseOrderModal";
import SupplierPriceCompareModal from "@/components/purchasing/SupplierPriceCompareModal";
import { Supplier, SupplierProduct } from "@/types/purchasing";

export default function SuppliersManagementPage() {
  const {
    suppliers,
    supplierProducts,
    purchaseOrders,
    supplierInvoices,
    updateSupplierProductPrice,
  } = usePurchasing();

  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "PRODUCTS" | "ORDERS" | "PERFORMANCE" | "FINANCIAL">("OVERVIEW");
  const [createPoForSupplierId, setCreatePoForSupplierId] = useState<string | null>(null);

  // Price edit inline modal state
  const [editingSp, setEditingSp] = useState<SupplierProduct | null>(null);
  const [newSpPrice, setNewSpPrice] = useState<number>(0);

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery)
  );

  const activeSupplier = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];

  const activeSupplierProducts = supplierProducts.filter(
    (sp) => sp.supplierId === activeSupplier?.id
  );

  const activeSupplierOrders = purchaseOrders.filter(
    (po) => po.supplierId === activeSupplier?.id
  );

  const activeSupplierInvoices = supplierInvoices.filter(
    (inv) => inv.supplierId === activeSupplier?.id
  );

  const handleSavePrice = () => {
    if (!editingSp || newSpPrice <= 0) return;
    updateSupplierProductPrice(editingSp.id, newSpPrice, "أحمد سمير (المدير العام)");
    setEditingSp(null);
  };

  return (
    <div className="space-y-6">
      <PurchasingNav onOpenAddSupplier={() => setIsAddSupplierOpen(true)} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>المشتريات</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">دليل الموردين والمصانع (360° Profile)</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">
            دليل الموردين وملفات الأداء والمصفوفة السعرية
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            إدارة شاملة لبيانات المصانع، سجل التوريدات، كتالوج المنتجات والأسعار، ومؤشرات الالتزام بالمواعيد والجودة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddSupplierOpen(true)}
            className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ إضافة مورد جديد</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Left Supplier List, Right 360 Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Suppliers List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، الكود، الهاتف، أو المدينة..."
              className="w-full bg-white border border-slate-200 rounded-2xl px-3 py-2 pr-9 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rewaq-gold shadow-2xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>

          <div className="space-y-2 max-h-[750px] overflow-y-auto custom-scrollbar">
            {filteredSuppliers.map((sup) => {
              const isSelected = sup.id === activeSupplier?.id;

              return (
                <div
                  key={sup.id}
                  onClick={() => setSelectedSupplierId(sup.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer text-right space-y-2 ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-800 shadow-md ring-2 ring-rewaq-gold/40"
                      : "bg-white text-slate-900 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                        isSelected ? "bg-slate-800 text-rewaq-gold" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {sup.code}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        sup.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {sup.status === "ACTIVE" ? "نشط" : "غير نشط"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-black leading-tight">{sup.nameAr}</h3>
                    <p className={`text-[11px] mt-0.5 ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                      {sup.contactPerson} ({sup.city})
                    </p>
                  </div>

                  <div
                    className={`flex items-center justify-between text-[11px] pt-2 border-t ${
                      isSelected ? "border-slate-800 text-slate-300" : "border-slate-100 text-slate-600"
                    }`}
                  >
                    <span>الرصيد المستحق له:</span>
                    <strong
                      className={`font-mono font-bold ${
                        sup.balance > 0 ? "text-amber-500" : isSelected ? "text-slate-400" : "text-slate-900"
                      }`}
                    >
                      {formatEGP(sup.balance)}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Supplier 360° Profile (8 Cols) */}
        {activeSupplier && (
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6">
            {/* Top Profile Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-rewaq-gold flex items-center justify-center font-black text-lg shadow-sm">
                  {activeSupplier.nameAr.slice(0, 2)}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-900">
                      {activeSupplier.nameAr}
                    </h2>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                      {activeSupplier.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {activeSupplier.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {activeSupplier.city}
                    </span>
                    <span>س.ت: {activeSupplier.commercialRegistration || "غير مسجل"}</span>
                    <span>ب.ض: {activeSupplier.taxId}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCreatePoForSupplierId(activeSupplier.id)}
                  className="bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
                >
                  + إصدار أمر شراء للمورد
                </button>
              </div>
            </div>

            {/* Profile Sub-tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-none text-xs font-bold">
              {[
                { id: "OVERVIEW", label: "نظرة عامة والماليات" },
                { id: "PRODUCTS", label: `المنتجات والأسعار (${activeSupplierProducts.length})` },
                { id: "ORDERS", label: `سجل أوامر التوريد (${activeSupplierOrders.length})` },
                { id: "PERFORMANCE", label: "تقييم الأداء والجودة" },
                { id: "FINANCIAL", label: `فواتير المورد (${activeSupplierInvoices.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: OVERVIEW */}
            {activeTab === "OVERVIEW" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[10px] text-slate-500 block">إجمالي المشتريات التاريخية</span>
                    <strong className="text-base font-black text-slate-900 font-mono">
                      {formatEGP(activeSupplier.totalPurchases)}
                    </strong>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[10px] text-slate-500 block">المديونية الحالية المستحقة</span>
                    <strong className="text-base font-black text-amber-700 font-mono">
                      {formatEGP(activeSupplier.balance)}
                    </strong>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[10px] text-slate-500 block">شروط وتسهيلات السداد</span>
                    <strong className="text-xs font-bold text-slate-800">
                      {activeSupplier.paymentTerms} ({activeSupplier.paymentTermsDays} يوم)
                    </strong>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[10px] text-slate-500 block">الحد الائتماني المعتمد</span>
                    <strong className="text-base font-black text-slate-900 font-mono">
                      {formatEGP(activeSupplier.creditLimit)}
                    </strong>
                  </div>
                </div>

                {/* Performance Highlights */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-3">
                  <span className="text-xs font-bold text-rewaq-gold block">
                    مؤشرات التوريد الميداني المعتمدة:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                    <div className="border-l border-slate-800">
                      <span className="text-[10px] text-slate-400 block">الالتزام بمواعيد التوريد</span>
                      <span className="font-mono font-black text-emerald-400 text-sm">
                        {activeSupplier.performance.onTimeDeliveryRate}%
                      </span>
                    </div>
                    <div className="border-l border-slate-800">
                      <span className="text-[10px] text-slate-400 block">تطابق الكميات</span>
                      <span className="font-mono font-black text-white text-sm">
                        {activeSupplier.performance.quantityFulfillmentRate}%
                      </span>
                    </div>
                    <div className="border-l border-slate-800">
                      <span className="text-[10px] text-slate-400 block">متوسط مدة التوريد</span>
                      <span className="font-mono font-bold text-white text-sm">
                        {activeSupplier.performance.averageLeadTimeDays} يوم
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">نسبة التوالف والعيوب</span>
                      <span className="font-mono font-bold text-rose-400 text-sm">
                        {activeSupplier.performance.qualityDefectRate}%
                      </span>
                    </div>
                  </div>
                </div>

                {activeSupplier.notes && (
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700">
                    <span className="font-bold block text-slate-900 mb-1">ملاحظات النشاط:</span>
                    {activeSupplier.notes}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: PRODUCTS */}
            {activeTab === "PRODUCTS" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">
                    الأصناف الموردة ومصفوفة الأسعار:
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    يمكن تعديل أسعار الشراء مع التوثيق التلقائي في سجل التغييرات
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  <table className="w-full text-right">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">الصنف</th>
                        <th className="p-3">كود المورد SKU</th>
                        <th className="p-3">سعر الشراء الحالي</th>
                        <th className="p-3">السعر السابق</th>
                        <th className="p-3">فترة التوريد</th>
                        <th className="p-3">أقل كمية (MOQ)</th>
                        <th className="p-3 text-center">تعديل السعر</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeSupplierProducts.map((sp) => (
                        <tr key={sp.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{sp.productName}</td>
                          <td className="p-3 font-mono text-slate-600">{sp.supplierSku}</td>
                          <td className="p-3 font-mono font-bold text-slate-900">
                            {formatEGP(sp.purchasePrice)}
                          </td>
                          <td className="p-3 font-mono text-slate-400">
                            {sp.lastPrice ? formatEGP(sp.lastPrice) : "-"}
                          </td>
                          <td className="p-3 font-mono">{sp.leadTimeDays} يوم</td>
                          <td className="p-3 font-mono">{sp.minOrderQuantity} قطع</td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSp(sp);
                                setNewSpPrice(sp.purchasePrice);
                              }}
                              className="p-1 text-slate-400 hover:text-rewaq-gold-dark hover:bg-slate-100 rounded-lg transition"
                              title="تعديل السعر"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: ORDERS */}
            {activeTab === "ORDERS" && (
              <div className="space-y-3">
                <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  <table className="w-full text-right">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">رقم الأمر</th>
                        <th className="p-3">تاريخ الأمر</th>
                        <th className="p-3">موعد التسليم</th>
                        <th className="p-3">القيمة الإجمالية</th>
                        <th className="p-3 text-center">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeSupplierOrders.map((po) => (
                        <tr key={po.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-slate-900">{po.poNumber}</td>
                          <td className="p-3 font-mono text-slate-500">{po.orderDate}</td>
                          <td className="p-3 font-mono text-slate-700">{po.expectedDeliveryDate}</td>
                          <td className="p-3 font-mono font-bold text-slate-900">
                            {formatEGP(po.grandTotal)}
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              {po.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 4: PERFORMANCE */}
            {activeTab === "PERFORMANCE" && (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h3 className="font-bold text-slate-900">
                    بطاقة التقييم الشاملة لمصنع / مورد الأثاث (Performance Scorecard):
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-slate-700 mb-1">
                        <span>الالتزام بالمواعيد المحددة (On-Time Delivery):</span>
                        <strong className="font-mono">{activeSupplier.performance.onTimeDeliveryRate}%</strong>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${activeSupplier.performance.onTimeDeliveryRate}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-700 mb-1">
                        <span>مطابقة الكميات المطلوبة (Fulfillment Accuracy):</span>
                        <strong className="font-mono">{activeSupplier.performance.quantityFulfillmentRate}%</strong>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${activeSupplier.performance.quantityFulfillmentRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: FINANCIAL */}
            {activeTab === "FINANCIAL" && (
              <div className="space-y-3">
                <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  <table className="w-full text-right">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">رقم الفاتورة الداخلي</th>
                        <th className="p-3">مرجع المورد</th>
                        <th className="p-3">تاريخ الاستحقاق</th>
                        <th className="p-3">إجمالي المطالبة</th>
                        <th className="p-3 text-center">المطابقة 3-Way</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeSupplierInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                          <td className="p-3 font-mono text-blue-700 font-bold">{inv.supplierInvoiceRef}</td>
                          <td className="p-3 font-mono text-slate-600">{inv.dueDate}</td>
                          <td className="p-3 font-mono font-bold text-slate-900">{formatEGP(inv.totalAmount)}</td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                inv.matchStatus === "MATCHED"
                                  ? "bg-emerald-100 text-emerald-900"
                                  : "bg-amber-100 text-amber-900 border border-amber-300"
                              }`}
                            >
                              {inv.matchStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Product Price Modal */}
      {editingSp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-slate-900">
              تعديل سعر توريد الصنف
            </h3>
            <p className="text-xs text-slate-500">{editingSp.productName}</p>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                سعر التوريد الجديد (ج.م):
              </label>
              <input
                type="number"
                value={newSpPrice}
                onChange={(e) => setNewSpPrice(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-none focus:border-rewaq-gold"
                required
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingSp(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSavePrice}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rewaq-gold text-slate-950 hover:bg-rewaq-gold-dark font-black"
              >
                حفظ وتحديث السعر
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isAddSupplierOpen && (
        <CreateSupplierModal
          isOpen={isAddSupplierOpen}
          onClose={() => setIsAddSupplierOpen(false)}
        />
      )}

      {createPoForSupplierId && (
        <CreatePurchaseOrderModal
          isOpen={!!createPoForSupplierId}
          onClose={() => setCreatePoForSupplierId(null)}
          prefillSupplierId={createPoForSupplierId}
        />
      )}
    </div>
  );
}
