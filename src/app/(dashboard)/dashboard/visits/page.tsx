"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Phone,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  Building2,
  Sparkles,
  X,
  Store,
  MapPin,
  Eye,
  Check,
  FileSpreadsheet,
  AlertCircle,
  TrendingUp,
  Filter,
  ChevronLeft
} from "lucide-react";
import { useShowroom, ShowroomVisit, NextAction } from "@/context/ShowroomContext";

export default function VisitsPage() {
  const {
    visits,
    addVisit,
    updateVisitStatus,
    checkInVisit,
    startInspection,
    endVisit,
    customers,
  } = useShowroom();

  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [repFilter, setRepFilter] = useState("ALL");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [endingVisit, setEndingVisit] = useState<ShowroomVisit | null>(null);

  // End Visit Dialog Form State
  const [outcomeForm, setOutcomeForm] = useState<{
    outcome: ShowroomVisit["outcome"];
    outcomeNotes: string;
    createFollowup: boolean;
    followupTask: string;
    followupDueDate: string;
    followupRep: string;
  }>({
    outcome: "VERY_INTERESTED",
    outcomeNotes: "",
    createFollowup: true,
    followupTask: "الاتصال بالعميل لمتابعة اختيار الألوان وتأكيد التعاقد",
    followupDueDate: "غداً 12:00 م",
    followupRep: "كريم يوسف",
  });

  // Add Visit Form State
  const [newVisitForm, setNewVisitForm] = useState({
    customerName: "",
    phone: "",
    branch: "فرع التجمع الرئيسي",
    salesRep: "كريم يوسف",
    visitDate: "اليوم",
    timeSlot: "05:00 م",
    roomInterest: "صالون نورديك 9 مقاعد",
    status: "CONFIRMED" as ShowroomVisit["status"],
    notes: "حجز موعد لمعاينة الأقمشة وخامات الخشب بالصالة",
  });

  const visitStatuses: { id: ShowroomVisit["status"]; label: string; badgeColor: string }[] = [
    { id: "SCHEDULED", label: "محجوز", badgeColor: "bg-slate-100 text-slate-700 border-slate-200" },
    { id: "CONFIRMED", label: "تم التأكيد", badgeColor: "bg-blue-50 text-blue-700 border-blue-200" },
    { id: "CHECKED_IN", label: "حضر بالصالة 📍", badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold" },
    { id: "INSPECTING", label: "جاري المعاينة 👁️", badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200 font-bold" },
    { id: "COMPLETED", label: "انتهت الزيارة ✅", badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300" },
    { id: "NO_SHOW", label: "لم يحضر ⚠️", badgeColor: "bg-rose-50 text-rose-700 border-rose-200" },
    { id: "CANCELLED", label: "ملغي", badgeColor: "bg-slate-100 text-slate-400 border-slate-200" },
  ];

  const handleCreateVisit = (e: React.FormEvent) => {
    e.preventDefault();
    addVisit(newVisitForm);
    setShowAddModal(false);
    setNewVisitForm({
      customerName: "",
      phone: "",
      branch: "فرع التجمع الرئيسي",
      salesRep: "كريم يوسف",
      visitDate: "اليوم",
      timeSlot: "05:00 م",
      roomInterest: "صالون نورديك 9 مقاعد",
      status: "CONFIRMED",
      notes: "حجز موعد لمعاينة الأقمشة وخامات الخشب بالصالة",
    });
  };

  const handleEndVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!endingVisit) return;

    let nextAction: NextAction | undefined = undefined;
    if (outcomeForm.createFollowup && outcomeForm.outcome !== "CONTRACTED") {
      nextAction = {
        task: outcomeForm.followupTask,
        dueDate: outcomeForm.followupDueDate,
        rep: outcomeForm.followupRep || endingVisit.salesRep,
        priority: outcomeForm.outcome === "VERY_INTERESTED" ? "urgent" : "normal",
        completed: false,
        channel: "call",
      };
    }

    endVisit(endingVisit.id, outcomeForm.outcome, outcomeForm.outcomeNotes, nextAction);
    setEndingVisit(null);
  };

  const filteredVisits = visits.filter((v) => {
    const matchesSearch = v.customerName.includes(searchQuery) || v.phone.includes(searchQuery) || v.roomInterest.includes(searchQuery);
    const matchesBranch = branchFilter === "ALL" || v.branch === branchFilter;
    const matchesStatus = statusFilter === "ALL" || v.status === statusFilter;
    const matchesRep = repFilter === "ALL" || v.salesRep === repFilter;
    return matchesSearch && matchesBranch && matchesStatus && matchesRep;
  });

  // KPIs
  const scheduledCount = visits.filter((v) => v.status === "SCHEDULED" || v.status === "CONFIRMED").length;
  const checkedInCount = visits.filter((v) => v.status === "CHECKED_IN" || v.status === "INSPECTING").length;
  const completedCount = visits.filter((v) => v.status === "COMPLETED").length;
  const totalVisitsCount = visits.length;

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Header Bar */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1">
              <span>الرئيسية</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <span className="text-xs text-slate-400">/</span>
            <Link href="/dashboard/crm" className="text-xs text-slate-400 hover:text-slate-700">
              إدارة العملاء
            </Link>
            <span className="text-xs text-slate-400">/</span>
            <span className="text-xs font-bold text-slate-700">زيارات الصالة والمواعيد</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            جدول زيارات ومعاينات صالات العرض (Showroom Visits & Check-in)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            تسجيل حضور العملاء لحظياً (Fast Check-in)، إدارة المعاينة بالصالة، والربط المباشر مع الـ POS لإنشاء التعاقدات.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow-xs transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ حجز موعد زيارة جديد بالمعرض</span>
        </button>
      </div>

      {/* 2. Operational KPIs Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-bold block mb-1">مواعيد اليوم القادمة</span>
          <div className="text-2xl font-black text-slate-900 font-mono">{scheduledCount}</div>
          <span className="text-[10px] text-blue-600 font-bold">بانتظار وصول العملاء</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-bold block mb-1">حضروا بالصالة الآن (Checked-in)</span>
          <div className="text-2xl font-black text-emerald-700 font-mono flex items-center gap-2">
            <span>{checkedInCount}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">يتجولون ويعاينون المعروضات</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-bold block mb-1">زيارات تمت اليوم</span>
          <div className="text-2xl font-black text-slate-900 font-mono">{completedCount}</div>
          <span className="text-[10px] text-slate-400">تم تسجيل نتائجها والمتابعات</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-bold block mb-1">نسبة الحضور والتأكيد</span>
          <div className="text-2xl font-black text-rewaq-gold-dark font-mono">92%</div>
          <span className="text-[10px] text-slate-400">معدل التزام العملاء بالحضور</span>
        </div>
      </div>

      {/* 3. Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم الزائر، الهاتف، أو المنتج..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 pr-9 text-xs text-slate-800 focus:outline-none focus:border-rewaq-gold focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          
          {/* Branch Filter */}
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">كل الصالات</option>
            <option value="فرع التجمع الرئيسي">فرع التجمع الرئيسي</option>
            <option value="فرع 6 أكتوبر (المول)">فرع 6 أكتوبر</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">كل الحالات</option>
            {visitStatuses.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>

          {/* Rep Filter */}
          <select
            value={repFilter}
            onChange={(e) => setRepFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">كل مسؤولي المبيعات</option>
            <option value="كريم يوسف">كريم يوسف</option>
            <option value="سارة ممدوح">سارة ممدوح</option>
          </select>

        </div>
      </div>

      {/* 4. Visits Operational Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVisits.length === 0 ? (
          <div className="col-span-3 bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200/80">
            لا توجد مواعيد زيارات مطابقة للبحث
          </div>
        ) : (
          filteredVisits.map((visit) => {
            const statusObj = visitStatuses.find((s) => s.id === visit.status);
            return (
              <div
                key={visit.id}
                className={`bg-white rounded-2xl p-5 border transition flex flex-col justify-between shadow-2xs ${
                  visit.status === "CHECKED_IN" || visit.status === "INSPECTING"
                    ? "border-emerald-300 ring-2 ring-emerald-500/10"
                    : "border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <div>
                  {/* Top Bar: Time Slot & Status Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-rewaq-gold" />
                      <span>{visit.visitDate} - {visit.timeSlot}</span>
                    </div>

                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${statusObj?.badgeColor}`}>
                      {statusObj?.label || visit.status}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <h3 className="text-sm font-black text-slate-900 mb-1">{visit.customerName}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-mono">
                    <span>{visit.phone}</span>
                    <span>•</span>
                    <span className="text-slate-400 font-sans">{visit.branch}</span>
                  </div>

                  {/* Product of Interest */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs mb-3 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">الاهتمام:</span>
                      <strong className="text-slate-900 font-bold">{visit.roomInterest}</strong>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                      <span>المسؤول: <strong className="text-slate-700">{visit.salesRep}</strong></span>
                      {visit.checkInTime && (
                        <span className="text-emerald-700 font-mono font-bold">حضر: {visit.checkInTime}</span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">
                    {visit.notes}
                  </p>
                </div>

                {/* Operational Action Buttons (Lifecycle Step Triggers) */}
                <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                  
                  {/* Stage 1: SCHEDULED -> Confirm */}
                  {visit.status === "SCHEDULED" && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => updateVisitStatus(visit.id, "CONFIRMED")}
                        className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>تأكيد الموعد</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => checkInVisit(visit.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>حضر الآن 📍</span>
                      </button>
                    </div>
                  )}

                  {/* Stage 2: CONFIRMED -> Fast Check-in (Main Trigger) */}
                  {visit.status === "CONFIRMED" && (
                    <button
                      type="button"
                      onClick={() => checkInVisit(visit.id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>تأكيد حضور العميل بالمعرض (Check-in) 📍</span>
                    </button>
                  )}

                  {/* Stage 3: CHECKED_IN -> Start Inspection */}
                  {visit.status === "CHECKED_IN" && (
                    <button
                      type="button"
                      onClick={() => startInspection(visit.id)}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>بدء المعاينة بالصالة (Start Inspection) 👁️</span>
                    </button>
                  )}

                  {/* Stage 4: INSPECTING -> End Visit or Contract at POS */}
                  {visit.status === "INSPECTING" && (
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/dashboard/pos?customerName=${encodeURIComponent(visit.customerName)}&customerPhone=${encodeURIComponent(visit.phone)}&branch=${encodeURIComponent(visit.branch)}&rep=${encodeURIComponent(visit.salesRep)}&product=${encodeURIComponent(visit.roomInterest)}`}
                        className="w-full bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 text-xs font-black py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>بدء التعاقد بالـ POS</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setEndingVisit(visit);
                          setOutcomeForm((prev) => ({
                            ...prev,
                            followupRep: visit.salesRep,
                          }));
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>إنهاء الزيارة 🏁</span>
                      </button>
                    </div>
                  )}

                  {/* Stage 5: COMPLETED -> View Outcome or POS contract */}
                  {visit.status === "COMPLETED" && (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[11px] text-slate-500">
                        النتيجة: <strong className="text-emerald-700">{visit.outcome || "مكتملة"}</strong>
                      </span>
                      <Link
                        href={`/dashboard/pos?customerName=${encodeURIComponent(visit.customerName)}&customerPhone=${encodeURIComponent(visit.phone)}&branch=${encodeURIComponent(visit.branch)}&rep=${encodeURIComponent(visit.salesRep)}`}
                        className="text-rewaq-gold-dark hover:underline font-bold text-xs flex items-center gap-1"
                      >
                        <span>تعاقد POS</span>
                        <ChevronLeft className="w-3 h-3" />
                      </Link>
                    </div>
                  )}

                  {/* WhatsApp Quick Direct */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <a
                      href={`https://wa.me/2${visit.phone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:underline font-medium text-[11px] flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>واتساب مباشر للعميل</span>
                    </a>

                    <Link
                      href="/dashboard/crm"
                      className="text-slate-400 hover:text-slate-700 text-[11px]"
                    >
                      عرض في الـ CRM ←
                    </Link>
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* 5. Modal: End Visit & Simple Outcome Dialog with Follow-up */}
      {endingVisit && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-7 shadow-2xl border border-slate-200 text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">إنهاء زيارة الصالة وتسجيل النتيجة</h3>
                <p className="text-xs text-slate-400">العميل: {endingVisit.customerName} ({endingVisit.branch})</p>
              </div>
              <button
                onClick={() => setEndingVisit(null)}
                className="text-slate-400 hover:text-slate-800 p-1.5 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEndVisitSubmit} className="space-y-4 text-xs">
              
              {/* Outcome Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-2">نتيجة الزيارة بالمعرض:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: "VERY_INTERESTED", label: "مهتم جداً وقريب من التعاقد 🔥", badge: "bg-emerald-50 text-emerald-800 border-emerald-300" },
                    { id: "INTERESTED", label: "مهتم ويقارن بين الموديلات 🛋️", badge: "bg-blue-50 text-blue-800 border-blue-200" },
                    { id: "NEEDS_FOLLOWUP", label: "يحتاج متابعة واستشارة الأسرة 📞", badge: "bg-amber-50 text-amber-800 border-amber-200" },
                    { id: "NO_MATCH", label: "لم يجد المقاس/اللون المناسب ❌", badge: "bg-slate-100 text-slate-700 border-slate-200" },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                        outcomeForm.outcome === opt.id
                          ? "bg-slate-900 text-white border-slate-900 font-bold shadow-xs"
                          : "bg-slate-50 hover:bg-white border-slate-200 text-slate-800"
                      }`}
                    >
                      <input
                        type="radio"
                        name="outcome"
                        value={opt.id}
                        checked={outcomeForm.outcome === opt.id}
                        onChange={() => setOutcomeForm({ ...outcomeForm, outcome: opt.id as any })}
                        className="hidden"
                      />
                      <span className="text-xs">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Outcome Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات مسؤول المبيعات:</label>
                <textarea
                  rows={2}
                  value={outcomeForm.outcomeNotes}
                  onChange={(e) => setOutcomeForm({ ...outcomeForm, outcomeNotes: e.target.value })}
                  placeholder="مثال: اختار قماش الكشمير وعاين صالون لوتس، طلب إرسال صور واقعية للدهان..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-rewaq-gold focus:bg-white"
                />
              </div>

              {/* Smart Follow-up Suggestion Box */}
              <div className="bg-amber-500/10 border border-amber-300 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>اقتراح متابعة ذكية (Next Action):</span>
                  </span>
                  <label className="flex items-center gap-1.5 text-xs text-amber-900 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={outcomeForm.createFollowup}
                      onChange={(e) => setOutcomeForm({ ...outcomeForm, createFollowup: e.target.checked })}
                    />
                    <span>جدولة متابعة</span>
                  </label>
                </div>

                {outcomeForm.createFollowup && (
                  <div className="space-y-2 pt-1">
                    <div>
                      <input
                        type="text"
                        value={outcomeForm.followupTask}
                        onChange={(e) => setOutcomeForm({ ...outcomeForm, followupTask: e.target.value })}
                        className="w-full bg-white border border-amber-300 rounded-xl p-2 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-mono">
                      <input
                        type="text"
                        value={outcomeForm.followupDueDate}
                        onChange={(e) => setOutcomeForm({ ...outcomeForm, followupDueDate: e.target.value })}
                        className="w-full bg-white border border-amber-300 rounded-xl p-2 text-xs"
                      />
                      <input
                        type="text"
                        value={outcomeForm.followupRep}
                        onChange={(e) => setOutcomeForm({ ...outcomeForm, followupRep: e.target.value })}
                        className="w-full bg-white border border-amber-300 rounded-xl p-2 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEndingVisit(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white transition shadow-xs cursor-pointer"
                >
                  حفظ وإنهاء الزيارة بنجاح
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 6. Modal: Add New Showroom Visit */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">حجز موعد زيارة جديد بالمعرض</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateVisit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم العميل:</label>
                  <input
                    type="text"
                    required
                    value={newVisitForm.customerName}
                    onChange={(e) => setNewVisitForm({ ...newVisitForm, customerName: e.target.value })}
                    placeholder="مثال: أ. محمد الشريف"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف:</label>
                  <input
                    type="text"
                    required
                    value={newVisitForm.phone}
                    onChange={(e) => setNewVisitForm({ ...newVisitForm, phone: e.target.value })}
                    placeholder="010XXXXXXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">صالة العرض / الفرع:</label>
                  <select
                    value={newVisitForm.branch}
                    onChange={(e) => setNewVisitForm({ ...newVisitForm, branch: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="فرع التجمع الرئيسي">فرع التجمع الرئيسي</option>
                    <option value="فرع 6 أكتوبر (المول)">فرع 6 أكتوبر (المول)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">مسؤول المبيعات:</label>
                  <select
                    value={newVisitForm.salesRep}
                    onChange={(e) => setNewVisitForm({ ...newVisitForm, salesRep: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="كريم يوسف">كريم يوسف</option>
                    <option value="سارة ممدوح">سارة ممدوح</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ الزيارة:</label>
                  <input
                    type="text"
                    value={newVisitForm.visitDate}
                    onChange={(e) => setNewVisitForm({ ...newVisitForm, visitDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الموعد بالساعة:</label>
                  <input
                    type="text"
                    value={newVisitForm.timeSlot}
                    onChange={(e) => setNewVisitForm({ ...newVisitForm, timeSlot: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المنتج المهتم به:</label>
                <input
                  type="text"
                  value={newVisitForm.roomInterest}
                  onChange={(e) => setNewVisitForm({ ...newVisitForm, roomInterest: e.target.value })}
                  placeholder="مثال: صالون مودرن / غرفة طعام"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات الحجز:</label>
                <textarea
                  rows={2}
                  value={newVisitForm.notes}
                  onChange={(e) => setNewVisitForm({ ...newVisitForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 transition shadow-xs"
                >
                  حفظ وتأكيد الموعد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
