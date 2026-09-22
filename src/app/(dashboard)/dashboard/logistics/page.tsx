"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Truck,
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Package,
  Layers,
  ArrowRight,
  Plus,
  Search,
  Filter,
  Users2,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  ChevronLeft,
  Bot,
  UserCheck,
  Building2,
  Warehouse,
  AlertCircle,
  X,
} from "lucide-react";
import { useShowroom } from "@/context/ShowroomContext";
import { DeliveryOrder, DeliveryStatus, LogisticsUserRole } from "@/types/logistics";
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
import RouteIntelligenceCard from "@/components/logistics/RouteIntelligenceCard";
import SmartAssistantWidget from "@/components/logistics/SmartAssistantWidget";

export default function LogisticsDashboardPage() {
  const {
    deliveries,
    drivers,
    vehicles,
    deliveryIssues,
    deliveryReturns,
    logisticsInsights,
    dispatchDelivery,
    dismissLogisticsInsight,
  } = useShowroom();

  // Active Role View Filter
  const [currentRole, setCurrentRole] = useState<LogisticsUserRole>("ADMIN");

  // Filter & Search
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
  const [showAssistantModal, setShowAssistantModal] = useState<boolean>(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // KPI Calculations
  const todayStr = new Date().toISOString().split("T")[0];
  const deliveriesToday = useMemo(() => deliveries.filter((d) => d.scheduledDate === todayStr), [deliveries, todayStr]);
  const outForDelivery = useMemo(() => deliveries.filter((d) => d.status === "OUT_FOR_DELIVERY"), [deliveries]);
  const readyForDelivery = useMemo(() => deliveries.filter((d) => d.status === "READY"), [deliveries]);
  const preparingDeliveries = useMemo(() => deliveries.filter((d) => d.status === "PREPARING" || d.status === "DRAFT"), [deliveries]);
  const deliveredCount = useMemo(() => deliveries.filter((d) => d.status === "DELIVERED").length, [deliveries]);
  const delayedOrFailedCount = useMemo(() => deliveries.filter((d) => d.status === "FAILED" || d.status === "RESCHEDULED").length, [deliveries]);
  const readyNotScheduledCount = useMemo(() => deliveries.filter((d) => d.status === "READY" && !d.driverId).length, [deliveries]);

  const totalCodCollected = useMemo(() => {
    return deliveries
      .filter((d) => d.status === "DELIVERED" && d.proofOfDelivery)
      .reduce((sum, d) => sum + (d.proofOfDelivery?.codCollected || d.codAmount), 0);
  }, [deliveries]);

  const totalCodPending = useMemo(() => {
    return deliveries
      .filter((d) => d.status === "OUT_FOR_DELIVERY" || d.status === "ASSIGNED" || d.status === "SCHEDULED")
      .reduce((sum, d) => sum + d.codAmount, 0);
  }, [deliveries]);

  const completionRate = useMemo(() => {
    if (deliveries.length === 0) return 100;
    return Math.round((deliveredCount / deliveries.length) * 100);
  }, [deliveries, deliveredCount]);

  // Filtered Deliveries
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((del) => {
      // Role perspective filtering
      if (currentRole === "WAREHOUSE_EMPLOYEE") {
        if (del.status === "DELIVERED" || del.status === "CANCELLED") return false;
      }

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
  }, [deliveries, statusFilter, searchQuery, currentRole]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-rewaq-gold/40 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-rewaq-gold" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Sub-Navigation */}
      <LogisticsNav
        onOpenCreateModal={() => setShowCreateModal(true)}
        onOpenAssistant={() => setShowAssistantModal(true)}
      />

      {/* Top Banner & Perspective Switcher */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/90 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-900 text-rewaq-gold shadow-2xs flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              مركز القيادة اللوجستية وتوصيل الأثاث
            </span>
            <span className="text-xs text-slate-400 font-bold">|</span>
            <span className="text-xs font-bold text-slate-600">
              Simple Core + Smart Layer
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">
            لوحة تحكم حركة الشحن والتركيبات الميدانية
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
            متابعة رحلة المنتج من لحظة الجاهزية بالمستودع وحتى وصوله للعميل وتركيبه وتحصيل البواقي (COD)، مع اكتشاف المشاكل والتعارضات مبكراً.
          </p>
        </div>

        {/* Roles Selector */}
        <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200 flex flex-col gap-1.5 shrink-0">
          <span className="text-[10px] font-black text-slate-500 pr-1 block">منظور المستخدم الحالي (Role):</span>
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs">
            {[
              { id: "ADMIN", label: "الإدارة العامة" },
              { id: "DELIVERY_COORDINATOR", label: "منسق الشحن" },
              { id: "WAREHOUSE_EMPLOYEE", label: "مسؤول المستودع" },
              { id: "BRANCH_MANAGER", label: "مدير الفرع" },
            ].map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setCurrentRole(role.id as LogisticsUserRole)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  currentRole === role.id
                    ? "bg-slate-900 text-white shadow-xs font-black"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Stats Matrix (8 Responsive Metric Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Deliveries Today */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>تسليمات اليوم</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {deliveriesToday.length} <span className="text-xs font-bold text-slate-500">شحنات</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium block">
            {outForDelivery.length} في الطريق حالياً
          </span>
        </div>

        {/* Card 2: Ready for Delivery */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-bold">
            <span>جاهزة للتسليم (Ready)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {readyForDelivery.length} <span className="text-xs font-bold text-emerald-800">طلبات</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-bold block">
            {readyNotScheduledCount > 0 ? `⚠️ ${readyNotScheduledCount} جاهزة وغير مجدولة` : "مجدولة بالكامل"}
          </span>
        </div>

        {/* Card 3: Out for Delivery (In Transit) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-sky-800 text-xs font-bold">
            <span>في الطريق للعميل 🚚</span>
            <Truck className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-sky-700 font-mono">
            {outForDelivery.length} <span className="text-xs font-bold text-sky-800">سيارات</span>
          </div>
          <span className="text-[11px] text-sky-700 font-mono font-bold block">
            بواقي جاري تحصيلها: {totalCodPending.toLocaleString()} ج
          </span>
        </div>

        {/* Card 4: Delivered & Paid */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-bold">
            <span>تم التسليم والسداد (POD)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-800 font-mono">
            {deliveredCount} <span className="text-xs font-bold text-emerald-800">شحنات</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-mono font-bold block">
            تحصيلات كاش: {totalCodCollected.toLocaleString()} ج
          </span>
        </div>

        {/* Card 5: Needs Preparation (Picking) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-amber-800 text-xs font-bold">
            <span>تحت التجهيز والتجميع</span>
            <Package className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">
            {preparingDeliveries.length} <span className="text-xs font-bold text-amber-800">عقود</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium block">
            تجهيز عينات وفحص مستودع
          </span>
        </div>

        {/* Card 6: Delayed or Rescheduled */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-rose-800 text-xs font-bold">
            <span>متأخرة / معاد جدولتها</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 font-mono">
            {delayedOrFailedCount} <span className="text-xs font-bold text-rose-800">شحنات</span>
          </div>
          <span className="text-[11px] text-rose-700 font-bold block">
            تتطلب متابعة مع العميل
          </span>
        </div>

        {/* Card 7: Drivers Fleet */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>أسطول السائقين والسيارات</span>
            <Users2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {drivers.filter((d) => d.status === "AVAILABLE").length} / {drivers.length}{" "}
            <span className="text-xs font-bold text-slate-500">سائق متاح</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium block">
            {vehicles.length} سيارات شحن نشطة
          </span>
        </div>

        {/* Card 8: Completion Rate */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>نسبة الإنجاز في الموعد</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {completionRate}%
          </div>
          <span className="text-[11px] text-emerald-600 font-bold block">
            معدل تسليم أثاث قياسي
          </span>
        </div>
      </div>

      {/* Smart Logistics Insights Engine (Alerts & Suggestions) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rewaq-gold" />
            <h2 className="text-sm font-black text-slate-900">
              تنبيهات وتوصيات الذكاء اللوجستي (Smart Logistics Insights)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            يقترح النظام ولا يقوم بتغيير المواعيد أو الإلغاء تلقائياً
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {logisticsInsights.map((ins) => {
            const isResolved = ins.resolved;
            return (
              <div
                key={ins.id}
                className={`p-4 rounded-2xl border transition space-y-2.5 ${
                  isResolved
                    ? "bg-slate-50 border-slate-200 opacity-60"
                    : ins.severity === "CRITICAL"
                    ? "bg-rose-50/80 border-rose-200 text-rose-950 shadow-2xs"
                    : ins.severity === "WARNING"
                    ? "bg-amber-50/80 border-amber-200 text-amber-950 shadow-2xs"
                    : "bg-blue-50/80 border-blue-200 text-blue-950 shadow-2xs"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-black text-xs">
                    {ins.severity === "CRITICAL" ? (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : ins.severity === "WARNING" ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                    <span className="truncate">{ins.title}</span>
                  </div>

                  {!isResolved && (
                    <button
                      type="button"
                      onClick={() => dismissLogisticsInsight(ins.id)}
                      className="text-[10px] text-slate-400 hover:text-slate-600"
                    >
                      تجاهل
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                  {ins.description}
                </p>

                <div className="text-[11px] text-slate-600 bg-white/70 p-2 rounded-xl border border-black/5">
                  <span className="font-bold block text-slate-800">التوصية المقترحة:</span>
                  {ins.recommendation}
                </div>

                {!isResolved && ins.actionLabel && (
                  <button
                    type="button"
                    onClick={() => {
                      if (ins.actionType === "SCHEDULE" && ins.affectedDeliveryIds?.[0]) {
                        const target = deliveries.find((d) => d.id === ins.affectedDeliveryIds?.[0]);
                        if (target) setScheduleModalDelivery(target);
                      } else if (ins.actionType === "GROUP_ROUTE") {
                        const target = deliveries.find((d) => d.id === ins.affectedDeliveryIds?.[0]);
                        if (target) setScheduleModalDelivery(target);
                      } else {
                        triggerToast("تم تنفيذ التوصية الذكية بنجاح");
                      }
                    }}
                    className="w-full text-xs font-black py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>{ins.actionLabel}</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Route Intelligence Geographic Grouping Card */}
      <RouteIntelligenceCard
        onGroupRouteSuccess={() => triggerToast("تم دمج خط السير وتعيين السائق بنجاح 🚚")}
      />

      {/* Deliveries Main Pipeline & Filter Bar */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالعميل، السائق، رقم العقد أو إذن التسليم..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pr-9 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rewaq-gold focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          </div>

          {/* Status Filter Tabs */}
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

        {/* Deliveries Grid Cards */}
        {filteredDeliveries.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <Truck className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-black text-slate-800">لا توجد شحنات مطابقة للبحث أو الفلتر</h3>
            <p className="text-xs text-slate-400">
              يمكنك إصدار إذن تسليم جديد من العقود المعتمدة بالـ POS.
            </p>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إصدار إذن تسليم الآن</span>
            </button>
          </div>
        ) : (
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
                  triggerToast(`خرجت الشحنة #${d.deliveryNumber} مع السائق ${d.driverName || "المسؤول"} 🚚`);
                }}
                onCompletePOD={(d) => setPodModalDelivery(d)}
                onFail={(d) => setFailedModalDelivery(d)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Embedded Smart Assistant Widget */}
      <SmartAssistantWidget
        onSelectDelivery={(delId) => {
          const matched = deliveries.find((d) => d.id === delId);
          if (matched) setSelectedDelivery(matched);
        }}
      />

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
          onCreated={(delId) => triggerToast(`تم إصدار إذن التسليم بنجاح ✨`)}
        />
      )}

      {showAssistantModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden relative">
            <button
              type="button"
              onClick={() => setShowAssistantModal(false)}
              className="absolute left-4 top-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <SmartAssistantWidget
              standalone
              onSelectDelivery={(id) => {
                setShowAssistantModal(false);
                const d = deliveries.find((del) => del.id === id);
                if (d) setSelectedDelivery(d);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
