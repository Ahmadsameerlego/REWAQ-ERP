"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users2,
  Phone,
  MessageCircle,
  Plus,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  Zap,
  Target,
  Clock,
  CheckCircle2,
  X,
  FileSpreadsheet,
  Building2,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Store,
  Eye,
  Send,
  CalendarCheck,
  Check,
  ListTodo,
  Truck,
  Layers,
  MapPin,
  HelpCircle,
  UserCheck,
  ShieldCheck,
  Edit3,
  CalendarPlus,
  AlertTriangle,
  RotateCcw,
  CheckSquare
} from "lucide-react";
import { useShowroom, CustomerRecord, JourneyStage, NextAction, TimelineEvent } from "@/context/ShowroomContext";

// Detailed Journey Stage Metadata with specific action to advance
interface StageMeta {
  id: JourneyStage;
  label: string;
  shortLabel: string;
  stepNum: number;
  badgeColor: string;
  description: string;
  actionTitle: string;
  actionDesc: string;
  nextStage?: JourneyStage;
  nextStageLabel?: string;
  posBridge?: boolean;
  visitBridge?: boolean;
}

const JOURNEY_STAGES_META: Record<JourneyStage, StageMeta> = {
  LEAD: {
    id: "LEAD",
    label: "1. ليد جديد",
    shortLabel: "ليد جديد",
    stepNum: 1,
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    description: "عميل سجل اهتمامه عبر إعلانات السوشيال ميديا أو الواتساب، بانتظار الاتصال الأول.",
    actionTitle: "إجراء مكالمة الترحيب والتأهيل الأولى",
    actionDesc: "التواصل هاتفياً والتعرف على نوع الغرفة وميزانية العميل وتفضيلاته.",
    nextStage: "CONTACTED",
    nextStageLabel: "تم التواصل والتأهيل",
  },
  CONTACTED: {
    id: "CONTACTED",
    label: "2. تواصل وتأهيل",
    shortLabel: "تواصل وتأهيل",
    stepNum: 2,
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    description: "تم التواصل مع العميل والتعرف على متطلباته، والمطلوب دعوته وتنسيق موعد زيارة المعرض.",
    actionTitle: "حجز وتأكيد موعد زيارة صالة العرض",
    actionDesc: "تحديد الفرع والموعد المناسب للعميل لمعاينة الأثاث والأقمشة على الطبيعة.",
    nextStage: "VISIT_BOOKED",
    nextStageLabel: "حجز موعد بالمعرض",
    visitBridge: true,
  },
  VISIT_BOOKED: {
    id: "VISIT_BOOKED",
    label: "3. حجز موعد زيارة",
    shortLabel: "حجز زيارة",
    stepNum: 3,
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    description: "العميل لديه موعد محدد ومؤكد لزيارة الصالة، بانتظار وصوله واستقباله.",
    actionTitle: "تسجيل حضور العميل بالمعرض (Fast Check-in) 📍",
    actionDesc: "تأكيد وصول العميل للصالة واستقباله وتعيين مسؤول المبيعات لمرافقته.",
    nextStage: "CHECKED_IN",
    nextStageLabel: "حضر بالمعرض",
  },
  CHECKED_IN: {
    id: "CHECKED_IN",
    label: "4. حضر بالمعرض 📍",
    shortLabel: "حضر بالمعرض",
    stepNum: 4,
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    description: "العميل متواجد حالياً داخل صالة العرض مع مسؤول المبيعات.",
    actionTitle: "بدء الجولة والمعاينة بالصالة (Start Inspection) 👁️",
    actionDesc: "مرافقة العميل ومعاينة موديلات الصالونات والأخشاب واختبار درجات الراحة والأقمشة.",
    nextStage: "INSPECTING",
    nextStageLabel: "جاري المعاينة",
  },
  INSPECTING: {
    id: "INSPECTING",
    label: "5. جاري المعاينة 👁️",
    shortLabel: "جاري المعاينة",
    stepNum: 5,
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    description: "العميل يفحص الموديلات ويختار ألوان الأقمشة والمقاسات المناسبة لشقته.",
    actionTitle: "إعداد وإرسال عرض أسعار رسمي (Quotation) 📄",
    actionDesc: "حساب السعر بعد الخصومات المتاحة وتجهيز مقايسة الأسعار الرسمية للعميل.",
    nextStage: "QUOTATION",
    nextStageLabel: "عرض أسعار",
  },
  QUOTATION: {
    id: "QUOTATION",
    label: "6. عرض أسعار مرسل",
    shortLabel: "عرض أسعار",
    stepNum: 6,
    badgeColor: "bg-yellow-50 text-yellow-800 border-yellow-200",
    description: "تم تقديم عرض السعر للعميل، بانتظار دفع العربون وتوقيع العقد الرسمي.",
    actionTitle: "تحويل إلى تعاقد رسمي بالـ POS وسداد العربون 📝",
    actionDesc: "فتح معالج التعاقدات بنقاط البيع وإصدار الفاتورة وقبض العربون بالخزينة.",
    nextStage: "CONTRACTED",
    nextStageLabel: "تعاقد رسمي بالـ POS",
    posBridge: true,
  },
  CONTRACTED: {
    id: "CONTRACTED",
    label: "7. تعاقد رسمي مسجل ✅",
    shortLabel: "تعاقد رسمي",
    stepNum: 7,
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold",
    description: "تم توقيع العقد وسداد العربون، وأمر الإنتاج/التجهيز قيد التحضير في المصنع.",
    actionTitle: "إصدار إذن الشحن والتجهيز للتوصيل 🚚",
    actionDesc: "تجهيز القطع بالمستودع والتنسيق مع شركة الشحن وفريق التركيب.",
    nextStage: "SHIPPED",
    nextStageLabel: "جاري الشحن",
  },
  SHIPPED: {
    id: "SHIPPED",
    label: "8. جاري الشحن والتوصيل 🚚",
    shortLabel: "جاري الشحن",
    stepNum: 8,
    badgeColor: "bg-cyan-50 text-cyan-800 border-cyan-200",
    description: "الشحنة في طريقها لعنوان العميل مع النجار وفني التركيب المعتمد.",
    actionTitle: "تأكيد الاستلام والتركيب وتحصيل باقي الحساب (COD) ✅",
    actionDesc: "استلام العميل للأثاث وتركيبه بنجاح وسداد المبلغ المتبقي عند الباب.",
    nextStage: "DELIVERED",
    nextStageLabel: "تم التسليم بنجاح",
  },
  DELIVERED: {
    id: "DELIVERED",
    label: "9. تم التسليم والتركيب 🌟",
    shortLabel: "تم التسليم",
    stepNum: 9,
    badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold",
    description: "تم تسليم المنتج بالكامل وخالص الحساب 100% والعميل سعيد بالخدمة.",
    actionTitle: "إجراء استبيان رضا العميل وتفعيل شهادة الضمان 🌟",
    actionDesc: "التواصل بعد 3 أيام للاطمئنان على جودة الأثاث وتسجيل تقييم 5 نجوم.",
    nextStage: undefined,
    nextStageLabel: undefined,
  },
  DEPOSIT_PAID: {
    id: "DEPOSIT_PAID",
    label: "7. تعاقد وسداد عربون",
    shortLabel: "عربون مسدد",
    stepNum: 7,
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-300",
    description: "تم دفع العربون بالخزينة وجاري التجهيز.",
    actionTitle: "إصدار إذن الشحن والتجهيز",
    actionDesc: "تجهيز الشحنة وجدولتها.",
    nextStage: "SHIPPED",
    nextStageLabel: "جاري الشحن",
  },
  FOLLOW_UP: {
    id: "FOLLOW_UP",
    label: "9. متابعة ما بعد البيع",
    shortLabel: "ما بعد البيع",
    stepNum: 9,
    badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
    description: "متابعة ما بعد البيع والضمان.",
    actionTitle: "متابعة دورية",
    actionDesc: "التواصل مع العميل.",
  },
};

