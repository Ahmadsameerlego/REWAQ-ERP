"use client";

import React, { useState, useMemo } from "react";
import {
  Truck,
  Search,
  Filter,
  Plus,
  Calendar,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  Layers,
  LayoutGrid,
  List,
  Eye,
  ShieldCheck,
  Package,
} from "lucide-react";
import { useShowroom } from "@/context/ShowroomContext";
import { DeliveryOrder, DeliveryStatus } from "@/types/logistics";
import LogisticsNav from "@/components/logistics/LogisticsNav";
import DeliveryCard from "@/components/logistics/DeliveryCard";
import DeliveryDetailsModal from "@/components/logistics/DeliveryDetailsModal";
import CreateDeliveryModal from "@/components/logistics/CreateDeliveryModal";
import ReadinessCheckModal from "@/components/logistics/ReadinessCheckModal";
import PickingPackingModal from "@/components/logistics/PickingPackingModal";
import ScheduleAssignModal from "@/components/logistics/ScheduleAssignModal";
import ProofOfDeliveryModal from "@/components/logistics/ProofOfDeliveryModal";
import FailedDeliveryModal from "@/components/logistics/FailedDeliveryModal";
import CreateIssueModal from "@/components/logistics/CreateIssueModal";
import CreateReturnModal from "@/components/logistics/CreateReturnModal";

