"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users2,
  Building2,
  Briefcase,
  FileCheck,
  Clock,
  CalendarDays,
  Plane,
  HandCoins,
  Banknote,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  Plus,
  ArrowRight,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { useHR } from "@/context/HRContext";
import { HrRole } from "@/types/hr";
import { formatEGP } from "@/lib/hrEngine";

interface HrNavProps {
  onOpenEmployeeModal?: () => void;
  onOpenAttendanceModal?: () => void;
  onOpenLeaveModal?: () => void;
  onOpenAdvanceModal?: () => void;
  onOpenPayrollModal?: () => void;
}

export default function HrNav({
  onOpenEmployeeModal,
  onOpenAttendanceModal,
  onOpenLeaveModal,
  onOpenAdvanceModal,
  onOpenPayrollModal,
}: HrNavProps) {
  const pathname = usePathname();
  const { activeRole, setActiveRole, hrMetrics, insights } = useHR();
  const activeTabRef = useRef<HTMLAnchorElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const activeInsightsCount = insights.filter((i) => !i.resolved).length;

  const navTabs = [
    {
      name: "لوحة التحكم الرئيسية",
      href: "/dashboard/hr",
      icon: LayoutDashboard,
      badge: activeInsightsCount > 0 ? `${activeInsightsCount} تنبيهات` : null,
      badgeColor: "bg-amber-500 text-slate-950 font-black",
      exact: true,
      roles: ["HR_ADMIN", "HR_OFFICER", "PAYROLL_OFFICER", "MANAGER", "FINANCE"],
    },
    {
      name: "دليل الموظفين والملفات",
      href: "/dashboard/hr/employees",
      icon: Users2,
      badge: `${hrMetrics.totalEmployees} موظف`,
      badgeColor: "bg-slate-100 text-slate-800",
      exact: false,
      roles: ["HR_ADMIN", "HR_OFFICER", "PAYROLL_OFFICER", "MANAGER", "FINANCE"],
    },
    {
      name: "الهيكل والأقسام",
      href: "/dashboard/hr/departments",
      icon: Building2,
      badge: null,
      exact: false,
      roles: ["HR_ADMIN", "HR_OFFICER", "MANAGER"],
    },
    {
      name: "الوظائف والدرجات",
      href: "/dashboard/hr/positions",
      icon: Briefcase,
      badge: null,
      exact: false,
      roles: ["HR_ADMIN", "HR_OFFICER"],
    },
    {
      name: "عقود العمل والتجديد",
      href: "/dashboard/hr/contracts",
      icon: FileCheck,
      badge: hrMetrics.expiringContractsCount > 0 ? `${hrMetrics.expiringContractsCount} ينتهي قريباً` : null,
      badgeColor: "bg-rose-500 text-white font-bold animate-pulse",
      exact: false,
      roles: ["HR_ADMIN", "HR_OFFICER", "FINANCE"],
    },
    {
      name: "الحضور والانصراف اليومي",
      href: "/dashboard/hr/attendance",
      icon: Clock,
      badge: hrMetrics.todayLateCount > 0 ? `${hrMetrics.todayLateCount} تأخير` : "مباشر",
      badgeColor: hrMetrics.todayLateCount > 0 ? "bg-amber-100 text-amber-900 font-bold" : "bg-emerald-100 text-emerald-800",
      exact: false,
      roles: ["HR_ADMIN", "HR_OFFICER", "PAYROLL_OFFICER", "MANAGER"],
    },
    {
      name: "مواعيد وجداول الدوام",
      href: "/dashboard/hr/schedules",
      icon: CalendarDays,
      badge: null,
      exact: false,
      roles: ["HR_ADMIN", "HR_OFFICER"],
    },
    {
      name: "الإجازات والأرصدة",
      href: "/dashboard/hr/leaves",
      icon: Plane,
      badge: hrMetrics.pendingLeaveRequestsCount > 0 ? `${hrMetrics.pendingLeaveRequestsCount} معلق` : null,
      badgeColor: "bg-amber-500 text-slate-950 font-black",
      exact: false,
      roles: ["HR_ADMIN", "HR_OFFICER", "MANAGER"],
    },
    {
      name: "السلف والأقساط الشهرية",
      href: "/dashboard/hr/advances",
      icon: HandCoins,
      badge: `${(hrMetrics.totalActiveAdvancesBalance / 1000).toFixed(0)}k سلف`,
      badgeColor: "bg-blue-100 text-blue-900 font-bold",
      exact: false,
      roles: ["HR_ADMIN", "HR_OFFICER", "PAYROLL_OFFICER", "FINANCE"],
    },
    {
      name: "مسيرات الرواتب (Payroll)",
      href: "/dashboard/hr/payroll",
      icon: Banknote,
      badge: hrMetrics.latestPayrollStatus === "CALCULATED" ? "بانتظار الاعتماد" : "سبتمبر 2026",
      badgeColor: "bg-rewaq-emerald text-white font-bold",
      exact: false,
      roles: ["HR_ADMIN", "PAYROLL_OFFICER", "FINANCE"],
    },
    {
      name: "مخالصات نهاية الخدمة",
      href: "/dashboard/hr/settlements",
      icon: UserCheck,
      badge: null,
      exact: false,
      roles: ["HR_ADMIN", "PAYROLL_OFFICER", "FINANCE"],
    },
    {
      name: "تقارير الموارد البشرية والرواتب",
      href: "/dashboard/hr/reports",
      icon: FileSpreadsheet,
      badge: "تحليلات",
      badgeColor: "bg-purple-100 text-purple-900 font-bold",
      exact: false,
      roles: ["HR_ADMIN", "PAYROLL_OFFICER", "MANAGER", "FINANCE"],
    },
    {
      name: "بوابة الموظف (Self-Service)",
      href: "/dashboard/hr/portal",
      icon: Sparkles,
      badge: "بوابة شخصية",
      badgeColor: "bg-rewaq-gold/20 text-rewaq-gold-dark font-black",
      exact: false,
      roles: ["HR_ADMIN", "HR_OFFICER", "PAYROLL_OFFICER", "MANAGER", "EMPLOYEE", "FINANCE"],
    },
    {
      name: "إعدادات الضرائب والتأمينات",
      href: "/dashboard/hr/settings",
      icon: Settings,
      badge: "🇪🇬 2026",
      badgeColor: "bg-slate-200 text-slate-800 font-mono",
      exact: false,
      roles: ["HR_ADMIN", "FINANCE"],
    },
  ];

  const filteredTabs = navTabs.filter((tab) => tab.roles.includes(activeRole));

  const isActiveTab = (tab: (typeof navTabs)[0]) => {
    if (tab.exact) {
      return pathname === tab.href;
    }
    return pathname.startsWith(tab.href);
  };

  const currentActiveTab = filteredTabs.find((t) => isActiveTab(t)) || filteredTabs[0] || navTabs[0];

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
      {/* Top Header Row with Active Breadcrumb, Egyptian Compliance badge & Role Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/dashboard" className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 transition">
            <span>الرئيسية</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
          <Link href="/dashboard/hr" className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition">
            <span>الموارد البشرية والرواتب</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          {/* Current Active Page Pill */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 text-rewaq-gold font-black text-xs shadow-xs border border-slate-800">
            <currentActiveTab.icon className="w-3.5 h-3.5 text-rewaq-gold animate-pulse" />
            <span>{currentActiveTab.name}</span>
          </span>

          <span className="hidden xl:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
            🇪🇬 قانون العمل المصري والضرائب والتأمينات 2026
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
              onChange={(e) => setActiveRole(e.target.value as HrRole)}
              className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
            >
              <option value="HR_ADMIN">مدير الموارد البشرية (HR Admin)</option>
              <option value="HR_OFFICER">مسؤول شؤون عاملين (HR Officer)</option>
              <option value="PAYROLL_OFFICER">مسؤول الرواتب (Payroll Officer)</option>
              <option value="MANAGER">مدير قسم / فرع (Manager)</option>
              <option value="EMPLOYEE">بوابة الموظف (Employee Portal)</option>
              <option value="FINANCE">الإدارة المالية (Finance CFO)</option>
            </select>
          </div>

          {onOpenEmployeeModal && (
            <button
              type="button"
              onClick={onOpenEmployeeModal}
              className="inline-flex items-center gap-1 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة موظف جديد</span>
            </button>
          )}

          {onOpenAttendanceModal && (
            <button
              type="button"
              onClick={onOpenAttendanceModal}
              className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3 py-2 rounded-xl border border-slate-200 transition cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>تسجيل حضور يدوي</span>
            </button>
          )}

          {onOpenLeaveModal && (
            <button
              type="button"
              onClick={onOpenLeaveModal}
              className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3 py-2 rounded-xl border border-slate-200 transition cursor-pointer"
            >
              <Plane className="w-3.5 h-3.5 text-emerald-600" />
              <span>طلب إجازة</span>
            </button>
          )}

          {onOpenAdvanceModal && (
            <button
              type="button"
              onClick={onOpenAdvanceModal}
              className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3 py-2 rounded-xl border border-slate-200 transition cursor-pointer"
            >
              <HandCoins className="w-3.5 h-3.5 text-purple-600" />
              <span>طلب سلفة</span>
            </button>
          )}

          {onOpenPayrollModal && (
            <button
              type="button"
              onClick={onOpenPayrollModal}
              className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-2 rounded-xl shadow-2xs transition cursor-pointer"
            >
              <Banknote className="w-3.5 h-3.5 text-rewaq-gold" />
              <span>إنشاء مسير راتب</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Navigation Tabs Bar */}
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
