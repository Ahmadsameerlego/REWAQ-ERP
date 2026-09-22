"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Layers,
  Phone,
  Calendar,
  FileText,
  Search,
  Package,
  Clock,
  CheckCheck,
  AlertCircle
} from "lucide-react";
import { useShowroom } from "@/context/ShowroomContext";

export default function ReservationsPage() {
  const { products, stockReservations } = useShowroom();

  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeReservations = stockReservations.filter((r) => r.status === "ACTIVE");
  const fulfilledReservations = stockReservations.filter((r) => r.status === "FULFILLED");
  const totalReservedUnits = stockReservations.reduce((acc, r) => acc + (r.status === "ACTIVE" ? r.quantity : 0), 0);

  const filteredReservations = stockReservations.filter((res) => {
    if (statusFilter !== "ALL" && res.status !== statusFilter) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      const match = [
        res.customerName,
        res.customerPhone,
        res.contractNumber,
        res.productName,
        res.branchName,
        res.warehouseName,
      ]
        .join(" ")
        .toLowerCase();
      if (!match.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-rewaq-gold/40 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-rewaq-gold" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/dashboard/inventory" className="hover:text-rewaq-gold-dark flex items-center gap-1 font-medium transition">
              <Layers className="w-3.5 h-3.5" />
              المخزون والمستودعات
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">حجوزات عقود المبيعات</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-rewaq-gold" />
            حجوزات المخزون المرتبطة بعقود المبيعات والعملاء
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            يتم حجز القطع فورياً وتلقائياً بمجرد إبرام العقد أو سداد العربون في نقاط البيع (POS) لمنع البيع المزدوج.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3.5 py-2 bg-amber-50 text-amber-800 font-bold rounded-xl border border-amber-200 whitespace-nowrap">
            {activeReservations.length} حجوزات نشطة معلقة
          </span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-bold block">إجمالي القطع المحجوزة حالياً</span>
            <span className="text-lg font-black text-slate-900 font-mono">{totalReservedUnits} <span className="text-xs font-normal text-slate-500">قطعة</span></span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-bold block">عقود تم تسليمها وخصمها</span>
            <span className="text-lg font-black text-slate-900 font-mono">{fulfilledReservations.length}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-bold block">إجمالي سجلات الحجز</span>
            <span className="text-lg font-black text-slate-900 font-mono">{stockReservations.length}</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="بحث في الحجوزات: باسم العميل، الهاتف، رقم العقد، الصنف، أو الفرع..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rewaq-gold focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-rewaq-gold transition"
        >
          <option value="ALL">جميع الحالات</option>
          <option value="ACTIVE">🔒 نشط (محجوز)</option>
          <option value="FULFILLED">✅ تم التسليم والخصم</option>
          <option value="CANCELLED">❌ ملغي ومفرج عنه</option>
        </select>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                <th className="p-4 whitespace-nowrap">العميل ورقم العقد</th>
                <th className="p-4 whitespace-nowrap">الصنف المحجوز</th>
                <th className="p-4 whitespace-nowrap">الفرع والمستودع</th>
                <th className="p-4 text-center whitespace-nowrap">الكمية المحجوزة</th>
                <th className="p-4 whitespace-nowrap">تاريخ الحجز وموعد التسليم</th>
                <th className="p-4 text-center whitespace-nowrap">حالة الحجز</th>
                <th className="p-4 text-center whitespace-nowrap">حالة الربط</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 text-xs">
                    لا توجد حجوزات مخزنية تطابق معايير البحث
                  </td>
                </tr>
              ) : (
                filteredReservations.map((res) => {
                  const product = products.find((p) => p.id === res.productId);
                  return (
                    <tr key={res.id} className="hover:bg-slate-50/80 transition">
                      {/* Customer & Contract */}
                      <td className="p-4 whitespace-nowrap">
                        <p className="font-bold text-slate-900">{res.customerName}</p>
                        <div className="font-mono text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">
                            <FileText className="w-3 h-3 text-slate-400" />
                            {res.contractNumber}
                          </span>
                          <span className="inline-flex items-center gap-1 text-slate-500">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span dir="ltr">{res.customerPhone}</span>
                          </span>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-800">{res.productName || product?.name}</p>
                            <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              {product?.sku || "SKU-N/A"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Branch & Warehouse */}
                      <td className="p-4 whitespace-nowrap">
                        <p className="font-bold text-slate-800">{res.branchName}</p>
                        <p className="text-[11px] text-slate-400">{res.warehouseName}</p>
                      </td>

                      {/* Quantity */}
                      <td className="p-4 text-center font-mono font-black text-slate-900 text-sm whitespace-nowrap">
                        <span className="px-3 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                          {res.quantity}
                        </span>
                      </td>

                      {/* Dates */}
                      <td className="p-4 text-[11px] text-slate-600 font-mono whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>حجز: {res.reservedAt}</span>
                        </div>
                        {res.deliveryTargetDate && (
                          <div className="text-emerald-700 text-[10px] font-bold mt-1 bg-emerald-50 px-2 py-0.5 rounded w-fit border border-emerald-200">
                            تسليم متوقع: {res.deliveryTargetDate}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap ${
                            res.status === "ACTIVE"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : res.status === "FULFILLED"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {res.status === "ACTIVE"
                            ? "🔒 محجوز نشط"
                            : res.status === "FULFILLED"
                            ? "✅ تم التسليم والخصم"
                            : "❌ تم الإلغاء والإفراج"}
                        </span>
                      </td>

                      {/* Link status action */}
                      <td className="p-4 text-center whitespace-nowrap">
                        {res.status === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 whitespace-nowrap">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            محجوز للعقد
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">مكتمل</span>
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
    </div>
  );
}

