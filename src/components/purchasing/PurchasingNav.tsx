"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  ArrowDownLeft,
  Scale,
  RotateCcw,
  Building,
  BarChart3,
  Bot,
  Settings,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { usePurchasing } from "@/context/PurchasingContext";

interface PurchasingNavProps {
  onOpenCreatePO?: () => void;
  onOpenCreatePR?: () => void;
  onOpenAddSupplier?: () => void;
  onOpenAssistant?: () => void;
}

export default function PurchasingNav({
  onOpenCreatePO,
  onOpenCreatePR,
  onOpenAddSupplier,
  onOpenAssistant,
}: PurchasingNavProps) {
  const pathname = usePathname();
  const { metrics, suggestions, purchaseRequests } = usePurchasing();
  const activeTabRef = useRef<HTMLAnchorElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const pendingPRs = purchaseRequests.filter((pr) => pr.status === "SUBMITTED").length;
  const criticalSuggestionsCount = suggestions.filter((s) => s.urgency === "CRITICAL" || s.urgency === "HIGH").length;

  const navTabs = [
    {
      name: "لوحة التحكم والـ KPIs",
      href: "/dashboard/purchasing",
      icon: LayoutDashboard,
      badge: criticalSuggestionsCount > 0 ? `${criticalSuggestionsCount} تنبيهات` : null,
      badgeColor: "bg-amber-100 text-amber-900 border border-amber-300",
      exact: true,
    },
    {
      name: "تخطيط الاحتياجات (AI)",
      href: "/dashboard/purchasing/planning",
      icon: Sparkles,
      badge: suggestions.length > 0 ? `${suggestions.length} اقتراح` : null,
      badgeColor: "bg-purple-100 text-purple-900 border border-purple-300",
      exact: false,
    },
    {
      name: "طلبات الشراء (PR)",
      href: "/dashboard/purchasing/requests",
      icon: ShoppingCart,
      badge: pendingPRs > 0 ? `${pendingPRs} معلق` : null,
      badgeColor: "bg-blue-100 text-blue-900 border border-blue-300",
      exact: false,
    },
    {
      name: "أوامر الشراء والتوريد (PO)",
      href: "/dashboard/purchasing/orders",
      icon: ShoppingBag,
      badge: metrics.pendingApprovalCount > 0 ? `${metrics.pendingApprovalCount} اعتماد` : null,
      badgeColor: "bg-rose-100 text-rose-900 border border-rose-300",
      exact: false,
    },
    {
      name: "أذون الاستلام والفحص",
      href: "/dashboard/purchasing/receiving",
      icon: ArrowDownLeft,
      badge: metrics.partiallyReceivedCount > 0 ? `${metrics.partiallyReceivedCount} جزئي` : null,
      badgeColor: "bg-emerald-100 text-emerald-900 border border-emerald-300",
      exact: false,
    },
    {
      name: "الفواتير والمطابقة (3-Way)",
      href: "/dashboard/purchasing/invoices",
      icon: Scale,
      badge: "مطابقة",
      badgeColor: "bg-slate-100 text-slate-800",
      exact: false,
    },
    {
      name: "مرتجعات الموردين",
      href: "/dashboard/purchasing/returns",
      icon: RotateCcw,
      badge: null,
      exact: false,
    },
    {
      name: "دليل الموردين والتقييم",
      href: "/dashboard/purchasing/suppliers",
      icon: Building,
      badge: `${metrics.activeSuppliersCount}`,
      badgeColor: "bg-slate-100 text-slate-700",
      exact: false,
    },
    {
      name: "التقارير والتكاليف",
      href: "/dashboard/purchasing/reports",
      icon: BarChart3,
      badge: null,
      exact: false,
    },
    {
      name: "المساعد الذكي",
      href: "/dashboard/purchasing/assistant",
      icon: Bot,
      badge: "AI",
      badgeColor: "bg-amber-100 text-amber-950 font-black",
      exact: false,
    },
    {
      name: "الإعدادات والصلاحيات",
      href: "/dashboard/purchasing/settings",
      icon: Settings,
      badge: null,
      exact: false,
    },
  ];

  const isActiveTab = (tab: typeof navTabs[0]) => {
    if (tab.exact) {
      return pathname === tab.href;
    }
    return pathname.startsWith(tab.href);
  };

  const currentActiveTab = navTabs.find((t) => isActiveTab(t)) || navTabs[0];

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [pathname]);

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-4">
      {/* Top Breadcrumbs and Global Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/dashboard" className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 transition">
            <span>الرئيسية</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
          <Link href="/dashboard/purchasing" className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition">
            <span>المشتريات والموردين</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          {/* Current Active Page Pill */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 text-rewaq-gold font-black text-xs shadow-xs border border-slate-800">
            <currentActiveTab.icon className="w-3.5 h-3.5 text-rewaq-gold animate-pulse" />
            <span>{currentActiveTab.name}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenAssistant && (
            <button
              type="button"
              onClick={onOpenAssistant}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-2xs transition cursor-pointer"
            >
              <Bot className="w-4 h-4 text-rewaq-gold" />
              <span>المساعد الذكي</span>
            </button>
          )}

          {onOpenCreatePR && (
            <button
              type="button"
              onClick={onOpenCreatePR}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer border border-slate-300"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>طلب شراء جديد (PR)</span>
            </button>
          )}

          {onOpenCreatePO && (
            <button
              type="button"
              onClick={onOpenCreatePO}
              className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ أمر توريد جديد (PO)</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-200 scroll-smooth"
      >
        {navTabs.map((tab) => {
          const active = isActiveTab(tab);
          const IconComponent = tab.icon;
          return (
            <Link
              key={tab.href}
              ref={active ? activeTabRef : null}
              href={tab.href}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                active
                  ? "bg-slate-950 text-white font-black shadow-md border-2 border-rewaq-gold ring-2 ring-rewaq-gold/20 scale-[1.02]"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60"
              }`}
            >
              <IconComponent className={`w-4 h-4 ${active ? "text-rewaq-gold" : "text-slate-400"}`} />
              <span>{tab.name}</span>
              {active && <span className="w-1.5 h-1.5 rounded-full bg-rewaq-gold animate-ping"></span>}
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    active ? "bg-rewaq-gold text-slate-950 font-black" : tab.badgeColor || "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
