"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  CheckCircle2,
  X,
  Layers,
  Plus,
  Trash2,
  Package,
  Building2
} from "lucide-react";
import {
  useShowroom,
  ReceivingOrderItem
} from "@/context/ShowroomContext";

export default function ReceivingPage() {
  const {
    products,
    warehouses,
    receivingOrders,
    createReceivingOrder,
    confirmReceivingOrder
  } = useShowroom();

  const [isReceivingModalOpen, setIsReceivingModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Multi-item order state for modal
  const [modalItems, setModalItems] = useState<Array<{ productId: string; expectedQty: number }>>([
    { productId: products[0]?.id || "", expectedQty: 5 }
  ]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const suppliersList = useMemo(() => {
    const defaults = [
      "مصنع رِواق للأخشاب الطبيعية - دمياط",
      "شركة النساجون للأقمشة والمفروشات",
      "مؤسسة الأهرام للزجاج والمعادن",
      "الشركة المصرية للإسفنج والتبطين",
      "مصنع إضاءات المستقبل العالمية",
      "مورد الإكسسوارات والمقابض النحاسية",
      "مصنع رِواق الرئيسي للتصنيع والتجميع"
    ];
    const existing = receivingOrders.map((r) => r.supplierName).filter(Boolean);
    return Array.from(new Set([...defaults, ...existing]));
  }, [receivingOrders]);

  const handleOpenCreateModal = () => {
    setModalItems([{ productId: products[0]?.id || "", expectedQty: 5 }]);
    setIsReceivingModalOpen(true);
  };

  const handleAddItemRow = () => {
    setModalItems(prev => [...prev, { productId: products[0]?.id || "", expectedQty: 1 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (modalItems.length <= 1) return;
    setModalItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'expectedQty', value: any) => {
    setModalItems(prev => prev.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const totalExpectedQtyInModal = modalItems.reduce((sum, it) => sum + (Number(it.expectedQty) || 0), 0);

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
            <span className="text-slate-900 font-bold">أذون الاستلام والتوريد</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">
            أذون استلام التوريدات والشحنات الواردة
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            فحص الشحنات الواردة من المصانع والموردين، مطابقة المتوقع بالفعلي، ورصد التوالف والتسكين الفوري.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
        >
          <ArrowDownLeft className="w-4 h-4" />
          + إنشاء إذن استلام جديد
        </button>
      </div>

      {/* Receiving Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {receivingOrders.map((rcv) => {
          return (
            <div key={rcv.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {rcv.poNumber}
                  </span>
                  <p className="text-xs font-bold text-slate-900 mt-1">المورد: {rcv.supplierName}</p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    rcv.status === "PENDING"
                      ? "bg-slate-100 text-slate-700"
                      : rcv.status === "DISCREPANCY"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {rcv.status === "PENDING"
                    ? "⏳ بانتظار وصول الشحنة"
                    : rcv.status === "DISCREPANCY"
                    ? "⚠️ استلام جزئي / به عجز"
                    : "✅ تم الاستلام والتخزين"}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-700 flex items-center justify-between">
                <span>مستودع الاستلام: <strong>{rcv.destinationBranch} - {rcv.destinationWarehouse}</strong></span>
                <span className="text-[10px] text-slate-400 font-mono">{rcv.receivedAt || "قيد الانتظار"}</span>
              </div>

              {/* Items Breakdown Table */}
              <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-right">
                  <thead className="bg-slate-50 text-[10px] text-slate-500">
                    <tr>
                      <th className="p-2">الصنف</th>
                      <th className="p-2 text-center">المتوقع</th>
                      <th className="p-2 text-center">المستلم</th>
                      <th className="p-2 text-center">تالف/عجز</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rcv.items.map((it, i) => {
                      const discrepancy = it.missingQty || (it.expectedQty - (it.receivedQty || 0));
                      return (
                        <tr key={i}>
                          <td className="p-2 font-bold text-slate-800">{it.productName}</td>
                          <td className="p-2 text-center font-mono">{it.expectedQty}</td>
                          <td className="p-2 text-center font-mono font-bold text-emerald-700">
                            {it.receivedQty || 0}
                          </td>
                          <td className="p-2 text-center font-mono text-rose-600">
                            {discrepancy > 0 ? discrepancy : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {rcv.notes && (
                <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg italic">
                  ملاحظات: {rcv.notes}
                </p>
              )}

              {/* Actions */}
              {rcv.status !== "RECEIVED" && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      confirmReceivingOrder(
                        rcv.id,
                        rcv.items.map((it) => ({
                          ...it,
                          receivedQty: it.expectedQty,
                          missingQty: 0,
                          damagedQty: 0,
                          status: "ACCEPTED",
                        })),
                        "مدير المستودع"
                      );
                      triggerToast("✅ تم استلام الشحنة وتحديث المخزون الفعلي وتسجيل الحركة بالدفتر!");
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    تأكيد استلام كامل الشحنة بالمخزن
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CREATE RECEIVING ORDER MODAL */}
      {isReceivingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">إنشاء إذن استلام شحنة جديدة</h3>
                <p className="text-[11px] text-slate-500">تسجيل أمر الشراء وإذن الاستلام وتحديد المورد والأصناف الواردة</p>
              </div>
              <button type="button" onClick={() => setIsReceivingModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const supplierName = fd.get("supplierName") as string;
                const poNumber = fd.get("poNumber") as string;
                const warehouseId = fd.get("warehouseId") as string;
                const notes = fd.get("notes") as string;

                const wh = warehouses.find((w) => w.id === warehouseId);

                // Build multiple items from state
                const validItems = modalItems
                  .filter((it) => it.productId && Number(it.expectedQty) > 0)
                  .map((it) => {
                    const prod = products.find((p) => p.id === it.productId);
                    const qty = Number(it.expectedQty) || 1;
                    return {
                      productId: it.productId,
                      productName: prod?.name || "صنف غير محدد",
                      expectedQty: qty,
                      receivedQty: 0,
                      missingQty: 0,
                      damagedQty: 0,
                      status: "ACCEPTED" as const,
                    };
                  });

                if (validItems.length === 0) {
                  alert("يرجى إضافة صنف واحد على الأقل وتحديد كمية متوقعة صالحة.");
                  return;
                }

                const totalExpected = validItems.reduce((sum, it) => sum + it.expectedQty, 0);

                createReceivingOrder({
                  poNumber: poNumber || `PO-${Date.now().toString().slice(-4)}`,
                  supplierName,
                  destinationBranch: wh?.branchName || "",
                  destinationWarehouse: wh?.name || "",
                  items: validItems,
                  totalExpected,
                  totalReceived: 0,
                  receivedBy: "أمين المخزن",
                  notes,
                });

                setIsReceivingModalOpen(false);
                triggerToast(`✅ تم إنشاء إذن الاستلام بنجاح بعدد ${validItems.length} صنف (${totalExpected} قطعة)!`);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>المورد / المصنع المعتمد *</span>
                  </label>
                  <select
                    name="supplierName"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rewaq-gold"
                  >
                    {suppliersList.map((sup) => (
                      <option key={sup} value={sup}>
                        {sup}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">المستودع الوجهة *</label>
                  <select
                    name="warehouseId"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rewaq-gold"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.branchName} - {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم أمر الشراء (PO #)</label>
                <input
                  name="poNumber"
                  placeholder="مثال: PO-8492 (اتركه فارغاً للتوليد التلقائي)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-rewaq-gold"
                />
              </div>

              {/* MULTI-PRODUCT ITEMS SECTION */}
              <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-emerald-600" />
                    <span>أصناف أمر الشراء والشحنة ({modalItems.length}) *</span>
                  </label>
                  <span className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 font-mono">
                    إجمالي الكميات: {totalExpectedQtyInModal} قطعة
                  </span>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {modalItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">الصنف #{idx + 1}</label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-rewaq-gold"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-28">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">الكمية المتوقعة</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.expectedQty}
                          onChange={(e) => handleItemChange(idx, 'expectedQty', Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none focus:border-rewaq-gold text-center"
                        />
                      </div>

                      {modalItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="mt-4 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="حذف هذا الصنف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 border border-dashed border-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-emerald-600" />
                  + إضافة صنف آخر لأمر الشراء
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات التوريد</label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="رقم بوليصة الشحن، اسم السائق، شروط الفحص..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rewaq-gold"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReceivingModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  حفظ إذن الاستلام وتأكيد الأصناف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