export default function CRMPage() {
  const {
    customers,
    addCustomer,
    updateCustomer,
    updateCustomerJourney,
    addTimelineEvent,
    setCustomerNextAction,
    completeNextAction,
    orders,
    visits,
    products,
  } = useShowroom();

  // Navigation Tabs: 'customers' | 'followups' | 'dashboard'
  const [activeTab, setActiveTab] = useState<"customers" | "followups" | "dashboard">("customers");
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [selectedStage, setSelectedStage] = useState<string>("ALL");
  const [selectedRep, setSelectedRep] = useState("ALL");

  // Customer 360 Modal
  const [activeCustomer360, setActiveCustomer360] = useState<CustomerRecord | null>(null);
  
  // Quick Action Modals inside Customer 360
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [showScheduleNextAction, setShowScheduleNextAction] = useState(false);
  const [nextActionForm, setNextActionForm] = useState({
    task: "",
    rep: "كريم يوسف",
    dueDate: "غداً 12:00 م",
    priority: "urgent" as "urgent" | "normal",
    channel: "call" as "call" | "whatsapp" | "meeting" | "showroom",
  });

  // New Customer Modal State
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    fullName: "",
    phone: "",
    whatsapp: "",
    city: "القاهرة الجديدة",
    source: "Meta Lead Ads",
    preferredBranch: "فرع التجمع الرئيسي",
    assignedRep: "كريم يوسف",
    productName: "صالون نورديك 9 مقاعد",
    budget: "60,000 - 80,000 ج",
    notes: "عميل جديد مهتم بالخشب الزان وتفصيل لون كشمير",
  });

  const [isSimulating, setIsSimulating] = useState(false);

  // Ordered Stages for Pipeline Flow
  const pipelineStagesList: JourneyStage[] = [
    "LEAD",
    "CONTACTED",
    "VISIT_BOOKED",
    "CHECKED_IN",
    "INSPECTING",
    "QUOTATION",
    "CONTRACTED",
    "SHIPPED",
    "DELIVERED",
  ];

  // Filtered Customers based on search and filters
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.fullName.includes(searchQuery) ||
      c.phone.includes(searchQuery) ||
      c.notes.includes(searchQuery) ||
      (c.city && c.city.includes(searchQuery));
    const matchesBranch = selectedBranch === "ALL" || c.preferredBranch === selectedBranch;
    const matchesStage = selectedStage === "ALL" || c.stage === selectedStage;
    const matchesRep = selectedRep === "ALL" || c.assignedRep === selectedRep;

    return matchesSearch && matchesBranch && matchesStage && matchesRep;
  });

  // Direct Advance to Next Stage with Timeline recording
  const handleAdvanceStage = (customerId: string, targetStage: JourneyStage, actionTitle: string) => {
    updateCustomerJourney(
      customerId,
      targetStage,
      `الانتقال للمرحلة: ${JOURNEY_STAGES_META[targetStage]?.shortLabel || targetStage}`,
      `تم تنفيذ الإجراء: "${actionTitle}" بنجاح وتم نقل العميل للمرحلة التالية.`
    );

    if (activeCustomer360 && activeCustomer360.id === customerId) {
      const updated = customers.find((c) => c.id === customerId);
      if (updated) {
        setActiveCustomer360({ ...updated, stage: targetStage });
      }
    }
  };

  // Instant Meta Webhook Simulator
  const simulateMetaLead = () => {
    setIsSimulating(true);
    const sampleNames = ["أ. حسام المنياوي", "د. ريهام الشاذلي", "م. باسل عبد الغفار", "أ. نيرة الشريف"];
    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const randomPhone = `010${Math.floor(10000000 + Math.random() * 90000000)}`;

    setTimeout(() => {
      addCustomer({
        fullName: randomName,
        phone: randomPhone,
        whatsapp: randomPhone,
        city: "التجمع الخامس",
        source: "Meta Lead Ads",
        campaignName: "حملة الصالونات المودرن والسمارت",
        preferredBranch: "فرع التجمع الرئيسي",
        assignedRep: "كريم يوسف",
        notes: "ليد فوري تم التقاطه من إعلان فيسبوك الترويجي لحظياً (Live Webhook)",
        stage: "LEAD",
        interestedProducts: [
          { name: "صالون مودرن سمارت", budget: "75,000 - 95,000 ج" },
        ],
        nextAction: {
          task: "إجراء مكالمة الترحيب الأولى وتأكيد الاهتمام بالصالون",
          rep: "كريم يوسف",
          dueDate: "اليوم 02:00 م",
          priority: "urgent",
          completed: false,
          channel: "call",
        },
      });
      setIsSimulating(false);
    }, 800);
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomer({
      fullName: newCustomerForm.fullName,
      phone: newCustomerForm.phone,
      whatsapp: newCustomerForm.whatsapp || newCustomerForm.phone,
      city: newCustomerForm.city,
      source: newCustomerForm.source,
      preferredBranch: newCustomerForm.preferredBranch,
      assignedRep: newCustomerForm.assignedRep,
      notes: newCustomerForm.notes,
      stage: "LEAD",
      interestedProducts: [
        { name: newCustomerForm.productName, budget: newCustomerForm.budget },
      ],
      nextAction: {
        task: "متابعة متطلبات العميل وتنسيق موعد زيارة المعرض",
        rep: newCustomerForm.assignedRep,
        dueDate: "اليوم",
        priority: "normal",
        completed: false,
        channel: "call",
      },
    });
    setShowNewCustomerModal(false);
    setNewCustomerForm({
      fullName: "",
      phone: "",
      whatsapp: "",
      city: "القاهرة الجديدة",
      source: "Meta Lead Ads",
      preferredBranch: "فرع التجمع الرئيسي",
      assignedRep: "كريم يوسف",
      productName: "صالون نورديك 9 مقاعد",
      budget: "60,000 - 80,000 ج",
      notes: "تم تسجيل العميل يدوياً بالـ CRM",
    });
  };

  // Add timeline note inside Customer 360
  const handleAddTimelineNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer360 || !newNoteText.trim()) return;
    addTimelineEvent(activeCustomer360.id, {
      type: "note",
      title: "ملاحظة متابعة جديدة",
      description: newNoteText,
      timestamp: "الآن",
      author: "مسؤول المبيعات",
      badge: "ملاحظة",
      badgeColor: "bg-slate-100 text-slate-800",
    });
    setNewNoteText("");
    setShowAddNoteModal(false);
    const updated = customers.find((c) => c.id === activeCustomer360.id);
    if (updated) setActiveCustomer360(updated);
  };

  // Schedule Next Action inside Customer 360
  const handleSaveNextAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer360 || !nextActionForm.task.trim()) return;
    setCustomerNextAction(activeCustomer360.id, {
      task: nextActionForm.task,
      rep: nextActionForm.rep,
      dueDate: nextActionForm.dueDate,
      priority: nextActionForm.priority,
      channel: nextActionForm.channel,
      completed: false,
    });
    setShowScheduleNextAction(false);
    const updated = customers.find((c) => c.id === activeCustomer360.id);
    if (updated) setActiveCustomer360(updated);
  };

  // KPIs Calculations
  const totalCustomers = customers.length;
  const activeVisitsCount = visits.filter((v) => v.status === "CHECKED_IN" || v.status === "INSPECTING").length;
  const contractedCustomersCount = customers.filter((c) => ["CONTRACTED", "SHIPPED", "DELIVERED"].includes(c.stage)).length;
  const pendingFollowups = customers.filter((c) => c.nextAction && !c.nextAction.completed);
  const urgentFollowups = pendingFollowups.filter((c) => c.nextAction?.priority === "urgent");

  // Helper to get active customer stage meta
  const currentCustomerMeta = activeCustomer360
    ? JOURNEY_STAGES_META[activeCustomer360.stage] || JOURNEY_STAGES_META.LEAD
    : JOURNEY_STAGES_META.LEAD;

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Header Bar with Action Buttons (Cleaned up, no unnecessary roles dropdown) */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1">
              <span>الرئيسية</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <span className="text-xs text-slate-400">/</span>
            <span className="text-xs font-bold text-slate-700">إدارة العملاء و CRM</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            منظومة إدارة العملاء الموحدة (Customer 360 & Pipeline)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            سجل عميل واحد مترابط يوضح مرحلة كل عميل، الإجراء المطلوب للنقل للحالة التالية، وحالة إنجاز المهام بدقة.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Simulate Meta Webhook Button */}
          <button
            type="button"
            onClick={simulateMetaLead}
            disabled={isSimulating}
            className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold px-3.5 py-2.5 rounded-xl transition cursor-pointer"
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin text-blue-600" : ""}`} />
            <span>{isSimulating ? "جاري الالتقاط..." : "محاكاة ليد Meta لحظي"}</span>
          </button>

          {/* Add New Customer Button */}
          <button
            type="button"
            onClick={() => setShowNewCustomerModal(true)}
            className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ تسجيل عميل جديد</span>
          </button>
        </div>
      </div>

      {/* 2. Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("customers")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "customers"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users2 className="w-4 h-4 text-rewaq-gold" />
          <span>دليل ومسار رحلة العملاء ({filteredCustomers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("followups")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "followups"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ListTodo className="w-4 h-4 text-rewaq-gold" />
          <span>طابور المتابعات والمهام (Next Actions)</span>
          {pendingFollowups.length > 0 ? (
            <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black font-mono">
              {pendingFollowups.length} معلقة
            </span>
          ) : (
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
              مكتملة بالكامل ✓
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "dashboard"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <TrendingUp className="w-4 h-4 text-rewaq-gold" />
          <span>لوحة مؤشرات التحويل والمبيعات</span>
        </button>
      </div>

      {/* TAB 1: CUSTOMER DIRECTORY & STAGE PIPELINE */}
      {activeTab === "customers" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          
          {/* Search Row */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-96">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم العميل، الهاتف، أو المدينة..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pr-9 text-xs text-slate-800 focus:outline-none focus:border-rewaq-gold focus:bg-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Branch Filter */}
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">كل الفروع والصالات</option>
                <option value="فرع التجمع الرئيسي">فرع التجمع الرئيسي</option>
                <option value="فرع 6 أكتوبر (المول)">فرع 6 أكتوبر</option>
              </select>

              {/* Stage Filter */}
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">كل مراحل الرحلة</option>
                {pipelineStagesList.map((s) => (
                  <option key={s} value={s}>{JOURNEY_STAGES_META[s]?.label || s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Customers Directory Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <th className="py-3.5 px-4">العميل والتفاصيل</th>
                    <th className="py-3.5 px-3">الفرع والمسؤول</th>
                    <th className="py-3.5 px-3">المرحلة الحالية بالرحلة</th>
                    <th className="py-3.5 px-3">المهمة التالية وحالة الإنجاز</th>
                    <th className="py-3.5 px-3">الأكشن المطلوب للترقية</th>
                    <th className="py-3.5 px-3 text-center">فتح الملف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        لا يوجد عملاء مطابقين لمعايير البحث الحالية
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((cust) => {
                      const stageMeta = JOURNEY_STAGES_META[cust.stage] || JOURNEY_STAGES_META.LEAD;
                      const hasNextStage = !!stageMeta.nextStage;
                      const nextStageMeta = stageMeta.nextStage ? JOURNEY_STAGES_META[stageMeta.nextStage] : null;

                      return (
                        <tr key={cust.id} className="hover:bg-slate-50/80 transition">
                          {/* Customer Name & Phone */}
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => setActiveCustomer360(cust)}
                              className="font-bold text-slate-900 hover:text-rewaq-gold text-right cursor-pointer block text-xs"
                            >
                              {cust.fullName}
                            </button>
                            <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                              {cust.phone} • {cust.city}
                            </span>
                          </td>

                          {/* Branch & Rep */}
                          <td className="py-3.5 px-3">
                            <p className="font-bold text-slate-800">{cust.preferredBranch}</p>
                            <p className="text-[11px] text-slate-500">المسؤول: {cust.assignedRep}</p>
                          </td>

                          {/* Journey Stage Badge */}
                          <td className="py-3.5 px-3">
                            <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border font-bold ${stageMeta.badgeColor}`}>
                              <span>{stageMeta.label}</span>
                            </span>
                          </td>

                          {/* Next Action & Completion Status */}
                          <td className="py-3.5 px-3 max-w-[220px]">
                            {cust.nextAction ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  {cust.nextAction.completed ? (
                                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-md font-bold text-[10px]">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                      <span>تم الإنجاز ✓</span>
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => completeNextAction(cust.id)}
                                      className="inline-flex items-center gap-1 bg-amber-50 hover:bg-emerald-50 text-amber-900 hover:text-emerald-800 border border-amber-300 hover:border-emerald-300 px-2 py-0.5 rounded-md font-bold text-[10px] transition cursor-pointer"
                                      title="انقر لتأكيد إنجاز المهمة"
                                    >
                                      <Clock className="w-3 h-3 text-amber-600" />
                                      <span>قيد التنفيذ (انقر لإنجازها)</span>
                                    </button>
                                  )}
                                </div>
                                <p className={`text-[11px] truncate ${cust.nextAction.completed ? "line-through text-slate-400" : "font-bold text-slate-800"}`} title={cust.nextAction.task}>
                                  {cust.nextAction.task}
                                </p>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400">لا توجد مهمة مجدولة</span>
                            )}
                          </td>

                          {/* Clear Action to Advance Stage */}
                          <td className="py-3.5 px-3">
                            {hasNextStage && nextStageMeta ? (
                              <button
                                type="button"
                                onClick={() => handleAdvanceStage(cust.id, stageMeta.nextStage!, stageMeta.actionTitle)}
                                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-rewaq-gold hover:text-slate-950 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition cursor-pointer shadow-2xs"
                                title={`${stageMeta.actionTitle} ➔ الانتقال إلى: ${nextStageMeta.label}`}
                              >
                                <span>{stageMeta.actionTitle}</span>
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            ) : (
                              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                                نهاية مسار الرحلة ✅
                              </span>
                            )}
                          </td>

                          {/* Quick Open 360 */}
                          <td className="py-3.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => setActiveCustomer360(cust)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition cursor-pointer"
                            >
                              عرض 360°
                            </button>
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
      )}

      {/* TAB 2: ACTIONABLE FOLLOW-UPS & NEXT ACTIONS QUEUE */}
      {activeTab === "followups" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900">طابور المتابعات والمهام اليومية (Daily Action Queue)</h2>
              <p className="text-xs text-slate-400">متابعة دقيقة لحالة إنجاز كل مهمة موصى بها لمنع تسرب العملاء</p>
            </div>
            <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-xl">
              {pendingFollowups.length} مهمة معلقة
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingFollowups.length === 0 ? (
              <div className="col-span-3 bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200/80">
                🎉 رائع! تم إنجاز جميع المتابعات والمهام المجدولة بالكامل.
              </div>
            ) : (
              pendingFollowups.map((cust) => (
                <div
                  key={cust.id}
                  className={`bg-white rounded-2xl p-4 border transition flex flex-col justify-between shadow-2xs ${
                    cust.nextAction?.priority === "urgent"
                      ? "border-rose-300 ring-2 ring-rose-500/10"
                      : "border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        cust.nextAction?.priority === "urgent" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}>
                        {cust.nextAction?.priority === "urgent" ? "عاجل اليوم ⚠️" : "عادي"}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{cust.nextAction?.dueDate}</span>
                    </div>

                    <h4 className="text-xs font-black text-slate-900 mb-1">{cust.nextAction?.task}</h4>
                    <p className="text-xs text-slate-600 font-bold mb-0.5">العميل: {cust.fullName}</p>
                    <p className="text-[11px] text-slate-400 font-mono mb-3">{cust.phone} • {cust.preferredBranch}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => completeNextAction(cust.id)}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>تأكيد الإنجاز الآن ✓</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <a
                        href={`https://wa.me/2${cust.phone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`tel:${cust.phone}`}
                        className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: EXECUTIVE CRM DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Top High-level KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-500 font-bold block mb-1">إجمالي قاعدة العملاء</span>
              <div className="text-2xl font-black text-slate-900 font-mono">{totalCustomers} عميل</div>
              <span className="text-[10px] text-slate-400">مسجلين برقم هاتف فريد</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-500 font-bold block mb-1">حاضرون بالمعارض الآن 📍</span>
              <div className="text-2xl font-black text-emerald-700 font-mono flex items-center gap-2">
                <span>{activeVisitsCount}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">جاري مرافقتهم من المبيعات</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-500 font-bold block mb-1">عقود مغلقة بالـ POS</span>
              <div className="text-2xl font-black text-rewaq-gold-dark font-mono">
                {contractedCustomersCount} تعاقد ✅
              </div>
              <span className="text-[10px] text-slate-400">سددوا العربون أو خالص</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-500 font-bold block mb-1">متابعات مستحقة وعاجلة</span>
              <div className="text-2xl font-black text-rose-700 font-mono">
                {urgentFollowups.length} متابعة ⚠️
              </div>
              <span className="text-[10px] text-rose-600 font-bold">تتطلب اتصال أو رسالة فورية</span>
            </div>
          </div>

          {/* Showroom Conversion Performance & Funnel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* Conversion Stages Breakdown */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">مسار التحويل ورحلة العميل (Conversion Funnel)</h3>
                  <p className="text-xs text-slate-400">توزيع العملاء عبر الـ 9 مراحل الأساسية</p>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                  معدل الإغلاق الكلي: {Math.round((contractedCustomersCount / (totalCustomers || 1)) * 100)}%
                </span>
              </div>

              <div className="space-y-2.5">
                {pipelineStagesList.map((stageId) => {
                  const stageMeta = JOURNEY_STAGES_META[stageId];
                  const countInStage = customers.filter((c) => c.stage === stageId).length;
                  const percent = Math.round((countInStage / (totalCustomers || 1)) * 100);
                  return (
                    <div key={stageId} className="flex items-center gap-3 text-xs">
                      <span className="w-32 font-bold text-slate-700 truncate">{stageMeta.label}</span>
                      <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-rewaq-gold to-slate-900 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, percent * 2)}%` }}
                        ></div>
                      </div>
                      <span className="font-mono font-bold text-slate-900 w-12 text-left">{countInStage} عميل</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Showroom Branches Conversion */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900">أداء فروع وصالات العرض</h3>
                <p className="text-xs text-slate-400">تحويل الزيارات إلى تعاقدات</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <strong className="text-slate-900">فرع التجمع الرئيسي</strong>
                    <span className="text-emerald-700 font-bold font-mono">38% تحويل</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between">
                    <span>14 زيارة هذا الأسبوع</span>
                    <span>5 تعاقدات مغلقة</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <strong className="text-slate-900">فرع 6 أكتوبر (المول)</strong>
                    <span className="text-emerald-700 font-bold font-mono">29% تحويل</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between">
                    <span>8 زيارات هذا الأسبوع</span>
                    <span>2 تعاقدات مغلقة</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <strong className="text-slate-900">مبيعات أونلاين وتلي سيلز</strong>
                    <span className="text-emerald-700 font-bold font-mono">19% تحويل</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between">
                    <span>22 ليد مستلم</span>
                    <span>4 عروض أسعار</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 4. COMPREHENSIVE CUSTOMER 360° MODAL */}
      {activeCustomer360 && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 text-slate-900 my-auto animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Top Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rewaq-gold to-rewaq-gold-dark text-slate-950 flex items-center justify-center font-black text-base shadow-sm">
                  {activeCustomer360.fullName.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">{activeCustomer360.fullName}</h3>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                      {activeCustomer360.source}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {activeCustomer360.phone} • {activeCustomer360.city} • الفرع: {activeCustomer360.preferredBranch} • المسؤول: {activeCustomer360.assignedRep}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/pos?customerName=${encodeURIComponent(activeCustomer360.fullName)}&customerPhone=${encodeURIComponent(activeCustomer360.phone)}&branch=${encodeURIComponent(activeCustomer360.preferredBranch)}&rep=${encodeURIComponent(activeCustomer360.assignedRep)}`}
                  className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition shadow-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>بدء تعاقد POS</span>
                </Link>

                <button
                  onClick={() => setActiveCustomer360(null)}
                  className="text-slate-400 hover:text-slate-800 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* SECTION 1: INTERACTIVE 9-STAGE CUSTOMER JOURNEY STEPPER */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-slate-900 block">مسار تقدم رحلة العميل (Customer Journey)</span>
                  <span className="text-[11px] text-slate-500">انقر على أي مرحلة للتنقل السريع، أو استخدم زر الإجراء أدناه للانتقال المنطقي المنظم:</span>
                </div>
                <span className={`text-xs px-3 py-1 rounded-xl font-bold border ${currentCustomerMeta.badgeColor}`}>
                  المرحلة الحالية: {currentCustomerMeta.label}
                </span>
              </div>

              {/* Step Navigation Bar */}
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5 text-center">
                {pipelineStagesList.map((stgId, idx) => {
                  const meta = JOURNEY_STAGES_META[stgId];
                  const currentIdx = pipelineStagesList.indexOf(activeCustomer360.stage as any);
                  const isPassed = idx < currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <button
                      key={stgId}
                      type="button"
                      onClick={() => {
                        updateCustomerJourney(activeCustomer360.id, stgId);
                        setActiveCustomer360({ ...activeCustomer360, stage: stgId });
                      }}
                      className={`p-2 rounded-xl text-[10px] font-bold border transition cursor-pointer flex flex-col items-center gap-1 ${
                        isCurrent
                          ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-rewaq-gold"
                          : isPassed
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                          : "bg-white text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-700"
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center font-mono text-[9px] ${
                        isCurrent ? "bg-rewaq-gold text-slate-950 font-black" : isPassed ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                      }`}>
                        {isPassed ? "✓" : meta.stepNum}
                      </span>
                      <span className="truncate w-full">{meta.shortLabel}</span>
                    </button>
                  );
                })}
              </div>

              {/* ACTION CARD TO ADVANCE TO NEXT STAGE */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                      الإجراء الموصى به لترقية العميل للحالة التالية:
                    </span>
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-2">
                      <Target className="w-4 h-4 text-rewaq-gold-dark" />
                      <span>{currentCustomerMeta.actionTitle}</span>
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {currentCustomerMeta.actionDesc}
                    </p>
                  </div>

                  {/* Big Action Button */}
                  <div className="shrink-0 flex items-center gap-2">
                    {currentCustomerMeta.nextStage ? (
                      <button
                        type="button"
                        onClick={() => handleAdvanceStage(activeCustomer360.id, currentCustomerMeta.nextStage!, currentCustomerMeta.actionTitle)}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-rewaq-gold to-rewaq-gold-dark hover:from-rewaq-gold-light hover:to-rewaq-gold text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                      >
                        <span>تنفيذ الأكشن والانتقال إلى ({currentCustomerMeta.nextStageLabel})</span>
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>اكتملت جميع مراحل الرحلة بنجاح</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: NEXT RECOMMENDED ACTION & VISIBLE STATUS */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-900 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">المهمة التالية الموصى بها (Next Action Status)</h4>
                    <p className="text-[11px] text-slate-400">متابعة دقيقة لحالة تنفيذ المهمة المحددة للعميل</p>
                  </div>
                </div>

                {/* State Badge: Completed vs Pending */}
                {activeCustomer360.nextAction ? (
                  activeCustomer360.nextAction.completed ? (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-xl text-xs font-black shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>تم الإنجاز بنجاح ✅</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-xl text-xs font-black shadow-2xs animate-pulse">
                      <Clock className="w-4 h-4 text-amber-700" />
                      <span>قيد التنفيذ (لم تُنجز بعد ⏳)</span>
                    </span>
                  )
                ) : (
                  <span className="text-xs text-slate-400 bg-slate-200 px-3 py-1 rounded-xl">لا توجد مهمة مجدولة</span>
                )}
              </div>

              {/* Task Details Banner */}
              {activeCustomer360.nextAction ? (
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black ${activeCustomer360.nextAction.completed ? "line-through text-slate-400" : "text-slate-900"}`}>
                        {activeCustomer360.nextAction.task}
                      </span>
                      {activeCustomer360.nextAction.priority === "urgent" && !activeCustomer360.nextAction.completed && (
                        <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] px-2 py-0.5 rounded-md font-bold">
                          عاجل اليوم ⚠️
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                      <span>الموعد المحدد: <strong>{activeCustomer360.nextAction.dueDate}</strong></span>
                      <span>•</span>
                      <span className="font-sans">المسؤول: <strong>{activeCustomer360.nextAction.rep}</strong></span>
                    </div>
                  </div>

                  {/* Actions for the task */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!activeCustomer360.nextAction.completed ? (
                      <button
                        type="button"
                        onClick={() => {
                          completeNextAction(activeCustomer360.id);
                          const updated = customers.find((c) => c.id === activeCustomer360.id);
                          if (updated) setActiveCustomer360(updated);
                        }}
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow-xs"
                      >
                        <Check className="w-4 h-4" />
                        <span>تأكيد الإنجاز الآن ✓</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        جاهز للمهمة التالية 👍
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowScheduleNextAction(true)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
                    >
                      {activeCustomer360.nextAction.completed ? "+ جدولة مهمة تالية" : "تعديل / إعادة جدولة"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                  <p className="text-xs text-slate-500">لا توجد مهمة تالية مجدولة لهذا العميل حالياً.</p>
                  <button
                    type="button"
                    onClick={() => setShowScheduleNextAction(true)}
                    className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ إضافة وجدولة مهمة تالية موصى بها</span>
                  </button>
                </div>
              )}
            </div>

            {/* SECTION 3: 360 GRID: ACTIVITY TIMELINE & DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Timeline & Notes */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-rewaq-gold" />
                    <span>سجل النشاط والتفاعل الموحد (Unified Timeline)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddNoteModal(true)}
                    className="text-xs text-rewaq-gold-dark hover:underline font-bold"
                  >
                    + إضافة ملاحظة
                  </button>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {activeCustomer360.timeline?.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">لا توجد سجلات سابقة</p>
                  ) : (
                    activeCustomer360.timeline?.map((ev, idx) => (
                      <div
                        key={ev.id ? `${ev.id}-${idx}` : `ev-${idx}`} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-900 font-bold">{ev.title}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">{ev.timestamp}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{ev.description}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                          <span>بواسطة: {ev.author}</span>
                          {ev.badge && (
                            <span className={`px-2 py-0.5 rounded-md font-bold ${ev.badgeColor || "bg-slate-100 text-slate-700"}`}>
                              {ev.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Interested Products & Financial Quotes/Orders */}
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-rewaq-gold" />
                    <span>المنتجات المهتم بها وعروض الأسعار</span>
                  </h4>
                </div>

                {/* Interested Products */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500">القطع المختارة:</span>
                  {activeCustomer360.interestedProducts?.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-slate-900 block">{item.name}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">الميزانية: {item.budget || "غير محددة"}</span>
                      </div>
                      <Link
                        href={`/dashboard/pos?customerName=${encodeURIComponent(activeCustomer360.fullName)}&customerPhone=${encodeURIComponent(activeCustomer360.phone)}&branch=${encodeURIComponent(activeCustomer360.preferredBranch)}&rep=${encodeURIComponent(activeCustomer360.assignedRep)}&product=${encodeURIComponent(item.name)}`}
                        className="bg-slate-900 text-white hover:bg-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        إصدار تعاقد
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Customer CRM Notes */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
                  <span className="text-slate-400 block mb-1 font-bold">ملاحظات خدمة العملاء:</span>
                  <p className="text-slate-700 leading-relaxed">{activeCustomer360.notes}</p>
                </div>

                {/* Communication Quick Shortcuts */}
                <div className="flex items-center gap-2 pt-2">
                  <a
                    href={`https://wa.me/2${activeCustomer360.phone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-xl text-center flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>فتح محادثة واتساب</span>
                  </a>
                  <a
                    href={`tel:${activeCustomer360.phone}`}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Phone className="w-4 h-4" />
                    <span>اتصال</span>
                  </a>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 5. ADD TIMELINE NOTE MODAL */}
      {showAddNoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">إضافة ملاحظة على سجل العميل</h3>
            <form onSubmit={handleAddTimelineNote} className="space-y-3 text-xs">
              <textarea
                required
                rows={3}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="اكتب تفاصيل المكالمة أو طلبات العميل بالتفصيل..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-rewaq-gold"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddNoteModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-black bg-slate-900 text-white hover:bg-slate-800"
                >
                  حفظ الملاحظة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. SCHEDULE NEXT ACTION MODAL */}
      {showScheduleNextAction && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">جدولة وتعيين مهمة تالية (Next Action)</h3>
            <form onSubmit={handleSaveNextAction} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">المهمة المطلوبة بدقة:</label>
                <input
                  type="text"
                  required
                  value={nextActionForm.task}
                  onChange={(e) => setNextActionForm({ ...nextActionForm, task: e.target.value })}
                  placeholder="مثال: إرسال صور واقعية للأقمشة وتأكيد موعد الزيارة"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الموعد المستهدف:</label>
                  <input
                    type="text"
                    value={nextActionForm.dueDate}
                    onChange={(e) => setNextActionForm({ ...nextActionForm, dueDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">مسؤول المتابعة:</label>
                  <select
                    value={nextActionForm.rep}
                    onChange={(e) => setNextActionForm({ ...nextActionForm, rep: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="كريم يوسف">كريم يوسف</option>
                    <option value="سارة ممدوح">سارة ممدوح</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">أولوية المهمة:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNextActionForm({ ...nextActionForm, priority: "urgent" })}
                    className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      nextActionForm.priority === "urgent"
                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    عاجلة اليوم ⚠️
                  </button>
                  <button
                    type="button"
                    onClick={() => setNextActionForm({ ...nextActionForm, priority: "normal" })}
                    className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      nextActionForm.priority === "normal"
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    عادية
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleNextAction(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-black bg-slate-900 text-white hover:bg-slate-800 shadow-xs"
                >
                  حفظ وتعيين المهمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. NEW MANUAL CUSTOMER MODAL */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">تسجيل عميل جديد بالـ CRM</h3>
              <button onClick={() => setShowNewCustomerModal(false)} className="text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم العميل:</label>
                  <input
                    type="text"
                    required
                    value={newCustomerForm.fullName}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, fullName: e.target.value })}
                    placeholder="مثال: د. هاني عبد الحميد"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف:</label>
                  <input
                    type="text"
                    required
                    value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                    placeholder="010XXXXXXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الفرع المفضل:</label>
                  <select
                    value={newCustomerForm.preferredBranch}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, preferredBranch: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="فرع التجمع الرئيسي">فرع التجمع الرئيسي</option>
                    <option value="فرع 6 أكتوبر (المول)">فرع 6 أكتوبر (المول)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">مسؤول المبيعات:</label>
                  <select
                    value={newCustomerForm.assignedRep}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, assignedRep: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="كريم يوسف">كريم يوسف</option>
                    <option value="سارة ممدوح">سارة ممدوح</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المنتج المهتم به:</label>
                <input
                  type="text"
                  value={newCustomerForm.productName}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, productName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات إضافية:</label>
                <textarea
                  rows={2}
                  value={newCustomerForm.notes}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewCustomerModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-black bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 shadow-xs"
                >
                  حفظ العميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
