"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  CheckCircle2,
  AlertTriangle,
  Package,
  ShieldCheck,
  Search,
  Plus,
  RotateCcw,
  Building,
  User,
  Truck,
  Eye,
} from "lucide-react";
import PurchasingNav from "@/components/purchasing/PurchasingNav";
import { usePurchasing } from "@/context/PurchasingContext";
import ReceivePurchaseModal from "@/components/purchasing/ReceivePurchaseModal";
import CreateReturnModal from "@/components/purchasing/CreateReturnModal";
import { PurchaseReceiving } from "@/types/purchasing";

export default function ReceivingInspectionPage() {
  const { receivings, purchaseOrders } = usePurchasing();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceiving, setSelectedReceiving] = useState<PurchaseReceiving | null>(null);
  const [returnPoId, setReturnPoId] = useState<string | null>(null);

  const filteredReceivings = receivings.filter(
    (rcv) =>
      rcv.receivingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rcv.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rcv.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rcv.items.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalReceivedPieces = receivings.reduce((sum, r) => sum + r.totalReceivedQty, 0);
  const totalDamagedPieces = receivings.reduce((sum, r) => sum + r.totalDamagedQty, 0);

  const poToReturn = purchaseOrders.find((p) => p.id === returnPoId);

  return (
    <div className="space-y-6">
      <PurchasingNav />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>المشتريات</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">أذون الاستلام وفحص الجودة</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">
            أذون استلام التوريدات وفحص الجودة بالمستودعات
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            فحص الشحنات الواردة، فرز السليم عن التالف، وتسكين الكميات المقبولة في رصيد المخزون الفعلي دون إعادة إدخال.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>إجمالي المستلم السليم: <strong className="font-mono">{totalReceivedPieces - totalDamagedPieces}</strong> قطعة</span>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم الإذن، أمر الشراء، المورد، أو الصنف..."
            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 pr-9 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rewaq-gold"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <div className="text-xs text-slate-500 font-bold">
          عدد الشحنات المستلمة: <strong className="text-slate-900 font-black">{receivings.length}</strong>
        </div>
      </div>

      {/* Receivings List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReceivings.map((rcv) => {
          const isAllGood = rcv.totalDamagedQty === 0;

          return (
            <div
              key={rcv.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs bg-slate-900 text-rewaq-gold px-2.5 py-1 rounded-lg">
                      {rcv.receivingNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      أمر: <strong className="text-slate-900 font-mono">{rcv.poNumber}</strong>
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isAllGood
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-amber-50 text-amber-900 border border-amber-300"
                    }`}
                  >
                    {isAllGood ? "✅ استلام سليم ومطابق" : "⚠️ استلام جزئي / به توالف"}
                  </span>
                </div>

                {/* Supplier & Warehouse */}
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-slate-900">المورد: {rcv.supplierName}</p>
                  <p className="text-slate-500">
                    المستودع: <strong>{rcv.destinationBranch} - {rcv.destinationWarehouse}</strong>
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>تاريخ الاستلام: {rcv.date}</span>
                    <span>المستلم: {rcv.receiverName}</span>
                  </div>
                </div>

                {/* Items Breakdown Table */}
                <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50 p-2.5 space-y-2 text-xs">
                  <span className="font-bold text-slate-700 block text-[11px]">
                    تفاصيل فحص الأصناف:
                  </span>
                  {rcv.items.map((it, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200/60 space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{it.productName}</span>
                        <span className="font-mono text-emerald-700">
                          +{it.goodQty} سليم
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>موقع التسكين: <strong>{it.warehouseLocationCode || "WH-A01"}</strong></span>
                        {it.damagedQty > 0 && (
                          <span className="text-rose-600 font-bold">
                            🚨 {it.damagedQty} تالف ({it.defectReason})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">
                  {rcv.deliveryNoteNumber ? `بوليصة المورد: ${rcv.deliveryNoteNumber}` : "تم التسكين الفوري"}
                </span>

                <div className="flex items-center gap-2">
                  {rcv.totalDamagedQty > 0 && (
                    <button
                      type="button"
                      onClick={() => setReturnPoId(rcv.poId)}
                      className="inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      إصدار إذن مرتجع
                    </button>
                  )}

                  <Link
                    href={`/dashboard/purchasing/orders`}
                    className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
                    title="عرض أمر الشراء"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Return Modal Shortcut */}
      {poToReturn && (
        <CreateReturnModal
          isOpen={!!poToReturn}
          onClose={() => setReturnPoId(null)}
          purchaseOrder={poToReturn}
        />
      )}
    </div>
  );
}
