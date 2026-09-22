"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  Eye,
  SlidersHorizontal,
  Warehouse as WarehouseIcon,
  Barcode,
  X,
  Printer,
  Layers,
  ArrowRight
} from "lucide-react";
import {
  useShowroom,
  ProductItem,
  Warehouse
} from "@/context/ShowroomContext";

export default function ProductsMasterPage() {
  const {
    products,
    warehouses,
    stockLevels,
    addProduct,
    adjustStock
  } = useShowroom();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState<string>("ALL");
  const [stockStatusFilter, setStockStatusFilter] = useState<string>("ALL");

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct360, setSelectedProduct360] = useState<ProductItem | null>(null);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [adjustmentTarget, setAdjustmentTarget] = useState<{ productId: string; warehouseId: string } | null>(null);

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

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const summary = getProductStockSummary(p.id);
      const query = searchQuery.trim().toLowerCase();

      if (selectedWarehouseFilter !== "ALL") {
        const inW = summary.levels.some(
          (lvl) => lvl.warehouseId === selectedWarehouseFilter && lvl.onHand > 0
        );
        if (!inW) return false;
      }

      if (selectedCategory !== "ALL" && p.category !== selectedCategory) {
        return false;
      }

      if (stockStatusFilter === "LOW_STOCK" && summary.onHand > p.minStockThreshold) return false;
      if (stockStatusFilter === "AVAILABLE_ONLY" && summary.available <= 0) return false;
      if (stockStatusFilter === "RESERVED_ONLY" && summary.reserved <= 0) return false;
      if (stockStatusFilter === "OUT_OF_STOCK" && summary.onHand > 0) return false;

      if (query) {
        if (query.includes("منخفض") && summary.onHand > p.minStockThreshold) return false;
        if (query.includes("متاح") && summary.available <= 0) return false;
        if (query.includes("حجز") && summary.reserved <= 0) return false;

        const matchText = [
          p.name,
          p.sku,
          p.barcode,
          p.category,
          p.brand || "",
          p.woodType || "",
          (p.availableColors || []).join(" "),
        ]
          .join(" ")
          .toLowerCase();

        const matchesWarehouseInQuery = summary.levels.some((lvl) => {
          return (
            lvl.onHand > 0 &&
            (query.includes(lvl.branchName.toLowerCase()) || query.includes(lvl.warehouseName.toLowerCase()))
          );
        });

        if (!matchText.includes(query) && !matchesWarehouseInQuery) {
          return false;
        }
      }

      return true;
    });
  }, [products, stockLevels, searchQuery, selectedCategory, selectedWarehouseFilter, stockStatusFilter]);

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))), [products]);

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
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/dashboard/inventory" className="hover:text-rewaq-gold-dark flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              المخزون والمستودعات
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">دليل الأصناف والمخزون الفعلي</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">
            دليل المنتجات والأرصدة في الفروع
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            إدارة مواصفات المنتجات ومطابقة الرصيد الفعلي والمحجوز والمتاح في كل صالة ومستودع.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsProductModalOpen(true)}
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4 text-rewaq-gold" />
          + إضافة صنف جديد
        </button>
      </div>

      {/* Smart Search and Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث ذكي باللغة الطبيعية: (مثال: 'صالون'، 'المتاح في طنطا'، 'مخزون منخفض'، كود صنف أو باركود)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rewaq-gold focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-rewaq-gold"
          >
            <option value="ALL">جميع الأقسام ({products.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedWarehouseFilter}
            onChange={(e) => setSelectedWarehouseFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-rewaq-gold"
          >
            <option value="ALL">كل الفروع والمستودعات</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.branchName} - {wh.name}
              </option>
            ))}
          </select>

          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-rewaq-gold"
          >
            <option value="ALL">جميع حالات المخزون</option>
            <option value="LOW_STOCK">⚠️ مخزون منخفض فقط</option>
            <option value="AVAILABLE_ONLY">✅ متاح للبيع فقط</option>
            <option value="RESERVED_ONLY">🔒 به حجوزات نشطة</option>
            <option value="OUT_OF_STOCK">❌ نفد من المخزن</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>تم العثور على <strong className="text-slate-900 font-mono">{filteredProducts.length}</strong> صنف</span>
        <span className="text-[11px]">انقر على أي صنف لفتح بروفايل Product 360 وإدارته</span>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                <th className="p-4 whitespace-nowrap">بيانات الصنف والكود</th>
                <th className="p-4 whitespace-nowrap">القسم والمواصفات</th>
                <th className="p-4 whitespace-nowrap">السعر والباركود</th>
                <th className="p-4 text-center whitespace-nowrap">الفعلي (On Hand)</th>
                <th className="p-4 text-center whitespace-nowrap">المحجوز</th>
                <th className="p-4 text-center whitespace-nowrap">العرض / تالف</th>
                <th className="p-4 text-center whitespace-nowrap">المتاح الفوري</th>
                <th className="p-4 text-center whitespace-nowrap">التوزيع بالمستودعات</th>
                <th className="p-4 text-center whitespace-nowrap">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProducts.map((p) => {
                const stock = getProductStockSummary(p.id);
                const isLow = stock.onHand <= p.minStockThreshold;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition group">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0 overflow-hidden">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-rewaq-gold-dark" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-rewaq-gold-dark transition">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold">
                              {p.sku}
                            </span>
                            {isLow && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold border border-rose-200">
                                مخزون حرج
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {p.category}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {p.woodType}
                      </p>
                    </td>

                    <td className="p-3.5">
                      <p className="font-black text-slate-900 font-mono">
                        {p.retailPrice.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">ج.م</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                        <Barcode className="w-3 h-3" />
                        {p.barcode}
                      </p>
                    </td>

                    <td className="p-3.5 text-center font-mono font-black text-slate-900">
                      {stock.onHand}
                    </td>

                    <td className="p-3.5 text-center font-mono font-bold text-amber-600">
                      {stock.reserved > 0 ? `${stock.reserved} 🔒` : "-"}
                    </td>

                    <td className="p-3.5 text-center font-mono text-[11px] text-slate-500">
                      {stock.display > 0 && `${stock.display} صالة `}
                      {stock.damaged > 0 && `${stock.damaged} تالف`}
                      {stock.display === 0 && stock.damaged === 0 && "-"}
                    </td>

                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-xl font-mono font-black text-xs ${
                          stock.available > 0
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {stock.available} متاح
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs justify-center">
                        {stock.levels
                          .filter((lvl) => lvl.onHand > 0)
                          .map((lvl) => {
                            return (
                              <span
                                key={lvl.warehouseId}
                                title={`${lvl.warehouseName}: ${lvl.onHand} فعلي (${lvl.onHand - lvl.reserved - lvl.display - lvl.damaged} متاح)`}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono"
                              >
                                {lvl.branchName.replace("فرع ", "")}: <strong>{lvl.onHand}</strong>
                              </span>
                            );
                          })}
                        {stock.levels.every((lvl) => lvl.onHand === 0) && (
                          <span className="text-[10px] text-slate-400">غير متوفر بأي فرع</span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedProduct360(p)}
                          className="p-1.5 text-slate-500 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition"
                          title="عرض بروفايل الصنف Product 360"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAdjustmentTarget({ productId: p.id, warehouseId: warehouses[0]?.id || "wh-cairo-showroom" });
                            setIsAdjustmentModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-rewaq-gold-dark hover:bg-slate-100 rounded-lg transition"
                          title="تسوية مخزون يدوية"
                        >
                          <SlidersHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRODUCT 360 MODAL */}
      {selectedProduct360 && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rewaq-dark text-rewaq-gold flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{selectedProduct360.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs font-bold text-slate-600">{selectedProduct360.sku}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">{selectedProduct360.category}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProduct360(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px]">سعر البيع</span>
                  <p className="text-sm font-black text-slate-900 font-mono mt-1">
                    {selectedProduct360.retailPrice.toLocaleString()} ج.م
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px]">تكلفة الوحدة</span>
                  <p className="text-sm font-black text-slate-700 font-mono mt-1">
                    {selectedProduct360.costPrice.toLocaleString()} ج.م
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px]">الأبعاد والمقاسات</span>
                  <p className="text-xs font-bold text-slate-800 mt-1 font-mono">
                    {selectedProduct360.dimensions || "غير محدد"}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px]">نوع الخشب</span>
                  <p className="text-xs font-bold text-slate-800 mt-1">
                    {selectedProduct360.woodType}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black text-slate-900 mb-2 flex items-center gap-1.5">
                  <WarehouseIcon className="w-4 h-4 text-rewaq-gold-dark" />
                  رصيد الصنف التفصيلي في كل المستودعات والفروع:
                </h4>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-right">
                    <thead className="bg-slate-50 text-[10px] text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">المستودع / الفرع</th>
                        <th className="p-2.5 text-center">الفعلي (On Hand)</th>
                        <th className="p-2.5 text-center">المحجوز</th>
                        <th className="p-2.5 text-center">عرض بالصالة</th>
                        <th className="p-2.5 text-center">تالف</th>
                        <th className="p-2.5 text-center">المتاح الفوري</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {warehouses.map((wh) => {
                        const lvl = stockLevels.find(
                          (sl) => sl.productId === selectedProduct360.id && sl.warehouseId === wh.id
                        );
                        const onHand = lvl?.onHand || 0;
                        const reserved = lvl?.reserved || 0;
                        const display = lvl?.display || 0;
                        const damaged = lvl?.damaged || 0;
                        const available = Math.max(0, onHand - reserved - display - damaged);

                        return (
                          <tr key={wh.id} className="hover:bg-slate-50/50">
                            <td className="p-2.5">
                              <p className="font-bold text-slate-900">{wh.branchName}</p>
                              <p className="text-[10px] text-slate-400">{wh.name}</p>
                            </td>
                            <td className="p-2.5 text-center font-mono font-bold text-slate-800">{onHand}</td>
                            <td className="p-2.5 text-center font-mono text-amber-600">{reserved || "-"}</td>
                            <td className="p-2.5 text-center font-mono text-slate-500">{display || "-"}</td>
                            <td className="p-2.5 text-center font-mono text-rose-600">{damaged || "-"}</td>
                            <td className="p-2.5 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-lg font-mono font-bold text-xs ${
                                  available > 0 ? "bg-emerald-50 text-emerald-700" : "text-slate-400"
                                }`}
                              >
                                {available}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <Barcode className="w-8 h-8 text-slate-800" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 font-mono">{selectedProduct360.barcode}</p>
                    <p className="text-[10px] text-slate-400">كود الباركود لملصقات المستودع والصالة</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => triggerToast("🖨️ تم إرسال ملصق الباركود إلى طابعة الباركود!")}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  طباعة ملصق الباركود
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedProduct360(null)}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-300"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">+ تعريف صنف جديد بدليل المنتجات</h3>
              <button type="button" onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const fd = new FormData(form);
                const name = fd.get("name") as string;
                const sku = fd.get("sku") as string;
                const category = fd.get("category") as string;
                const retailPrice = Number(fd.get("retailPrice"));
                const costPrice = Number(fd.get("costPrice"));
                const woodType = fd.get("woodType") as string;

                addProduct({
                  sku: sku || `SKU-${Date.now().toString().slice(-4)}`,
                  barcode: `622${Date.now().toString().slice(-9)}`,
                  name,
                  category,
                  brand: "رِواق للأثاث",
                  woodType: woodType || "خشب طبيعي",
                  dimensions: "200 × 90 × 80 سم",
                  unit: "قطعة",
                  retailPrice,
                  minPrice: Math.round(retailPrice * 0.9),
                  costPrice,
                  image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80",
                  availableColors: ["بيج", "رمادي"],
                  isFloorDisplay: false,
                  floorBranch: "فرع التجمع الخامس",
                  status: "ACTIVE",
                  minStockThreshold: 2,
                  leadTimeDays: 7,
                  lastMovementDate: new Date().toISOString().split("T")[0],
                });

                setIsProductModalOpen(false);
                triggerToast("✅ تم إضافة الصنف الجديد وتعيين مستوياته بالمخازن!");
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المنتج / الصنف *</label>
                <input
                  name="name"
                  required
                  placeholder="مثال: طقم أنتريه رويال قطيفة"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rewaq-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">كود الصنف (SKU) *</label>
                  <input
                    name="sku"
                    required
                    placeholder="مثال: SOF-ROY-01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-rewaq-gold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">القسم / التصنيف *</label>
                  <select
                    name="category"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rewaq-gold"
                  >
                    {Array.from(new Set([
                      "غرف معيشة وصالونات",
                      "غرف نوم ودواليب",
                      "طاولات وغرف طعام",
                      "مطابخ وخزائن",
                      "مكاتب ومساحات عمل",
                      "إضاءة ووحدات ديكور",
                      "أثاث خارجي وحدائق",
                      "مفروشات وسجاد",
                      "إكسسوارات ومرايا",
                      ...products.map((p) => p.category).filter(Boolean)
                    ])).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">سعر البيع للجمهور (ج.م) *</label>
                  <input
                    name="retailPrice"
                    type="number"
                    required
                    placeholder="45000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-rewaq-gold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تكلفة الشراء / التصنيع (ج.م) *</label>
                  <input
                    name="costPrice"
                    type="number"
                    required
                    placeholder="28000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-rewaq-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الخامة / نوع الخشب</label>
                <input
                  name="woodType"
                  placeholder="خشب زان طبيعي / قطيفة تركي"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rewaq-gold"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                >
                  حفظ الصنف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL ADJUSTMENT MODAL */}
      {isAdjustmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">تسوية رصيد يدوي مباشر</h3>
              <button type="button" onClick={() => setIsAdjustmentModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const productId = fd.get("productId") as string;
                const warehouseId = fd.get("warehouseId") as string;
                const newOnHand = Number(fd.get("newOnHand"));
                const notes = fd.get("notes") as string;

                adjustStock(productId, warehouseId, newOnHand, notes, "أحمد سمير (المدير العام)");
                setIsAdjustmentModalOpen(false);
                triggerToast("✅ تم تعديل الرصيد وتسجيل حركة التسوية بالدفتر!");
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">الصنف</label>
                <select
                  name="productId"
                  defaultValue={adjustmentTarget?.productId}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المستودع</label>
                <select
                  name="warehouseId"
                  defaultValue={adjustmentTarget?.warehouseId}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.branchName} - {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الرصيد الفعلي الجديد (On Hand) *</label>
                <input
                  name="newOnHand"
                  type="number"
                  min="0"
                  required
                  defaultValue="5"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">سبب التسوية والملاحظات *</label>
                <input
                  name="notes"
                  required
                  placeholder="مثال: تسوية بعد الجرد السريع، أو استرجاع قطعة من المعرض"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustmentModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs"
                >
                  حفظ التسوية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
