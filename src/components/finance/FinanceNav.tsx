"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileCheck,
  Users2,
  Calendar,
  Wallet,
  Receipt,
  BadgePercent,
  Coins,
  History,
  FileSpreadsheet,
  Settings,
  Bot,
  Plus,
  ArrowRight,
  ShieldCheck,
  Building2,
  Lock,
  Sparkles,
  Layers,
  ArrowRightLeft,
  AlertTriangle,
  ChevronLeft,
} from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { FinanceRole } from "@/types/finance";

interface FinanceNavProps {
  onOpenReceiptModal?: () => void;
  onOpenExpenseModal?: () => void;
  onOpenJournalModal?: () => void;
  onOpenTransferModal?: () => void;
  onOpenAssistantModal?: () => void;
}

export default function FinanceNav({
  onOpenReceiptModal,
  onOpenExpenseModal,
  onOpenJournalModal,
  onOpenTransferModal,
  onOpenAssistantModal,
}: FinanceNavProps) {
  const pathname = usePathname();
  const { activeRole, setActiveRole, insights, etaInvoices, customerInstallments, financialSummary } = useFinance();
  const activeTabRef = useRef<HTMLAnchorElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const overdueCount = customerInstallments.filter((i) => i.status === "OVERDUE").length;
  const rejectedEtaCount = etaInvoices.filter((i) => i.etaStatus === "REJECTED").length;
  const activeInsightsCount = insights.filter((i) => !i.resolved).length;

  const roleLabels: Record<FinanceRole, { label: string; desc: string; color: string }> = {
    CASHIER: { label: "كاشير الصالة", desc: "سندات القبض والصرف اليومي", color: "bg-amber-100 text-amber-900 border-amber-300" },
    ACCOUNTANT: { label: "محاسب المعرض", desc: "القيود، الفواتير، الضرائب، الموردين", color: "bg-blue-100 text-blue-900 border-blue-300" },
    FINANCE_MANAGER: { label: "المدير المالي (CFO)", desc: "الاعتمادات، القوائم، الإقفال، الرؤية", color: "bg-emerald-100 text-emerald-900 border-emerald-300" },
    ADMIN: { label: "الإدارة العامة (Admin)", desc: "صلاحيات كاملة وإعدادات النظام", color: "bg-purple-100 text-purple-900 border-purple-300" },
  };

  const navTabs = [
    {
      name: "لوحة التحكم المالية",
      href: "/dashboard/finance",
      icon: LayoutDashboard,
      badge: activeInsightsCount > 0 ? `${activeInsightsCount} تنبيهات` : null,
      badgeColor: "bg-amber-500 text-slate-950 font-black",
      exact: true,
      roles: ["CASHIER", "ACCOUNTANT", "FINANCE_MANAGER", "ADMIN"],
    },
    {
      name: "الفواتير ومنظومة الضرائب ETA",
      href: "/dashboard/finance/invoices",
      icon: FileCheck,
      badge: rejectedEtaCount > 0 ? `${rejectedEtaCount} مرفوض` : "14% VAT",
      badgeColor: rejectedEtaCount > 0 ? "bg-rose-500 text-white font-bold" : "bg-emerald-100 text-emerald-800",
      exact: false,
      roles: ["ACCOUNTANT", "FINANCE_MANAGER", "ADMIN"],
    },
    {
      name: "حسابات العملاء والعرابين",
      href: "/dashboard/finance/receivables",
      icon: Users2,
      badge: `${(financialSummary.totalCustomerAdvancesHeld / 1000).toFixed(0)}k عرابين`,
      badgeColor: "bg-blue-100 text-blue-800",
      exact: false,
      roles: ["CASHIER", "ACCOUNTANT", "FINANCE_MANAGER", "ADMIN"],
    },
    {
      name: "جدول الأقساط والتحصيل",
      href: "/dashboard/finance/installments",
      icon: Calendar,
      badge: overdueCount > 0 ? `${overdueCount} متأخر` : null,
      badgeColor: "bg-rose-100 text-rose-800 font-bold",
      exact: false,
      roles: ["CASHIER", "ACCOUNTANT", "FINANCE_MANAGER", "ADMIN"],
    },
    {
      name: "سندات القبض (Receipts)",
      href: "/dashboard/finance/receipts",
      icon: Receipt,
      badge: null,
      exact: false,
      roles: ["CASHIER", "ACCOUNTANT", "FINANCE_MANAGER", "ADMIN"],
    },
    {
      name: "الخزائن والبنوك والتحويلات",
      href: "/dashboard/finance/treasury",
      icon: Wallet,
      badge: `${(financialSummary.totalLiquidCash / 1000000).toFixed(2)}M ج.م`,
      badgeColor: "bg-emerald-100 text-emerald-800 font-bold",
      exact: false,
      roles: ["CASHIER", "ACCOUNTANT", "FINANCE_MANAGER", "ADMIN"],
    },
    {
      name: "المصروفات ومراكز التكلفة",
      href: "/dashboard/finance/expenses",
      icon: BadgePercent,
      badge: null,
      exact: false,
      roles: ["ACCOUNTANT", "FINANCE_MANAGER", "ADMIN"],
    },
    {
      name: "الموردين وأوامر الشراء",
      href: "/dashboard/finance/suppliers",
      icon: Coins,
      badge: "جاهز للمشتريات",
      badgeColor: "bg-slate-100 text-slate-700",
      exact: false,
      roles: ["ACCOUNTANT", "FINANCE_MANAGER", "ADMIN"],
    },
    {
      name: "قيود اليومية والـ Ledger",
      href: "/dashboard/finance/journal",
      icon: History,
      badge: "Auto-Balance",
      badgeColor: "bg-indigo-100 text-indigo-800 font-medium",
      exact: false,
      roles: ["ACCOUNTANT", "FINANCE_MANAGER", "ADMIN"],
    },
    {
      name: "دليل الحسابات (COA)",
      href: "/dashboard/finance/accounts",
      icon: Layers,
      badge: null,
      exact: false,
      roles: ["ACCOUNTANT", "FINANCE_MANAGER", "ADMIN"],
    },
    {
      name: "الضرائب المصرية والفاتورة الإلكترونية",
      href: "/dashboard/finance/taxes",
      icon: Building2,
      badge: "ETA SDK",
      badgeColor: "bg-amber-100 text-amber-900 font-bold",
      exact: false,
      roles: ["ACCOUNTANT", "FINANCE_MANAGER", "ADMIN"],
    },
    {
      name: "القوائم المالية (P&L & BS)",
      href: "/dashboard/finance/reports",
      icon: FileSpreadsheet,
      badge: "P&L",
      badgeColor: "bg-emerald-600 text-white font-bold",
      exact: false,
      roles: ["ACCOUNTANT", "FINANCE_MANAGER", "ADMIN"],
    },
    {
      name: "المساعد المالي الذكي",
      href: "/dashboard/finance/assistant",
      icon: Bot,
      badge: "AI",
      badgeColor: "bg-rewaq-gold/20 text-rewaq-gold-dark font-black",
      exact: false,
      roles: ["CASHIER", "ACCOUNTANT", "FINANCE_MANAGER", "ADMIN"],
    },
    {
      name: "إعدادات الربط والضرائب",
      href: "/dashboard/finance/settings",
      icon: Settings,
      badge: null,
      exact: false,
      roles: ["FINANCE_MANAGER", "ADMIN"],
    },
  ];

  const filteredTabs = navTabs.filter((tab) => tab.roles.includes(activeRole));

  const isActiveTab = (tab: typeof navTabs[0]) => {
    if (tab.exact) {
      return pathname === tab.href;
    }
    return pathname.startsWith(tab.href);
  };

  // Find currently active tab item
  const currentActiveTab = filteredTabs.find((t) => isActiveTab(t)) || filteredTabs[0];

  // Auto-scroll the active tab into the center of view without manual scrolling
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [pathname, activeRole]);

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-4">
      {/* Top Header Row with Active Breadcrumb, Live Liquid Cash & Role Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/dashboard" className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 transition">
            <span>الرئيسية</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
          <Link href="/dashboard/finance" className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition">
            <span>المالية والمحاسبة</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          {/* Current Active Page Pill - Always visible at top */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 text-rewaq-gold font-black text-xs shadow-xs border border-slate-800">
            <currentActiveTab.icon className="w-3.5 h-3.5 text-rewaq-gold animate-pulse" />
            <span>{currentActiveTab.name}</span>
          </span>

          <span className="hidden xl:inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
            🇪🇬 متوافق مع منظومة الضرائب المصرية 2026
          </span>
        </div>

        {/* Global Quick Action Buttons & Role Simulation */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Simulation Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-rewaq-gold" />
            <span className="text-[11px] text-slate-500 font-medium">عرض بصلاحية:</span>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as FinanceRole)}
              className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
            >
              <option value="CASHIER">كاشير الصالة (Cashier)</option>
              <option value="ACCOUNTANT">محاسب (Accountant)</option>
              <option value="FINANCE_MANAGER">المدير المالي (CFO)</option>
              <option value="ADMIN">الإدارة العامة (Admin)</option>
            </select>
          </div>

          {onOpenAssistantModal && (
            <button
              type="button"
              onClick={onOpenAssistantModal}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-2 rounded-xl shadow-2xs transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-rewaq-gold" />
              <span>المستشار المالي الذكي</span>
            </button>
          )}

          {onOpenReceiptModal && (
            <button
              type="button"
              onClick={onOpenReceiptModal}
              className="inline-flex items-center gap-1 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>سند قبض / تحصيل</span>
            </button>
          )}

          {onOpenExpenseModal && (
            <button
              type="button"
              onClick={onOpenExpenseModal}
              className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3 py-2 rounded-xl border border-slate-200 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-rose-600" />
              <span>تسجيل مصروف</span>
            </button>
          )}

          {onOpenTransferModal && (
            <button
              type="button"
              onClick={onOpenTransferModal}
              className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3 py-2 rounded-xl border border-slate-200 transition cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
              <span>تحويل خزن/بنوك</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Navigation Tabs Bar (With Auto Scroll to Active Tab) */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-200 scroll-smooth"
      >
        {filteredTabs.map((tab) => {
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