export default function DeliveriesOrdersPage() {
  const { deliveries, dispatchDelivery } = useShowroom();

  const [viewMode, setViewMode] = useState<"GRID" | "TABLE" | "PIPELINE">("GRID");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOrder | null>(null);
  const [readinessModalDelivery, setReadinessModalDelivery] = useState<DeliveryOrder | null>(null);
  const [pickPackDelivery, setPickPackDelivery] = useState<DeliveryOrder | null>(null);
  const [scheduleModalDelivery, setScheduleModalDelivery] = useState<DeliveryOrder | null>(null);
  const [podModalDelivery, setPodModalDelivery] = useState<DeliveryOrder | null>(null);
  const [failedModalDelivery, setFailedModalDelivery] = useState<DeliveryOrder | null>(null);
  const [issueModalDelivery, setIssueModalDelivery] = useState<DeliveryOrder | null>(null);
  const [returnModalDelivery, setReturnModalDelivery] = useState<DeliveryOrder | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((del) => {
      const matchesStatus = statusFilter === "ALL" || del.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        del.customerName.toLowerCase().includes(q) ||
        del.customerPhone.includes(q) ||
        del.deliveryNumber.toLowerCase().includes(q) ||
        del.contractNumber.toLowerCase().includes(q) ||
        (del.driverName && del.driverName.toLowerCase().includes(q)) ||
        del.city.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [deliveries, statusFilter, searchQuery]);

  const pipelineColumns: { status: DeliveryStatus; title: string; color: string }[] = [
    { status: "DRAFT", title: "مسودة غير مجهزة", color: "border-slate-300 bg-slate-50" },
    { status: "PREPARING", title: "جاري التجهيز بالمخزن", color: "border-amber-300 bg-amber-50/40" },
    { status: "READY", title: "جاهزة للتسليم", color: "border-emerald-300 bg-emerald-50/40" },
    { status: "SCHEDULED", title: "مجدولة", color: "border-blue-300 bg-blue-50/40" },
    { status: "ASSIGNED", title: "تم تعيين السائق", color: "border-indigo-300 bg-indigo-50/40" },
    { status: "OUT_FOR_DELIVERY", title: "في الطريق 🚚", color: "border-sky-400 bg-sky-50/40" },
    { status: "DELIVERED", title: "تم التسليم بنجاح ✅", color: "border-emerald-400 bg-emerald-50/40" },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-rewaq-gold/40 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-rewaq-gold" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Sub Nav */}
      <LogisticsNav onOpenCreateModal={() => setShowCreateModal(true)} />

      {/* Header & Controls */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900">
              إدارة أذون الشحنات وأوامر التسليم (Delivery Orders)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              عرض تفصيلي لجميع الشحنات ومراحل تجهيزها وجدولتها وتسليمها للعملاء.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode("GRID")}
                className={`p-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === "GRID" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
                title="عرض شبكي (Cards)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("TABLE")}
                className={`p-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === "TABLE" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
                title="عرض جدولي (Table)"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("PIPELINE")}
                className={`p-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === "PIPELINE" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
                title="مسار كانبان (Pipeline)"
              >
                <Layers className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إصدار إذن تسليم جديد</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالعميل، السائق، رقم العقد أو الشحنة..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 pr-9 text-xs text-slate-800 focus:outline-none focus:border-rewaq-gold focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto scrollbar-none">
            {[
              { id: "ALL", label: "الكل" },
              { id: "OUT_FOR_DELIVERY", label: "في الطريق" },
              { id: "ASSIGNED", label: "تم التعيين" },
              { id: "SCHEDULED", label: "مجدولة" },
              { id: "READY", label: "جاهزة" },
              { id: "PREPARING", label: "تجهيز" },
              { id: "DELIVERED", label: "تم التسليم" },
              { id: "FAILED", label: "متعثرة" },
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
      </div>

      {/* VIEW 1: GRID MODE */}
      {viewMode === "GRID" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeliveries.map((del) => (
            <DeliveryCard
              key={del.id}
              delivery={del}
              onSelect={(d) => setSelectedDelivery(d)}
              onCheckReadiness={(d) => setReadinessModalDelivery(d)}
              onPickPack={(d) => setPickPackDelivery(d)}
              onScheduleAssign={(d) => setScheduleModalDelivery(d)}
              onDispatch={(d) => {
                dispatchDelivery(d.id);
                triggerToast(`خرجت الشحنة #${d.deliveryNumber} للتسليم 🚚`);
              }}
              onCompletePOD={(d) => setPodModalDelivery(d)}
              onFail={(d) => setFailedModalDelivery(d)}
            />
          ))}
        </div>
      )}

      {/* VIEW 2: TABLE MODE */}
      {viewMode === "TABLE" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3.5">رقم الإذن</th>
                  <th className="p-3.5">العميل والهاتف</th>
                  <th className="p-3.5">العقد والفرع</th>
                  <th className="p-3.5">الأصناف والتجهيز</th>
                  <th className="p-3.5">الموعد المحدد</th>
                  <th className="p-3.5">السائق والسيارة</th>
                  <th className="p-3.5">التحصيل (COD)</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDeliveries.map((del) => (
                  <tr key={del.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 font-mono font-black text-slate-900">
                      #{del.deliveryNumber}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{del.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{del.customerPhone}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-slate-700">#{del.contractNumber}</div>
                      <div className="text-[11px] text-slate-500">{del.branch}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-800 truncate max-w-xs">
                        {del.items.map((i) => i.productName).join(" + ")}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        مجهز: {del.items.reduce((s, i) => s + i.pickedQty, 0)} / {del.items.reduce((s, i) => s + i.quantity, 0)}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800">{del.scheduledDate}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{del.timeWindow}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800">{del.driverName || "غير مسند"}</div>
                      <div className="text-[10px] text-slate-500">{del.vehiclePlate || "-"}</div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-amber-700">
                      {del.codAmount.toLocaleString()} ج.م
                    </td>
                    <td className="p-3.5">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg border bg-slate-100 border-slate-200">
                        {del.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedDelivery(del)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-2xs hover:bg-slate-50 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>تفاصيل</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: PIPELINE KANBAN MODE */}
      {viewMode === "PIPELINE" && (
        <div className="flex items-start gap-4 overflow-x-auto pb-4 scrollbar-none">
          {pipelineColumns.map((col) => {
            const columnDeliveries = filteredDeliveries.filter((d) => d.status === col.status);
            return (
              <div
                key={col.status}
                className="w-80 shrink-0 bg-white rounded-3xl border border-slate-200 p-4 space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-black text-xs text-slate-900">{col.title}</span>
                  <span className="font-mono text-xs font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg">
                    {columnDeliveries.length}
                  </span>
                </div>

                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                  {columnDeliveries.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs italic">
                      لا توجد شحنات
                    </div>
                  ) : (
                    columnDeliveries.map((del) => (
                      <div
                        key={del.id}
                        onClick={() => setSelectedDelivery(del)}
                        className="p-3 rounded-2xl border border-slate-200 hover:border-rewaq-gold bg-slate-50/50 hover:bg-white transition cursor-pointer shadow-2xs space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-black text-slate-900">
                            #{del.deliveryNumber}
                          </span>
                          <span className="font-mono font-bold text-amber-700 text-[11px]">
                            {del.codAmount.toLocaleString()} ج
                          </span>
                        </div>
                        <div className="font-bold text-slate-800">{del.customerName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center justify-between">
                          <span>{del.city}</span>
                          <span className="font-mono">{del.scheduledDate}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ALL MODALS */}
      {selectedDelivery && (
        <DeliveryDetailsModal
          delivery={selectedDelivery}
          onClose={() => setSelectedDelivery(null)}
          onCheckReadiness={(d) => {
            setSelectedDelivery(null);
            setReadinessModalDelivery(d);
          }}
          onPickPack={(d) => {
            setSelectedDelivery(null);
            setPickPackDelivery(d);
          }}
          onScheduleAssign={(d) => {
            setSelectedDelivery(null);
            setScheduleModalDelivery(d);
          }}
          onDispatch={(d) => {
            dispatchDelivery(d.id);
            triggerToast(`خرجت الشحنة #${d.deliveryNumber} للتسليم 🚚`);
            setSelectedDelivery(null);
          }}
          onCompletePOD={(d) => {
            setSelectedDelivery(null);
            setPodModalDelivery(d);
          }}
          onFail={(d) => {
            setSelectedDelivery(null);
            setFailedModalDelivery(d);
          }}
          onReportIssue={(d) => {
            setSelectedDelivery(null);
            setIssueModalDelivery(d);
          }}
          onCreateReturn={(d) => {
            setSelectedDelivery(null);
            setReturnModalDelivery(d);
          }}
        />
      )}

      {readinessModalDelivery && (
        <ReadinessCheckModal
          delivery={readinessModalDelivery}
          onClose={() => setReadinessModalDelivery(null)}
          onMarkReadySuccess={() => triggerToast("تم اعتماد جاهزية الشحنة بنجاح ✅")}
        />
      )}

      {pickPackDelivery && (
        <PickingPackingModal
          delivery={pickPackDelivery}
          onClose={() => setPickPackDelivery(null)}
          onPickingCompleted={() => triggerToast("تم تحديث حالة التجهيز بالمستودع 📦")}
        />
      )}

      {scheduleModalDelivery && (
        <ScheduleAssignModal
          delivery={scheduleModalDelivery}
          onClose={() => setScheduleModalDelivery(null)}
          onSuccess={() => triggerToast("تمت الجدولة وتعيين الأسطول بنجاح 🗓️")}
        />
      )}

      {podModalDelivery && (
        <ProofOfDeliveryModal
          delivery={podModalDelivery}
          onClose={() => setPodModalDelivery(null)}
          onSuccess={() => triggerToast("تم إثبات التسليم وخصم المخزون وتحصيل الـ COD بنجاح 🏁")}
        />
      )}

      {failedModalDelivery && (
        <FailedDeliveryModal
          delivery={failedModalDelivery}
          onClose={() => setFailedModalDelivery(null)}
          onSuccess={() => triggerToast("تم تسجيل تعثر التسليم وتحديث المسار ⚠️")}
        />
      )}

      {issueModalDelivery && (
        <CreateIssueModal
          delivery={issueModalDelivery}
          onClose={() => setIssueModalDelivery(null)}
          onSuccess={() => triggerToast("تم تسجيل بلاغ المشكلة وربطه بالعقد ⚠️")}
        />
      )}

      {returnModalDelivery && (
        <CreateReturnModal
          delivery={returnModalDelivery}
          onClose={() => setReturnModalDelivery(null)}
          onSuccess={() => triggerToast("تم تسجيل طلب الإرجاع وتحديث رصيد المخزن 🔄")}
        />
      )}

      {showCreateModal && (
        <CreateDeliveryModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => triggerToast("تم إصدار إذن التسليم بنجاح ✨")}
        />
      )}
    </div>
  );
}
