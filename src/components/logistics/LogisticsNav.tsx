"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  Calendar,
  Users2,
  AlertTriangle,
  RotateCcw,
  BarChart3,
  Bot,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useShowroom } from "@/context/ShowroomContext";

interface LogisticsNavProps {
  onOpenCreateModal?: () => void;
  onOpenAssistant?: () => void;
}

export default function LogisticsNav({
  onOpenCreateModal,
  onOpenAssistant,
}: LogisticsNavProps) {
  const pathname = usePathname();
  const { deliveries, deliveryIssues, deliveryReturns, logisticsInsights } = useShowroom();
  const activeTabRef = useRef<HTMLAnchorElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const activeIssuesCount = deliveryIssues.filter((i) => i.status === "OPEN" || i.status === "INVESTIGATING").length;
  const pendingReturnsCount = deliveryReturns.filter((r) => r.status === "PENDING_INSPECTION").length;
  const activeInsightsCount = logisticsInsights.filter((i) => !i.resolved).length;
  const outForDeliveryCount = deliveries.filter((d) => d.status === "OUT_FOR_DELIVERY").length;

  const navTabs = [
    {
      name: "لوحة التحكم والـ KPIs",
      href: "/dashboard/logistics",
      icon: LayoutDashboard,
      badge: activeInsightsCount > 0 ? `${activeInsightsCount} تنبيهات` : null,
      badgeColor: "bg-amber-100 text-amber-800",
      exact: true,
    },
    {
      name: "كل الشحنات",
      href: "/dashboard/logistics/orders",
      icon: Truck,
      badge: outForDeliveryCount > 0 ? `${outForDeliveryCount} في الطريق` : `${deliveries.length}`,
      badgeColor: "bg-blue-100 text-blue-800",
      exact: false,
    },
    {
      name: "الجدولة والمسارات",
      href: "/dashboard/logistics/schedule",
      icon: Calendar,
      badge: null,
      exact: false,
    },
    {
      name: "السائقين والمركبات",
      href: "/dashboard/logistics/fleet",
      icon: Users2,
      badge: null,
      exact: false,
    },
    {
      name: "المشاكل والبلاغات",
      href: "/dashboard/logistics/issues",
      icon: AlertTriangle,
      badge: activeIssuesCount > 0 ? `${activeIssuesCount} نشط` : null,
      badgeColor: "bg-rose-100 text-rose-800",
      exact: false,
    },
    {
      name: "المرتجعات",
      href: "/dashboard/logistics/returns",
      icon: RotateCcw,
      badge: pendingReturnsCount > 0 ? `${pendingReturnsCount} معلق` : null,
      badgeColor: "bg-purple-100 text-purple-800",
      exact: false,
    },
    {
      name: "التقارير والتحليلات",
      href: "/dashboard/logistics/reports",
      icon: BarChart3,
      badge: null,
      exact: false,
    },
    {
      name: "المساعد اللوجستي الذكي",
      href: "/dashboard/logistics/assistant",
      icon: Bot,
      badge: "AI",
      badgeColor: "bg-emerald-100 text-emerald-800 font-black",
      exact: false,
    },
  ];

  const isActiveTab = (tab: typeof navTabs[0]) => {
    if (tab.exact) {
      return pathname === tab.href;
    }
    return pathname.startsWith(tab.href);
  };

  // Find currently active tab item
  const currentActiveTab = navTabs.find((t) => isActiveTab(t)) || navTabs[0];

  // Auto-scroll the active tab into the center of view
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
      {/* Top Header Row with Active Breadcrumbs and Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/dashboard" className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 transition">
            <span>الرئيسية</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
          <Link href="/dashboard/logistics" className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition">
            <span>الشحن واللوجستيات</span>
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

          {onOpenCreateModal && (
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إصدار إذن تسليم جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar (With Auto-Scroll to Active Tab) */}
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
              {active && (
                <span className="w-1.5 h-1.5 rounded-full bg-rewaq-gold animate-ping"></span>
              )}
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
