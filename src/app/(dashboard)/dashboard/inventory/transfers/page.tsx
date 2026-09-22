"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRightLeft,
  Truck,
  CheckCircle2,
  X,
  Layers,
  Sparkles,
  ArrowRight
} from "lucide-react";
import {
  useShowroom
} from "@/context/ShowroomContext";

export default function TransfersPage() {
  const {
    products,
    warehouses,
    transferOrders,
    createTransferOrder,
    approveTransferOrder,
    shipTransferOrder,
    receiveTransferOrder
  } = useShowroom();

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
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
            <span className="text-slate-900 font-bold">أوامر التحويل بين الفروع</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">
            أوامر التحويل بين المستودعات والمعارض
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            دورة التحويل: طلب تحويل ➔ اعتماد الإدارة ➔ شحن وخروج بالطريق ➔ استلام وتسكين بالمستودع الوجهة.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsTransferModalOpen(true)}
          className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl shadow-xs transition"
        >
          <ArrowRightLeft className="w-4 h-4" />
          + إنشاء أمر تحويل جديد
        </button>
      </div>

      {/* Transfers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {transferOrders.map((order) => {
          return (
            <div key={order.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    {order.transferNumber}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">أنشئ بواسطة: {order.requestedBy} • {order.requestedAt}</p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === "REQUESTED"
                      ? "bg-slate-100 text-slate-700"
                      : order.status === "APPROVED"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : order.status === "IN_TRANSIT"
                      ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {order.status === "REQUESTED"
                    ? "⏳ بانتظار الاعتماد"
                    : order.status === "APPROVED"
                    ? "👍 معتمد للشحن"
                    : order.status === "IN_TRANSIT"
                    ? "🚚 جاري النقل بالطريق"
                    : "✅ تم الاستلام والتسكين"}
                </span>
              </div>

              {/* Route Visualizer */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="text-[10px] text-slate-400">من مستودع:</p>
                  <p className="font-bold text-slate-900">{order.fromBranch}</p>
                  <p className="text-[10px] text-slate-500">{order.fromWarehouse}</p>
                </div>

                <ArrowRightLeft className="w-5 h-5 text-rewaq-gold" />

                <div className="text-left">
                  <p className="text-[10px] text-slate-400">إلى مستودع:</p>
                  <p className="font-bold text-slate-900">{order.toBranch}</p>
                  <p className="text-[10px] text-slate-500">{order.toWarehouse}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-slate-600">الصنف المطلوب تحويله:</p>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <span className="font-bold text-slate-800">{order.productName}</span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {order.quantity} قطع
                  </span>
                </div>
              </div>

              {order.notes && <p className="text-xs text-slate-500 italic">ملاحظات: {order.notes}</p>}

              {/* Action Workflow Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                {order.status === "REQUESTED" && (
                  <button
                    type="button"
                    onClick={() => {
                      approveTransferOrder(order.id, "أحمد سمير (المدير العام)");
                      triggerToast("👍 تم اعتماد طلب التحويل!");
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                  >
                    اعتماد التحويل
                  </button>
                )}
                {order.status === "APPROVED" && (
                  <button
                    type="button"
                    onClick={() => {
                      shipTransferOrder(order.id, "كابتن محمود فوزي (سيارة 412)");
                      triggerToast("🚚 تم شحن الطلب وتحديث المخزون (بالطريق)!");
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    شحن وخروج من المخزن
                  </button>
                )}
                {order.status === "IN_TRANSIT" && (
                  <button
                    type="button"
                    onClick={() => {
                      receiveTransferOrder(order.id, "أمين المستودع");
                      triggerToast("✅ تم تأكيد استلام الشحنة وتسكينها بالمستودع الوجهة!");
                    }}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    تأكيد الاستلام والتسكين
                  </button>
                )}
                {order.status === "RECEIVED" && (
                  <span className="text-[11px] text-emerald-600 font-bold">تم إتمام التحويل وتسوية الأرصدة بنجاح</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: CREATE TRANSFER ORDER */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">طلب تحويل مخزون بين الفروع</h3>
              <button type="button" onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const fromWarehouseId = fd.get("fromWarehouseId") as string;
                const toWarehouseId = fd.get("toWarehouseId") as string;
                const productId = fd.get("productId") as string;
                const quantity = Number(fd.get("quantity"));
                const notes = fd.get("notes") as string;

                if (fromWarehouseId === toWarehouseId) {
                  alert("لا يمكن التحويل لنفس المستودع!");
                  return;
                }

                const fromW = warehouses.find((w) => w.id === fromWarehouseId);
                const toW = warehouses.find((w) => w.id === toWarehouseId);
                const product = products.find((p) => p.id === productId);

                createTransferOrder({
                  productId,
                  productName: product?.name || "",
                  fromBranch: fromW?.branchName || "",
                  fromWarehouse: fromW?.name || "",
                  toBranch: toW?.branchName || "",
                  toWarehouse: toW?.name || "",
                  quantity,
                  requestedBy: "أحمد سمير (المدير العام)",
                  notes,
                });

                setIsTransferModalOpen(false);
                triggerToast("✅ تم إنشاء أمر التحويل بنجاح!");
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">من مستودع (المصدر) *</label>
                  <select
                    name="fromWarehouseId"
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
                  <label className="block font-bold text-slate-700 mb-1">إلى مستودع (الوجهة) *</label>
                  <select
                    name="toWarehouseId"
                    required
                    defaultValue={warehouses[1]?.id}
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
                <label className="block font-bold text-slate-700 mb-1">الصنف المطلوب تحويله *</label>
                <select
                  name="productId"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rewaq-gold"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الكمية المطلوبة *</label>
                <input
                  name="quantity"
                  type="number"
                  min="1"
                  required
                  defaultValue="1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-rewaq-gold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات التحويل</label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="سبب التحويل، أو تعليمات الشحن والتغليف..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rewaq-gold"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black rounded-xl text-xs"
                >
                  تأكيد وإصدار الطلب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
