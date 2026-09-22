"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  X,
  Layers
} from "lucide-react";
import {
  useShowroom
} from "@/context/ShowroomContext";

export default function StockCountPage() {
  const {
    products,
    warehouses,
    stockCounts,
    createStockCount,
    approveStockCountAdjustment
  } = useShowroom();

  const [isStockCountModalOpen, setIsStockCountModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

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
            <span className="text-slate-900 font-bold">الجرد والتسويات</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">
            جلسات الجرد الدوري ومطابقة الفعلي مع الدفتري
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            حساب فروق الجرد (System vs Physical) واعتماد التسويات وتوليد حركات مخزنية للموازنة آلياً.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsStockCountModalOpen(true)}
          className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl shadow-xs transition"
        >
          <FileCheck className="w-4 h-4" />
          + بدء جلسة جرد جديدة
        </button>
      </div>

      {/* Stock Counts List */}
      <div className="space-y-4">
        {stockCounts.map((sc) => {
          return (
            <div key={sc.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {sc.countNumber}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{sc.notes || "جلسة جرد دوري"}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    المستودع: <strong className="text-slate-700">{sc.branchName} ({sc.warehouseName})</strong> • المراجع: {sc.conductedBy}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    sc.status === "DRAFT"
                      ? "bg-slate-100 text-slate-700"
                      : sc.status === "PENDING_APPROVAL"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {sc.status === "DRAFT"
                    ? "مخطط"
                    : sc.status === "PENDING_APPROVAL"
                    ? "جاري المطابقة"
                    : "✅ معتمد وتمت التسوية"}
                </span>
              </div>

              {/* Audit Comparison Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-right border-collapse">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-3">الصنف</th>
                      <th className="p-3 text-center">رصيد النظام</th>
                      <th className="p-3 text-center">العد الفعلي بالمخزن</th>
                      <th className="p-3 text-center">فرق الجرد (عجز/زيادة)</th>
                      <th className="p-3 text-center">قيمة الفرق</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sc.items.map((it, idx) => {
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3">
                            <p className="font-bold text-slate-900">{it.productName}</p>
                            <span className="font-mono text-[10px] text-slate-400">{it.sku}</span>
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-slate-700">
                            {it.systemQty}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-slate-900">
                            {it.physicalQty}
                          </td>
                          <td className="p-3 text-center font-mono font-bold">
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${
                                it.difference < 0
                                  ? "bg-rose-50 text-rose-600 border border-rose-200"
                                  : it.difference > 0
                                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                                  : "bg-emerald-50 text-emerald-600"
                              }`}
                            >
                              {it.difference > 0 ? `+${it.difference} زيادة` : it.difference < 0 ? `${it.difference} عجز` : "مطابق"}
                            </span>
                          </td>
                          <td className="p-3 text-center font-mono text-slate-700">
                            {it.costValueDiff ? `${it.costValueDiff.toLocaleString()} ج.م` : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Actions */}
              {sc.status !== "APPROVED_ADJUSTED" && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      approveStockCountAdjustment(sc.id, "أحمد سمير (المدير العام)");
                      triggerToast("✅ تم اعتماد فروق الجرد وتسوية الأرصدة وتوليد حركات المخزن!");
                    }}
                    className="px-4 py-2 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    اعتماد فروق الجرد وتطبيق التسوية آلياً
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* NEW STOCK COUNT MODAL */}
      {isStockCountModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">بدء جلسة جرد ومطابقة جديدة</h3>
              <button type="button" onClick={() => setIsStockCountModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const warehouseId = fd.get("warehouseId") as string;
                const notes = fd.get("notes") as string;

                const wh = warehouses.find((w) => w.id === warehouseId);

                createStockCount({
                  countNumber: `CNT-${Date.now().toString().slice(-4)}`,
                  warehouseName: wh?.name || "",
                  branchName: wh?.branchName || "",
                  conductedBy: "أحمد سمير (المدير العام)",
                  countedAt: new Date().toISOString().split("T")[0],
                  items: products.slice(0, 3).map((p) => ({
                    productId: p.id,
                    productName: p.name,
                    sku: p.sku,
                    locationCode: "A01",
                    systemQty: 5,
                    physicalQty: 5,
                    difference: 0,
                    costValueDiff: 0,
                  })),
                  totalDifference: 0,
                  totalValueDifference: 0,
                  notes,
                });

                setIsStockCountModalOpen(false);
                triggerToast("✅ تم فتح جلسة الجرد بنجاح!");
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">المستودع المطلوب جرده *</label>
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان / ملاحظات الجلسة *</label>
                <input
                  name="notes"
                  required
                  placeholder="مثال: جرد الربع الأول 2026 لقسم الصالونات"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rewaq-gold"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStockCountModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black rounded-xl text-xs"
                >
                  بدء جلسة الجرد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
