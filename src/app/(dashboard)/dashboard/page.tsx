"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  Target,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ChevronLeft,
  Receipt,
  QrCode,
  Sparkles,
  HelpCircle,
  X,
  Lightbulb,
  Truck,
  Store,
  Crown,
  AlertTriangle,
  Layers,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Building2,
  Percent,
  Send,
  RotateCcw,
  BadgeAlert,
  Flame,
  Check,
  AlertCircle
} from "lucide-react";

interface MetricGuidance {
  title: string;
  metricName: string;
  value: string;
  meaning: string;
  benchmark: string;
  recommendations: string[];
}

export default function ExecutiveDashboard() {
  const [timeFilter, setTimeFilter] = useState("month");
  const [activeGuidance, setActiveGuidance] = useState<MetricGuidance | null>(null);
  const [showAdvisor, setShowAdvisor] = useState(true);
  const [contractsBranchFilter, setContractsBranchFilter] = useState("ALL");
  const [recoveryTriggered, setRecoveryTriggered] = useState(false);

  // Business Guidance Database for Showroom Owners
  const guidanceData: Record<string, MetricGuidance> = {
    cash: {
      title: "دليل السيولة والكاش المحصل",
      metricName: "السيولة المحصلة فعلياً",
      value: "520,000 ج.م",
      meaning: "إجمالي الأموال التي دخلت خزائن وحسابات المعرض فعلياً كعربونات نقدية أو دفعات بنكية مؤكدة خلال الفترة.",
      benchmark: "المعدل الصحي لمعارض الأثاث: ألا يقل العربون عن 30% إلى 40% من قيمة أي تعاقد لتغطية تكاليف التجهيز.",
      recommendations: [
        "تأكد من توريد كاش الصالة يومياً في الخزينة الرئيسية قبل الساعة 10 مساءً.",
        "شجع العملاء على الدفع بالتحويل اللحظي (InstaPay/Visa) لتقليل مخاطر النقدية بالفرع.",
        "حافظ على حد أمان سيولة لا يقل عن 150,000 ج لتغطية مستحقات النجارين والمشالات.",
      ],
    },
    cod: {
      title: "دليل البواقي وتحصيلات الشحن (COD)",
      metricName: "بواقي مستحقة عند الاستلام",
      value: "960,000 ج.م",
      meaning: "مبالغ مؤجلة على العملاء سيتم تحصيلها نقداً أو بفيزا متنقلة عند باب العميل أثناء التسليم والتركيب.",
      benchmark: "الخطر الأكبر: تراكم البواقي لأكثر من 30 يوماً بسبب تأخر تسليمات المصانع أو مماطلة العملاء.",
      recommendations: [
        "إلزام السائق بعدم تسليم وصل التركيب للعميل إلا بعد استلام كامل المبلغ المتبقي.",
        "تفعيل رسالة واتساب آلية للعميل قبل وصول الشحنة بـ 24 ساعة لتجهيز المبلغ كاش.",
        "مراجعة الأوردرات الجاهزة بالمستودع والتي لم يحدد عملاؤها موعد استلام لتنشيط التحصيل.",
      ],
    },
    sales: {
      title: "دليل حجم المبيعات والتعاقدات",
      metricName: "إجمالي التعاقدات الجديدة",
      value: "1,480,000 ج.م",
      meaning: "إجمالي القيمة البيعية للعقود الموقعة هذا الشهر (عربون + الباقي المستحق لاحقاً).",
      benchmark: "متوسط قيمة الفاتورة الصحية لمعرض أثاث مودرن/نيوكلاسيك: بين 45,000 إلى 75,000 ج للطلب الواحد.",
      recommendations: [
        "درّب بائعي الصالة على أسلوب (Cross-Selling): بيع ترابيزة قهوة أو سجاد مع الصالون.",
        "راقب نسبة الخصم الممنوحة من البائعين وألا تتجاوز 7% من السعر الرسمي.",
      ],
    },
    profit: {
      title: "دليل صافي الربح الفعلي بعد التكاليف",
      metricName: "صافي الربح التقديري",
      value: "525,000 ج.م (35.4%)",
      meaning: "الربح الحقيقي المتبقي للمؤسسة بعد خصم تكلفة شراء/تصنيع البضاعة، الخصومات الممنوحة بالصالة، وعمولات البائعين.",
      benchmark: "هامش الربح الصافي الصحي لمعارض الأثاث الجاهز: بين 30% إلى 42% بعد احتساب كافة المصاريف المباشرة.",
      recommendations: [
        "حساب تكلفة كل صنف بدقة تشمل تكلفة الخشب + التنجيد + النقل.",
        "ربط عمولة البائع بربحية القطعة وليس فقط بسعر البيع الإجمالي لتشجيعهم على تقليل الخصومات.",
      ],
    },
  };

  const allContracts = [
    {
      customer: "أ. ياسر جلال",
      branchId: "cairo",
      branchName: "فرع التجمع الرئيسي",
      branchBadge: "bg-rewaq-gold/15 text-rewaq-gold-dark border-rewaq-gold/30",
      items: "ركنة ليفنج L-Shape قماش بوكليه تركي",
      total: "58,000 ج",
      deposit: "20,000 ج عربون",
      rem: "38,000 ج",
      salesRep: "كريم يوسف",
      deliveryDate: "15 أكتوبر 2026",
    },
    {
      customer: "د. هبة الشريف",
      branchId: "october",
      branchName: "فرع 6 أكتوبر (المول)",
      branchBadge: "bg-blue-50 text-blue-700 border-blue-200",
      items: "غرفة طعام كاملة (سفرة + 8 كراسي + بوفيه رخام)",
      total: "94,000 ج",
      deposit: "30,000 ج عربون",
      rem: "64,000 ج",
      salesRep: "سارة ممدوح",
      deliveryDate: "28 أكتوبر 2026",
    },
    {
      customer: "م. محمد الشناوي",
      branchId: "cairo",
      branchName: "فرع التجمع الرئيسي",
      branchBadge: "bg-rewaq-gold/15 text-rewaq-gold-dark border-rewaq-gold/30",
      items: "صالون كلاسيك مذهب + 2 فوتيه",
      total: "76,000 ج",
      deposit: "25,000 ج عربون",
      rem: "51,000 ج",
      salesRep: "كريم يوسف",
      deliveryDate: "05 نوفمبر 2026",
    },
    {
      customer: "أ. عصام الدين فهمي",
      branchId: "damietta",
      branchName: "مبيعات مصنع دمياط",
      branchBadge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      items: "طقم غرفتي نوم خشب زان أحمر (تجهيز عريس)",
      total: "125,000 ج",
      deposit: "50,000 ج عربون",
      rem: "75,000 ج",
      salesRep: "محمود الشامي",
      deliveryDate: "20 نوفمبر 2026",
    },
  ];

  const deadStockItems = [
    {
      code: "STK-90D-01",
      name: "صالون كلاسيك رويال ذهبي (صالة أكتوبر)",
      days: "140 يوماً",
      value: "85,000 ج.م",
      action: "تصفية بخصم 15% أو نقل لصالة التجمع",
      badge: "bg-rose-50 text-rose-700 border-rose-200",
    },
    {
      code: "STK-90D-04",
      name: "غرفة سفرة 8 كراسي قماش مخمل (مخزن دمياط)",
      days: "110 يوماً",
      value: "72,000 ج.م",
      action: "إطلاق عرض واتساب ترويجي للعملاء السابقين",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      code: "STK-90D-09",
      name: "وحدة إضاءة نجف كريستال 12 ذراع (صالة التجمع)",
      days: "95 يوماً",
      value: "34,000 ج.م",
      action: "عرضها كهدية ترويجية مع غرف السفرة",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
    },
  ];

  // Action Center Items ("يحتاج تدخلك الآن")
  const actionCenterItems = [
    {
      id: "delayed-orders",
      count: "3",
      title: "أوردرات متأخرة عن موعد التسليم",
      description: "3 طلبات تجاوزت موعد التسليم المعتمد في صالات التجمع وأكتوبر وبحاجة لتنسيق فوري مع المصنع والعميل",
      ctaText: "عرض الأوردرات",
      href: "/dashboard/logistics",
      priority: "urgent" as const,
      priorityLabel: "عاجل جداً",
      tag: "لوجستيات وشحن",
      icon: Truck,
      dotColor: "bg-rose-500",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      accentBorder: "hover:border-rose-300",
    },
    {
      id: "pending-quotes",
      count: "7",
      title: "عروض أسعار بدون متابعة منذ 72 ساعة",
      description: "7 عروض أسعار مرسلة لعملاء الصالات لم يتم التواصل معهم لتأكيد التعاقد ودفع العربون",
      ctaText: "متابعة العروض",
      href: "/dashboard/crm",
      priority: "attention" as const,
      priorityLabel: "متابعة مطلوبة",
      tag: "مبيعات و CRM",
      icon: Target,
      dotColor: "bg-amber-500",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      accentBorder: "hover:border-amber-300",
    },
    {
      id: "overdue-invoices",
      count: "2",
      title: "فواتير وبواقي شحن مستحقة ومتأخرة",
      description: "فاتورتان COD بقيمة 38,500 ج.م بانتظار تأكيد الاستلام وتوريد النقدية في الخزينة الرئيسية",
      ctaText: "عرض التحصيلات",
      href: "/dashboard/logistics",
      priority: "urgent" as const,
      priorityLabel: "تحصيل فوري",
      tag: "المالية والخزينة",
      icon: Receipt,
      dotColor: "bg-rose-500",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      accentBorder: "hover:border-rose-300",
    },
    {
      id: "low-stock",
      count: "4",
      title: "منتجات تحت حد المخزون الحرج",
      description: "4 أطقم سريعة الدوران (صالونات وركنات) وصلت إلى رصيد حرج بمستودع وصالة دمياط",
      ctaText: "عرض المخزون",
      href: "/dashboard/floor-samples",
      priority: "attention" as const,
      priorityLabel: "إعادة طلب",
      tag: "المخزون والمستودعات",
      icon: Layers,
      dotColor: "bg-amber-500",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      accentBorder: "hover:border-amber-300",
    },
    {
      id: "ad-review",
      count: "1",
      title: "حملة إعلانية تحتاج مراجعة الميزانية",
      description: "حملة السفرة والترابيزات تسجل تكلفة ليد مرتفعة؛ نوصي بنقل جزء من ميزانيتها لحملة الصالونات الأكثر ربحية",
      ctaText: "عرض الحملة",
      href: "/dashboard/crm",
      priority: "attention" as const,
      priorityLabel: "تحسين ميزانية",
      tag: "إعلانات Meta",
      icon: Sparkles,
      dotColor: "bg-blue-500",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      accentBorder: "hover:border-blue-300",
    },
  ];

  const filteredContracts = allContracts.filter(
    (c) => contractsBranchFilter === "ALL" || c.branchId === contractsBranchFilter
  );

  const handleTriggerRecovery = () => {
    setRecoveryTriggered(true);
    setTimeout(() => {
      setRecoveryTriggered(false);
    }, 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Header Bar: Welcome & Period Toggle */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rewaq-gold/15 text-rewaq-gold-dark font-black border border-rewaq-gold/30">
              الرؤية التنفيذية للمدير العام
            </span>
            <span className="text-xs text-slate-500 font-medium">عرض شامل لجميع الفروع والصالات</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            مرحباً بك، أ. أحمد سمير 👋
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            إليك التقرير المالي المباشر، عوائد إعلانات Meta، وموقف تحصيلات ومعروضات جميع الفروع.
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start md:self-auto shrink-0">
          {[
            { id: "today", label: "اليوم" },
            { id: "week", label: "هذا الأسبوع" },
            { id: "month", label: "هذا الشهر" },
            { id: "year", label: "السنة المالية" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTimeFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                timeFilter === item.id
                  ? "bg-white text-slate-900 shadow-xs font-black"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Executive Summary & KPIs: Financial Health & Profitability */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Real Cash Inflow */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">السيولة المحصلة</span>
              <button
                type="button"
                onClick={() => setActiveGuidance(guidanceData.cash)}
                title="اضغط لمعرفة التوجيه والدليل الإرشادي لهذا الرقم"
                className="text-slate-400 hover:text-rewaq-gold transition cursor-pointer p-0.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-700 tracking-tight font-mono flex items-baseline gap-1.5">
              <span>520,000</span>
              <span className="text-xs font-sans font-normal text-slate-500">ج.م</span>
            </div>
            <div className="mt-2 text-[11px] font-bold text-emerald-700 flex items-center gap-1 whitespace-nowrap">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>عربونات ودفعات مودعة بالخزائن</span>
            </div>
          </div>
        </div>

        {/* Card 2: COD Receivables */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">بواقي الشحن (COD)</span>
              <button
                type="button"
                onClick={() => setActiveGuidance(guidanceData.cod)}
                title="اضغط لمعرفة التوجيه والدليل الإرشادي لهذا الرقم"
                className="text-slate-400 hover:text-rewaq-gold transition cursor-pointer p-0.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600 tracking-tight font-mono flex items-baseline gap-1.5">
              <span>960,000</span>
              <span className="text-xs font-sans font-normal text-slate-500">ج.م</span>
            </div>
            <div className="mt-2 text-[11px] font-bold text-amber-700 flex items-center gap-1 whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>تُحصّل مع سيارات التسليم والتركيب</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Booked Sales */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">إجمالي التعاقدات</span>
              <button
                type="button"
                onClick={() => setActiveGuidance(guidanceData.sales)}
                title="اضغط لمعرفة التوجيه والدليل الإرشادي لهذا الرقم"
                className="text-slate-400 hover:text-rewaq-gold transition cursor-pointer p-0.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono flex items-baseline gap-1.5">
              <span>1,480,000</span>
              <span className="text-xs font-sans font-normal text-slate-500">ج.م</span>
            </div>
            <div className="mt-2 text-[11px] font-bold text-slate-600 flex items-center gap-1 whitespace-nowrap">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-emerald-700 font-bold">+18.4%</span>
              <span className="text-slate-400">إجمالي (28 تعاقد جديد)</span>
            </div>
          </div>
        </div>

        {/* Card 4: Real Net Profit Margin */}
        <div className="bg-gradient-to-br from-rewaq-card to-rewaq-dark rounded-2xl p-5 border border-slate-800 shadow-md text-white flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-200 whitespace-nowrap">صافي الربح التقديري</span>
              <button
                type="button"
                onClick={() => setActiveGuidance(guidanceData.profit)}
                title="اضغط لمعرفة التوجيه والدليل الإرشادي لهذا الرقم"
                className="text-slate-400 hover:text-rewaq-gold transition cursor-pointer p-0.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="w-8 h-8 rounded-xl bg-rewaq-gold/15 border border-rewaq-gold/30 text-rewaq-gold flex items-center justify-center font-bold">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-rewaq-gold tracking-tight font-mono flex items-baseline gap-1.5">
              <span>525,000</span>
              <span className="text-xs font-sans font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">
                هامش 35.4%
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-1.5 font-mono whitespace-nowrap">
              <span>بعد تكاليف المصنع</span>
              <span className="text-slate-300">والعمولات والخصم</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Zone 2: Action Center: "يحتاج تدخلك الآن" (What Needs Attention Now) */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/90 shadow-2xs">
        
        {/* Action Center Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-bold shrink-0 shadow-2xs">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">يحتاج تدخلك الآن</h2>
                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  <span>5 مهام تتطلب قراراً عاجلاً</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                أهم التنبيهات التشغيلية والمالية التي تتطلب تدخلاً فورياً لتفادي التأخيرات وحماية الإيرادات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>تحديث مباشر من كافة الفروع</span>
          </div>
        </div>

        {/* Action Center Items - Spacious, Legible & Non-Overlapping */}
        <div className="space-y-3">
          {actionCenterItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`group bg-slate-50/70 hover:bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${item.accentBorder}`}
              >
                {/* Right & Middle: Badges, Title, Context & Tags */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  
                  {/* Big Bold Number Pill */}
                  <div
                    className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-mono shrink-0 border shadow-2xs ${
                      item.priority === "urgent"
                        ? "bg-rose-50 border-rose-200 text-rose-700"
                        : "bg-amber-50 border-amber-200 text-amber-700"
                    }`}
                  >
                    <span className="text-lg font-black leading-none">{item.count}</span>
                  </div>

                  {/* Text Details Area */}
                  <div className="min-w-0 flex-1 space-y-1">
                    {/* Top line: Priority Badge, Title, Category Tag */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-md font-bold border ${item.badgeColor}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor}`}></span>
                        {item.priorityLabel}
                      </span>

                      <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                        {item.title}
                      </h3>

                      <span className="text-[11px] font-medium text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200/70">
                        {item.tag}
                      </span>
                    </div>

                    {/* Context Description - Fully readable without ellipsis cut-off */}
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Left: Dedicated Action Button */}
                <div className="shrink-0 flex items-center justify-end sm:justify-start lg:justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200/60">
                  <Link
                    href={item.href}
                    className="inline-flex items-center justify-center gap-2 bg-white group-hover:bg-slate-900 text-slate-800 group-hover:text-white border border-slate-300 group-hover:border-slate-900 text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer whitespace-nowrap"
                  >
                    <span>{item.ctaText}</span>
                    <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-rewaq-gold group-hover:-translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* 4. Zone 3: Meta Ads Engine & Showroom Lead Recovery Tool */}
      <div className="space-y-4">
        
        {/* Abandoned Showroom Visitors Recovery Banner (Killer Feature) */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-rewaq-dark border border-emerald-500/30 rounded-2xl p-4 md:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-xs md:text-sm font-black text-white">
                  استرجاع زوار المعرض الذين لم يتعاقدوا بعد (64 زائر محتمل)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  واتساب ذكي 💬
                </span>
              </div>
              <p className="text-xs text-slate-300">
                من بين 92 زبون زاروا صالات المعرض هذا الشهر، 28 تعاقدوا و <strong className="text-emerald-400 font-bold">64 زبون لم يحسموا قرارهم</strong>. أرسل لهم عرض حافز فوري بضغطة زر.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTriggerRecovery}
            disabled={recoveryTriggered}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md ${
              recoveryTriggered
                ? "bg-emerald-500 text-slate-950 font-black"
                : "bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950"
            }`}
          >
            {recoveryTriggered ? (
              <>
                <Check className="w-4 h-4" />
                <span>تم تجهيز وإرسال رسائل الواتساب بنجاح ✅</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>إطلاق عرض حافز لـ 64 زائر (واتساب)</span>
              </>
            )}
          </button>
        </div>

        {/* Meta ROI Table */}
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rewaq-emerald"></div>
                <h2 className="text-sm md:text-base font-bold text-slate-900">
                  أداء الحملات الإعلانية ومبيعات الصالة الناتجة (Meta ROI Tracker)
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ربط مباشر بين مصروفات فيسبوك وإنستجرام ومبيعات العقود المسجلة داخل المعرض
              </p>
            </div>
            
            <Link
              href="/dashboard/crm"
              className="text-xs font-bold text-rewaq-gold-dark hover:text-slate-950 flex items-center gap-1 bg-rewaq-gold/10 px-3 py-1.5 rounded-xl transition self-start sm:self-auto"
            >
              <span>عرض كل الليدز في مسار الـ CRM</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200">
                  <th className="py-3 px-3.5">اسم الحملة الإعلانية</th>
                  <th className="py-3 px-3.5">المنصة</th>
                  <th className="py-3 px-3.5">المصروف الإعلاني</th>
                  <th className="py-3 px-3.5 text-center">الليدز</th>
                  <th className="py-3 px-3.5 text-center">زيارات المعرض</th>
                  <th className="py-3 px-3.5">المبيعات المحققة</th>
                  <th className="py-3 px-3.5 text-center">معدل العائد (ROAS)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  {
                    name: "حملة الصالونات المودرن والسمارت ليفنج",
                    platform: "Facebook Lead Ads",
                    spend: "12,400 ج.م",
                    leads: "142 عميل",
                    visits: "38 زائر",
                    revenue: "385,000 ج.م",
                    roas: "31.0X",
                    roasBadge: "bg-emerald-50 text-emerald-800 border-emerald-200 font-black",
                  },
                  {
                    name: "حملة غرف النوم النيو كلاسيك الملكية",
                    platform: "Instagram Reels Ads",
                    spend: "10,800 ج.م",
                    leads: "98 عميل",
                    visits: "24 زائر",
                    revenue: "220,000 ج.م",
                    roas: "20.3X",
                    roasBadge: "bg-emerald-50 text-emerald-800 border-emerald-200 font-black",
                  },
                  {
                    name: "حملة النجف ووحدات الإضاءة الكريستال",
                    platform: "Click to WhatsApp",
                    spend: "5,600 ج.م",
                    leads: "85 عميل",
                    visits: "19 زائر",
                    revenue: "95,000 ج.م",
                    roas: "16.9X",
                    roasBadge: "bg-blue-50 text-blue-800 border-blue-200 font-bold",
                  },
                  {
                    name: "حملة السفرة وترابيزات الاستقبال الرخام",
                    platform: "Website Catalog Form",
                    spend: "3,200 ج.م",
                    leads: "45 عميل",
                    visits: "11 زائر",
                    revenue: "40,000 ج.م",
                    roas: "12.5X",
                    roasBadge: "bg-amber-50 text-amber-800 border-amber-200 font-bold",
                  },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-3.5 font-bold text-slate-900">{row.name}</td>
                    <td className="py-3.5 px-3.5 text-slate-600 font-medium">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px]">
                        {row.platform}
                      </span>
                    </td>
                    <td className="py-3.5 px-3.5 font-mono font-bold text-slate-700">{row.spend}</td>
                    <td className="py-3.5 px-3.5 text-center font-mono text-slate-600">{row.leads}</td>
                    <td className="py-3.5 px-3.5 text-center font-mono font-bold text-slate-900 bg-slate-50/50">
                      {row.visits}
                    </td>
                    <td className="py-3.5 px-3.5 font-mono font-bold text-emerald-700 text-sm">
                      {row.revenue}
                    </td>
                    <td className="py-3.5 px-3.5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-mono border ${row.roasBadge}`}>
                        {row.roas}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 5. Zone 3: Multi-Branch Performance & Dispatch Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 6 Columns: Executive Dispatch Pulse */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">موقف شحنات وتحصيلات اليوم (Dispatch Pulse)</h2>
                  <p className="text-[11px] text-slate-400">ملخص تسليمات الأسطول وتحصيل البواقي مع المناديب</p>
                </div>
              </div>
              
              <Link
                href="/dashboard/logistics"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg transition"
              >
                <span>الجدول التفصيلي</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Daily Delivery Progress */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 mb-4">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-bold text-slate-700">شحنات اليوم: 4 من 6 تم تسليمها</span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                  66% إنجاز
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full w-[66%] rounded-full transition-all duration-500"></div>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-200/60 font-mono">
                <span>كاش محصل مع السائقين: <strong className="text-emerald-700 font-bold">82,000 ج</strong></span>
                <span>باقي متوقع: <strong className="text-amber-600 font-bold">63,500 ج</strong></span>
              </div>
            </div>

            {/* Alert Box */}
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">تنبيه تأجيل موعد شحنة:</span>
                <span className="text-[11px] text-amber-800">العميلة م/ نادية رشدي طلبت تأجيل استلام غرفة النوم للغد في الشيخ زايد.</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>عدد سيارات المعرض المتحركة: <strong>3 سيارات</strong></span>
            <Link href="/dashboard/logistics" className="font-bold text-slate-800 hover:text-rewaq-gold flex items-center gap-1">
              <span>إدارة خطوط السير</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right 6 Columns: Branch Performance Comparison */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rewaq-gold/15 text-rewaq-gold-dark flex items-center justify-center font-bold">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">مقارنة مبيعات الفروع (Branch Performance)</h2>
                  <p className="text-[11px] text-slate-400">حجم تعاقدات كل فرع ونسبة تحقيق التارجت الشهري</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                هذا الشهر
              </span>
            </div>

            <div className="space-y-3.5">
              {[
                { name: "فرع التجمع الخامس (الرئيسي)", sales: "850,000 ج.م", target: "1,000,000 ج", pct: "85%", bar: "w-[85%]", color: "bg-rewaq-gold" },
                { name: "فرع 6 أكتوبر (مول الأثاث)", sales: "420,000 ج.م", target: "500,000 ج", pct: "84%", bar: "w-[84%]", color: "bg-blue-600" },
                { name: "مبيعات مصنع ومستودع دمياط", sales: "210,000 ج.م", target: "250,000 ج", pct: "84%", bar: "w-[84%]", color: "bg-emerald-600" },
              ].map((branch, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-bold text-slate-800">{branch.name}</span>
                    <span className="font-mono font-bold text-slate-900">{branch.sales} <span className="text-slate-400 text-[10px]">({branch.pct})</span></span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                    <div className={`${branch.color} ${branch.bar} h-full rounded-full transition-all duration-500`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>إجمالي المحقق: <strong className="text-slate-900">1,480,000 ج</strong></span>
            <span>التارجت العام: <strong className="text-slate-900">1,750,000 ج</strong></span>
          </div>
        </div>

      </div>

      {/* 6. Zone 4: Multi-Branch Contracts & Dead Stock Capital Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Columns: Multi-Branch Contracts with Branch Filter Tabs */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-rewaq-gold" />
                <h2 className="text-sm font-bold text-slate-900">أحدث عقود وحجوزات كافة الفروع</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">سجل العربونات والتعاقدات مصنفة حسب كل فرع وصالة عرض</p>
            </div>

            {/* Quick Branch Filter Pill */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] overflow-x-auto self-start sm:self-auto">
              {[
                { id: "ALL", label: "كل الفروع" },
                { id: "cairo", label: "التجمع" },
                { id: "october", label: "أكتوبر" },
                { id: "damietta", label: "دمياط" },
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => setContractsBranchFilter(b.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                    contractsBranchFilter === b.id
                      ? "bg-white text-slate-950 shadow-xs font-black"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredContracts.map((deal, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold text-slate-900">{deal.customer}</span>
                    
                    {/* Explicit Branch Badge */}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${deal.branchBadge}`}>
                      📍 {deal.branchName}
                    </span>

                    <span className="text-[10px] text-slate-400">
                      بواسطة: {deal.salesRep}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{deal.items}</p>
                  <p className="text-[10px] text-slate-400 mt-1">تاريخ الاستلام المطلوب: {deal.deliveryDate}</p>
                </div>
                <div className="text-left font-mono shrink-0">
                  <div className="text-xs font-bold text-slate-900">{deal.total}</div>
                  <div className="text-[11px] font-bold text-emerald-600">{deal.deposit}</div>
                  <div className="text-[10px] text-amber-600 font-medium">باقي: {deal.rem}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Columns: Dead Stock Capital Radar (Killer Protection Tool) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-600" />
                  <h2 className="text-sm font-bold text-slate-900">رادار البضاعة الراكدة والتصفية</h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">قطع تجاوزت 90 يوماً لحماية رأس المال من التجميد</p>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                191,000 ج معطل
              </span>
            </div>

            <div className="space-y-3">
              {deadStockItems.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-200/90 bg-slate-50 hover:bg-white transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800">{item.name}</span>
                    <span className="text-xs font-mono font-bold text-rose-700">{item.value}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-200/60 mt-1.5">
                    <span className={`px-2 py-0.5 rounded-md font-bold border ${item.badge}`}>
                      ⏳ {item.days}
                    </span>
                    <span className="text-slate-600 font-medium">{item.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              href="/dashboard/floor-samples"
              className="text-xs font-bold text-rewaq-gold-dark hover:text-slate-950 flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4" />
              <span>إدارة خطة التصفيات والعروض الترويجية</span>
            </Link>
          </div>
        </div>

      </div>

      {/* 7. Guidance Modal */}
      {activeGuidance && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 text-slate-900 relative">
            <button
              onClick={() => setActiveGuidance(null)}
              className="absolute top-5 left-5 text-slate-400 hover:text-slate-800 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-rewaq-gold/15 text-rewaq-gold-dark flex items-center justify-center font-bold">
                <Lightbulb className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">{activeGuidance.title}</h3>
                <p className="text-xs text-slate-500 font-medium font-mono">{activeGuidance.metricName}: {activeGuidance.value}</p>
              </div>
            </div>

            <div className="space-y-4 text-xs leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <h4 className="font-bold text-slate-800 mb-1">📖 ماذا يعني هذا الرقم؟</h4>
                <p className="text-slate-600">{activeGuidance.meaning}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-900">
                <h4 className="font-bold mb-1">📊 معيار السوق الصحي (Industry Benchmark):</h4>
                <p>{activeGuidance.benchmark}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">🎯 نصائح وتوجيهات تشغيلية لزيادة أرباحك:</h4>
                <ul className="space-y-2">
                  {activeGuidance.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-rewaq-gold mt-1.5 shrink-0"></span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveGuidance(null)}
                className="bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                فهمت، إغلاق الدليل
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
