"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  ArrowDownLeft,
  Receipt,
  Scale,
  RotateCcw,
  Printer,
  FileSpreadsheet,
  Building,
  Calendar,
  DollarSign,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import PurchasingNav from "@/components/purchasing/PurchasingNav";
import { usePurchasing } from "@/context/PurchasingContext";
import { formatEGP } from "@/lib/accountingEngine";
import CreatePurchaseOrderModal from "@/components/purchasing/CreatePurchaseOrderModal";
import ReceivePurchaseModal from "@/components/purchasing/ReceivePurchaseModal";
import CreateSupplierBillModal from "@/components/purchasing/CreateSupplierBillModal";
import CreateReturnModal from "@/components/purchasing/CreateReturnModal";
import ThreeWayMatchModal from "@/components/purchasing/ThreeWayMatchModal";
import { PurchaseOrder } from "@/types/purchasing";

export default function PurchaseOrdersPage() {
  const {
    purchaseOrders,
    approvePurchaseOrder,
    sendPOToSupplier,
    cancelPurchaseOrder,
  } = usePurchasing();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  // Active action modals
  const [receiveModalPO, setReceiveModalPO] = useState<PurchaseOrder | null>(null);
  const [invoiceModalPO, setInvoiceModalPO] = useState<PurchaseOrder | null>(null);
  const [returnModalPO, setReturnModalPO] = useState<PurchaseOrder | null>(null);
  const [threeWayModalPO, setThreeWayModalPO] = useState<PurchaseOrder | null>(null);
  const [cancelModalPO, setCancelModalPO] = useState<PurchaseOrder | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const filteredOrders = purchaseOrders.filter((po) => {
    const matchesStatus = statusFilter === "ALL" || po.status === statusFilter;
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.items.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleCancel = (poId: string) => {
    if (!cancelReason.trim()) return;
    cancelPurchaseOrder(poId, "أحمد سمير (المدير العام)", cancelReason);
    setCancelModalPO(null);
    setCancelReason("");
  };

  return (
    <div className="space-y-6">
      <PurchasingNav onOpenCreatePO={() => setIsCreateOpen(true)} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>المشتريات</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">أوامر الشراء والتوريد (POs)</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">
            أوامر الشراء والتوريد للمصانع والموردين (Purchase Orders)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            إدارة دورة أمر الشراء: الصياغة → الاعتماد → الإرسال للمورد → الاستلام الجزئي/الكامل → إثبات الفاتورة والمطابقة.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ إصدار أمر شراء جديد</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم الأمر، المورد، أو الموديل..."
              className="w-64 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 pr-8 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rewaq-gold"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-rewaq-gold"
          >
            <option value="ALL">جميع حالات الأوامر</option>
            <option value="PENDING_APPROVAL">⏳ بانتظار الاعتماد</option>
            <option value="APPROVED">✅ معتمد (جاهز للإرسال)</option>
            <option value="SENT">📦 مرسل للمورد (في الطريق)</option>
            <option value="PARTIAL_RECEIVED">⚠️ تم استلامه جزئياً</option>
            <option value="FULLY_RECEIVED">🎉 تم الاستلام بالكامل</option>
            <option value="CANCELLED">❌ ملغي</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-bold">
          عدد الأوامر المعروضة: <strong className="text-slate-900 font-black">{filteredOrders.length}</strong>
        </div>
      </div>

      {/* Orders List / Cards */}
      <div className="space-y-4">
        {filteredOrders.map((po) => {
          const totalQty = po.items.reduce((sum, it) => sum + it.quantity, 0);
          const receivedQty = po.items.reduce((sum, it) => sum + it.receivedQuantity, 0);
          const remainingQty = po.items.reduce((sum, it) => sum + it.remainingQuantity, 0);
          const completionPercent = totalQty > 0 ? Math.round((receivedQty / totalQty) * 100) : 0;

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
                📦 تم الإرسال للمورد
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
          } else if (po.status === "CANCELLED") {
            statusBadge = (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                ❌ ملغي
              </span>
            );
          }

          return (
            <div
              key={po.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition"
            >
              {/* Top Row: PO Number, Supplier, Status, Dates */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 text-rewaq-gold font-mono font-black text-xs flex items-center justify-center">
                    PO
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-mono font-black text-sm text-slate-900">{po.poNumber}</h3>
                      {statusBadge}
                    </div>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">
                      المورد: <span className="text-slate-900 font-black">{po.supplierName}</span> ({po.supplierTaxId})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div>
                    <span className="text-[10px] block">تاريخ الأمر:</span>
                    <strong className="text-slate-800 font-mono">{po.orderDate}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] block">موعد التسليم المتوقع:</span>
                    <strong className="text-slate-800 font-mono">{po.expectedDeliveryDate}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] block">المستودع المستهدف:</span>
                    <strong className="text-slate-800">{po.warehouseName}</strong>
                  </div>
                </div>
              </div>

              {/* Items & Receiving Progress */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                {/* Items Summary */}
                <div className="lg:col-span-2 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 block">
                    الأصناف والبنود المطلوبة:
                  </span>
                  <div className="space-y-1.5">
                    {po.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl text-slate-800"
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900">{item.productName}</p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            كود المورد: {item.supplierSku} | سعر الوحدة: {formatEGP(item.unitPrice)}
                          </span>
                        </div>

                        <div className="text-left font-mono">
                          <span className="font-bold text-slate-900">
                            {item.quantity} {item.unit}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            (مستلم: {item.receivedQuantity} / متبقي: {item.remainingQuantity})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial & Receiving Fulfillment Pill */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span>إجمالي البضاعة:</span>
                      <span className="font-mono">{formatEGP(po.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>ضريبة القيمة المضافة 14%:</span>
                      <span className="font-mono">{formatEGP(po.totalTax)}</span>
                    </div>
                    <div className="flex justify-between font-black text-sm text-white border-t border-slate-800 pt-1.5">
                      <span>القيمة الإجمالية:</span>
                      <span className="font-mono text-rewaq-gold text-base">{formatEGP(po.grandTotal)}</span>
                    </div>
                  </div>

                  {/* Fulfillment Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-300">
                      <span>نسبة الاستلام والتسكين بالمخزن:</span>
                      <span className="font-bold font-mono">{completionPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {/* Three-way match button */}
                  <button
                    type="button"
                    onClick={() => setThreeWayModalPO(po)}
                    className="inline-flex items-center gap-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>فحص المطابقة 3-Way</span>
                  </button>

                  {/* Returns button */}
                  <button
                    type="button"
                    onClick={() => setReturnModalPO(po)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>إرجاع بضاعة</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Pending Approval -> Approve */}
                  {po.status === "PENDING_APPROVAL" && (
                    <button
                      type="button"
                      onClick={() => approvePurchaseOrder(po.id, "أحمد سمير")}
                      className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      اعتماد الأمر
                    </button>
                  )}

                  {/* Approved -> Send to supplier */}
                  {po.status === "APPROVED" && (
                    <button
                      type="button"
                      onClick={() => sendPOToSupplier(po.id, "أحمد سمير")}
                      className="inline-flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      إرسال وتأكيد الطلب مع المورد
                    </button>
                  )}

                  {/* Sent or Partially Received -> Receive Goods */}
                  {(po.status === "SENT" || po.status === "PARTIAL_RECEIVED") && (
                    <button
                      type="button"
                      onClick={() => setReceiveModalPO(po)}
                      className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      تسجيل استلام بضاعة واردة
                    </button>
                  )}

                  {/* Create Supplier Bill */}
                  <button
                    type="button"
                    onClick={() => setInvoiceModalPO(po)}
                    className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5 text-rewaq-gold" />
                    تسجيل فاتورة المورد
                  </button>

                  {/* Cancel PO */}
                  {po.status !== "CANCELLED" && po.status !== "FULLY_RECEIVED" && (
                    <button
                      type="button"
                      onClick={() => setCancelModalPO(po)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition"
                      title="إلغاء أمر الشراء"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancel Reason Modal */}
      {cancelModalPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-slate-900">
              تأكيد إلغاء أمر الشراء #{cancelModalPO.poNumber}
            </h3>
            <p className="text-xs text-slate-500">
              يرجى إدخال سبب الإلغاء للتوثيق في سجل العمليات:
            </p>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="مثال: تغيير طلب العميل / تعذر التوريد من المصنع..."
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rewaq-gold"
              required
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelModalPO(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                رجوع
              </button>
              <button
                type="button"
                onClick={() => handleCancel(cancelModalPO.id)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700"
              >
                تأكيد الإلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isCreateOpen && (
        <CreatePurchaseOrderModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
      )}

      {receiveModalPO && (
        <ReceivePurchaseModal
          isOpen={!!receiveModalPO}
          onClose={() => setReceiveModalPO(null)}
          purchaseOrder={receiveModalPO}
        />
      )}

      {invoiceModalPO && (
        <CreateSupplierBillModal
          isOpen={!!invoiceModalPO}
          onClose={() => setInvoiceModalPO(null)}
          purchaseOrder={invoiceModalPO}
        />
      )}

      {returnModalPO && (
        <CreateReturnModal
          isOpen={!!returnModalPO}
          onClose={() => setReturnModalPO(null)}
          purchaseOrder={returnModalPO}
        />
      )}

      {threeWayModalPO && (
        <ThreeWayMatchModal
          isOpen={!!threeWayModalPO}
          onClose={() => setThreeWayModalPO(null)}
          purchaseOrder={threeWayModalPO}
        />
      )}
    </div>
  );
}
