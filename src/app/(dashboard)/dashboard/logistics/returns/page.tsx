"use client";

import React, { useState } from "react";
import {
  RotateCcw,
  Package,
  Warehouse,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  CheckCheck,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { useShowroom } from "@/context/ShowroomContext";
import { DeliveryReturn } from "@/types/logistics";
import LogisticsNav from "@/components/logistics/LogisticsNav";

export default function DeliveryReturnsPage() {
  const { deliveryReturns, processDeliveryReturn } = useShowroom();

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [processingReturn, setProcessingReturn] = useState<DeliveryReturn | null>(null);
  const [inventoryAction, setInventoryAction] = useState<DeliveryReturn["inventoryAction"]>("AVAILABLE");
  const [inspectionNotes, setInspectionNotes] = useState<string>("");

  const filteredReturns = deliveryReturns.filter((ret) => {
    const matchesStatus = statusFilter === "ALL" || ret.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      ret.customerName.toLowerCase().includes(q) ||
      ret.productName.toLowerCase().includes(q) ||
      ret.deliveryNumber.toLowerCase().includes(q) ||
      ret.contractNumber.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const handleProcessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!processingReturn) return;

    processDeliveryReturn(
      processingReturn.id,
      inventoryAction,
      "مسؤول فحص المستودع",
      inspectionNotes || "تم الفحص الفني واعتماد حركة المخزون"
    );

    setProcessingReturn(null);
    setInspectionNotes("");
  };

  const getConditionBadge = (cond: DeliveryReturn["condition"]) => {
    switch (cond) {
      case "PERFECT":
        return { label: "سليمة 100%", badge: "bg-emerald-50 text-emerald-800 border-emerald-200" };
      case "MINOR_DAMAGE":
        return { label: "تلف/خدش بسيط", badge: "bg-amber-50 text-amber-800 border-amber-200" };
      case "HEAVILY_DAMAGED":
        return { label: "تلف جسيم", badge: "bg-rose-50 text-rose-800 border-rose-200" };
      default:
        return { label: cond, badge: "bg-slate-50 text-slate-700 border-slate-200" };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <LogisticsNav />

      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">
            سجل مرتجعات ما بعد التسليم (Delivery Returns & Restocking)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            فحص القطع المرتجعة وإعادة توجيهها للمخزن الفعلي (سليمة / ورشة / تالفة).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-purple-800 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
            {deliveryReturns.filter((r) => r.status === "PENDING_INSPECTION").length} طلبات بانتظار الفحص
          </span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالصنف، العميل، أو رقم الشحنة..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pr-9 text-xs text-slate-800 focus:outline-none focus:border-rewaq-gold focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          {[
            { id: "ALL", label: "كل المرتجعات" },
            { id: "PENDING_INSPECTION", label: "بانتظار الفحص" },
            { id: "ACCEPTED_RESTOCKED", label: "تمت إتاحتها بالمخزن" },
            { id: "ACCEPTED_DAMAGED", label: "تم تحويلها للصيانة/تالف" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                statusFilter === f.id
                  ? "bg-white text-slate-900 shadow-xs font-black"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="p-3.5">الشحنة والعقد</th>
                <th className="p-3.5">العميل</th>
                <th className="p-3.5">الصنف والكمية</th>
                <th className="p-3.5">حالة الفحص</th>
                <th className="p-3.5">سبب الإرجاع</th>
                <th className="p-3.5">المستودع المستلم</th>
                <th className="p-3.5">التوجيه المخزني</th>
                <th className="p-3.5 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-xs italic">
                    لا توجد طلبات إرجاع مسجلة
                  </td>
                </tr>
              ) : (
                filteredReturns.map((ret) => {
                  const cond = getConditionBadge(ret.condition);
                  const isPending = ret.status === "PENDING_INSPECTION";

                  return (
                    <tr key={ret.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3.5">
                        <div className="font-mono font-black text-slate-900">#{ret.deliveryNumber}</div>
                        <div className="text-[10px] text-slate-400 font-mono">#{ret.contractNumber}</div>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">{ret.customerName}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{ret.productName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">الكمية: {ret.quantity} قطعة</div>
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${cond.badge}`}>
                          {cond.label}
                        </span>
                      </td>
                      <td className="p-3.5 max-w-xs text-slate-700">{ret.reason}</td>
                      <td className="p-3.5 font-bold text-slate-800">{ret.returnedToWarehouse}</td>
                      <td className="p-3.5">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg border bg-purple-50 text-purple-900 border-purple-200">
                          {ret.inventoryAction || "قيد الفحص"}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        {isPending ? (
                          <button
                            type="button"
                            onClick={() => {
                              setProcessingReturn(ret);
                              setInventoryAction(ret.inventoryAction || "AVAILABLE");
                            }}
                            className="inline-flex items-center gap-1 text-xs font-black text-white bg-purple-700 hover:bg-purple-800 px-3 py-1.5 rounded-lg shadow-2xs transition cursor-pointer"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>فحص وتحديث المخزن</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-bold">تم الاستلام ✅</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Return Inspection Modal */}
      {processingReturn && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl w-full max-w-md space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-sm text-slate-900">
                  فحص المرتجع وتحديث المخزون (#{processingReturn.deliveryNumber})
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  الصنف: {processingReturn.productName} (الكمية: {processingReturn.quantity})
                </p>
              </div>
              <button onClick={() => setProcessingReturn(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">قرار الفحص والتوجيه المخزني:</label>
                <select
                  value={inventoryAction}
                  onChange={(e) => setInventoryAction(e.target.value as DeliveryReturn["inventoryAction"])}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-purple-600 focus:bg-white"
                >
                  <option value="AVAILABLE">إعادة القطعة لرصيد المخزن المتاح للبيع فوراً (Available)</option>
                  <option value="WORKSHOP">تحويل القطعة لورشة الصيانة والتجهيز (Workshop)</option>
                  <option value="DAMAGED">تصنيف كتالف وشطب من الصالح (Damaged)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">تقرير الفحص الفني والملاحظات:</label>
                <textarea
                  rows={3}
                  required
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  placeholder="تقرير أمين المخزن أو الفني عن حالة القطعة..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-600 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setProcessingReturn(null)}
                  className="text-slate-500 font-bold px-3 py-2"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-purple-700 hover:bg-purple-800 text-white font-black px-5 py-2.5 rounded-xl shadow-xs"
                >
                  اعتماد وتحديث رصيد المخزن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
