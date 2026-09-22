"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users2,
  FileSpreadsheet,
  CalendarCheck,
  Package,
  Layers,
  Truck,
  Wrench,
  Wallet,
  Coins,
  BadgePercent,
  Globe,
  Settings,
  Bell,
  Search,
  Plus,
  Store,
  ChevronDown,
  Menu,
  X,
  LogOut,
  QrCode,
  ArrowUpRight,
  ArrowRightLeft,
  ArrowDownLeft,
  ShieldCheck,
  FileCheck,
  History,
  Sparkles,
  AlertTriangle,
  ShoppingCart,
  ShoppingBag,
  Receipt,
  RotateCcw,
  Building,
  BarChart3,
  Bot,
  Scale,
  Briefcase,
  Plane,
  HandCoins,
  Banknote,
  UserCheck,
} from "lucide-react";
import Logo from "@/components/brand/Logo";
import { ShowroomProvider, useShowroom } from "@/context/ShowroomContext";
import { FinanceProvider } from "@/context/FinanceContext";
import { PurchasingProvider } from "@/context/PurchasingContext";
import { HRProvider } from "@/context/HRContext";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | null;
  badgeType?: "gold" | "emerald" | "blue" | "amber" | "purple" | "rose" | "slate";
  external?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeBranch, setActiveBranch] = useState("branch-cairo");

  const navigationGroups: NavGroup[] = [
    {
      title: "الرئيسية",
      items: [
        {
          name: "لوحة الرؤية والـ KPIs",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "المبيعات والعملاء",
      items: [
        {
          name: "إدارة العملاء و Meta CRM",
          href: "/dashboard/crm",
          icon: Users2,
          badge: "12 جديد",
          badgeType: "emerald",
        },
        {
          name: "نقاط البيع والعقود (POS)",
          href: "/dashboard/pos",
          icon: FileSpreadsheet,
        },
        {
          name: "زيارات الصالة والمواعيد",
          href: "/dashboard/visits",
          icon: CalendarCheck,
          badge: "9 اليوم",
          badgeType: "blue",
        },
      ],
    },
    {
      title: "المخزون والمستودعات",
      items: [
        {
          name: "لوحة تحكم المخزون",
          href: "/dashboard/inventory",
          icon: LayoutDashboard,
          badge: "AI",
          badgeType: "purple",
        },
        {
          name: "دليل الأصناف والمخزون",
          href: "/dashboard/inventory/products",
          icon: Package,
        },
        {
          name: "أوامر التحويل بين الفروع",
          href: "/dashboard/inventory/transfers",
          icon: ArrowRightLeft,
          badge: "3 نشط",
          badgeType: "blue",
        },
        {
          name: "أذون الاستلام والتوريدات",
          href: "/dashboard/inventory/receiving",
          icon: ArrowDownLeft,
          badge: "1 وارد",
          badgeType: "emerald",
        },
        {
          name: "حجوزات العقود والعملاء",
          href: "/dashboard/inventory/reservations",
          icon: ShieldCheck,
        },
        {
          name: "الجرد الدوري والتسويات",
          href: "/dashboard/inventory/stock-count",
          icon: FileCheck,
        },
        {
          name: "دفتر حركات المخزون",
          href: "/dashboard/inventory/movements",
          icon: History,
        },
      ],
    },
    {
      title: "المشتريات والموردين",
      items: [
        {
          name: "لوحة تحكم المشتريات",
          href: "/dashboard/purchasing",
          icon: LayoutDashboard,
          badge: "AI",
          badgeType: "purple",
        },
        {
          name: "تخطيط الاحتياجات والتنبؤ",
          href: "/dashboard/purchasing/planning",
          icon: Sparkles,
          badge: "نواقص",
          badgeType: "amber",
        },
        {
          name: "طلبات الشراء (PR)",
          href: "/dashboard/purchasing/requests",
          icon: ShoppingCart,
          badge: "2 جديد",
          badgeType: "emerald",
        },
        {
          name: "أوامر الشراء والتوريد (PO)",
          href: "/dashboard/purchasing/orders",
          icon: ShoppingBag,
          badge: "1 معلق",
          badgeType: "rose",
        },
        {
          name: "أذون الاستلام وفحص الجودة",
          href: "/dashboard/purchasing/receiving",
          icon: ArrowDownLeft,
        },
        {
          name: "فواتير الموردين والمطابقة",
          href: "/dashboard/purchasing/invoices",
          icon: Scale,
          badge: "3-Way",
          badgeType: "blue",
        },
        {
          name: "مرتجعات الموردين",
          href: "/dashboard/purchasing/returns",
          icon: RotateCcw,
        },
        {
          name: "دليل الموردين والتقييم",
          href: "/dashboard/purchasing/suppliers",
          icon: Building,
        },
        {
          name: "تحليلات وتكاليف الشراء",
          href: "/dashboard/purchasing/reports",
          icon: BarChart3,
        },
        {
          name: "المساعد الذكي للمشتريات",
          href: "/dashboard/purchasing/assistant",
          icon: Bot,
          badge: "AI",
          badgeType: "purple",
        },
        {
          name: "إعدادات واعتماد المشتريات",
          href: "/dashboard/purchasing/settings",
          icon: Settings,
        },
      ],
    },
    {
      title: "الشحن واللوجستيات",
      items: [
        {
          name: "لوحة تحكم الشحن",
          href: "/dashboard/logistics",
          icon: LayoutDashboard,
          badge: "AI",
          badgeType: "purple",
        },
        {
          name: "أوامر الشحنات والتسليم",
          href: "/dashboard/logistics/orders",
          icon: Truck,
          badge: "7 شحن",
          badgeType: "blue",
        },
        {
          name: "الجدولة وتخطيط المسارات",
          href: "/dashboard/logistics/schedule",
          icon: CalendarCheck,
        },
        {
          name: "أسطول السائقين والسيارات",
          href: "/dashboard/logistics/fleet",
          icon: Users2,
        },
        {
          name: "بلاغات ومشاكل التسليم",
          href: "/dashboard/logistics/issues",
          icon: AlertTriangle,
          badge: "2 نشط",
          badgeType: "rose",
        },
        {
          name: "مرتجعات ما بعد التسليم",
          href: "/dashboard/logistics/returns",
          icon: History,
        },
        {
          name: "تقارير الأداء ومعدل المواعيد",
          href: "/dashboard/logistics/reports",
          icon: FileCheck,
        },
        {
          name: "المساعد اللوجستي الذكي",
          href: "/dashboard/logistics/assistant",
          icon: Sparkles,
          badge: "AI",
          badgeType: "purple",
        },
      ],
    },
    {
      title: "المالية والمحاسبة",
      items: [
        {
          name: "لوحة التحكم والتحليلات",
          href: "/dashboard/finance",
          icon: LayoutDashboard,
          badge: "محرك",
          badgeType: "gold",
        },
        {
          name: "الفواتير ومنظومة الضرائب ETA",
          href: "/dashboard/finance/invoices",
          icon: FileCheck,
          badge: "ETA",
          badgeType: "emerald",
        },
        {
          name: "حسابات العملاء والأقساط",
          href: "/dashboard/finance/receivables",
          icon: Users2,
          badge: "متأخرات",
          badgeType: "rose",
        },
        {
          name: "الخزائن والبنوك والتحويلات",
          href: "/dashboard/finance/treasury",
          icon: Wallet,
        },
        {
          name: "المصروفات ومراكز التكلفة",
          href: "/dashboard/finance/expenses",
          icon: BadgePercent,
        },
        {
          name: "الموردين والمدفوعات",
          href: "/dashboard/finance/suppliers",
          icon: Coins,
        },
        {
          name: "قيود اليومية ودليل الحسابات",
          href: "/dashboard/finance/journal",
          icon: History,
        },
        {
          name: "القوائم المالية والتقارير",
          href: "/dashboard/finance/reports",
          icon: FileSpreadsheet,
          badge: "P&L",
          badgeType: "blue",
        },
      ],
    },
    {
      title: "الموارد البشرية والرواتب",
      items: [
        {
          name: "لوحة تحكم HR والرواتب",
          href: "/dashboard/hr",
          icon: LayoutDashboard,
        },
        {
          name: "دليل الموظفين وشؤون العاملين",
          href: "/dashboard/hr/employees",
          icon: Users2,
        },
        {
          name: "الهيكل والأقسام والوظائف",
          href: "/dashboard/hr/departments",
          icon: Building,
        },
        {
          name: "عقود العمل وفترات الاختبار",
          href: "/dashboard/hr/contracts",
          icon: FileCheck,
          badge: "تنبيه",
          badgeType: "amber",
        },
        {
          name: "دفتر الحضور والانصراف",
          href: "/dashboard/hr/attendance",
          icon: CalendarCheck,
          badge: "بصمة",
          badgeType: "slate",
        },
        {
          name: "مواعيد وجداول العمل",
          href: "/dashboard/hr/schedules",
          icon: History,
        },
        {
          name: "طلبات الإجازات والأرصدة",
          href: "/dashboard/hr/leaves",
          icon: Plane,
        },
        {
          name: "سلف الموظفين والأقساط",
          href: "/dashboard/hr/advances",
          icon: HandCoins,
        },
        {
          name: "مسيرات الرواتب (Payroll)",
          href: "/dashboard/hr/payroll",
          icon: Banknote,
          badge: "شهري",
          badgeType: "emerald",
        },
        {
          name: "مخالصات نهاية الخدمة",
          href: "/dashboard/hr/settlements",
          icon: UserCheck,
        },
        {
          name: "تقارير الرواتب والتكلفة",
          href: "/dashboard/hr/reports",
          icon: FileSpreadsheet,
        },
        {
          name: "بوابة الموظف الذاتية",
          href: "/dashboard/hr/portal",
          icon: Sparkles,
          badge: "Self",
          badgeType: "blue",
        },
        {
          name: "إعدادات الضرائب والتأمينات",
          href: "/dashboard/hr/settings",
          icon: Settings,
        },
      ],
    },
    {
      title: "المتاجر والربط الخارجي",
      items: [
        {
          name: "استعراض مواقع المعارض",
          href: "/demos",
          icon: Globe,
          badge: "3 قوالب",
          badgeType: "gold",
          external: true,
        },
        {
          name: "إعدادات المنظومة",
          href: "/dashboard/settings",
          icon: Settings,
        },
      ],
    },
  ];

  const getBadgeStyle = (type?: string, isActive?: boolean) => {
    if (isActive) {
      return "bg-slate-950 text-rewaq-gold border border-rewaq-gold/40 shadow-xs";
    }
    switch (type) {
      case "gold":
        return "bg-amber-950/60 text-amber-300 border border-amber-500/30";
      case "emerald":
        return "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30";
      case "blue":
        return "bg-blue-950/60 text-blue-300 border border-blue-500/30";
      case "purple":
        return "bg-purple-950/60 text-purple-300 border border-purple-500/30";
      case "amber":
        return "bg-amber-950/60 text-amber-300 border border-amber-500/30";
      case "rose":
        return "bg-rose-950/60 text-rose-300 border border-rose-500/30";
      case "slate":
      default:
        return "bg-slate-800/80 text-slate-300 border border-slate-700/50";
    }
  };

  return (
    <ShowroomProvider>
      <FinanceProvider>
        <PurchasingProvider>
          <HRProvider>
            <div className="h-screen w-screen overflow-hidden bg-slate-100 flex selection:bg-rewaq-gold selection:text-slate-950" dir="rtl">
        
        {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* 1. Fixed Pinned Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 right-0 z-50 h-screen w-72 shrink-0 bg-[#0c1320] text-slate-200 flex flex-col justify-between border-l border-slate-800/80 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Brand Header (Static inside sidebar) */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-[#090f19]">
          <Logo size="md" href="/dashboard" />
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="إغلاق القائمة الجانبية"
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Branch Switcher (Static inside sidebar) */}
        <div className="p-3 shrink-0 bg-[#0c1320] border-b border-slate-800/50">
          <div className="bg-[#131b2c] border border-slate-800/90 rounded-2xl p-2.5 shadow-sm">
            <div className="flex items-center justify-between mb-1.5 text-[10px] text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Store className="w-3.5 h-3.5 text-rewaq-gold shrink-0" />
                <span>الفرع النشط حالياً:</span>
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>متصل</span>
              </span>
            </div>
            <div className="relative">
              <select
                value={activeBranch}
                onChange={(e) => setActiveBranch(e.target.value)}
                aria-label="الفرع النشط حالياً"
                className="w-full bg-[#090f19] border border-slate-700/60 rounded-xl px-2.5 py-2 text-xs text-white font-bold focus:outline-none focus:border-rewaq-gold cursor-pointer appearance-none pr-2 pl-7 truncate"
              >
                <option value="branch-cairo" className="bg-[#0c1320] text-white">فرع التجمع الخامس (الرئيسي)</option>
                <option value="branch-october" className="bg-[#0c1320] text-white">فرع الشيخ زايد (الأثاث الحديث)</option>
                <option value="branch-lighting" className="bg-[#0c1320] text-white">فرع مصر الجديدة (الإضاءة والديكور)</option>
                <option value="branch-damietta" className="bg-[#0c1320] text-white">مستودع ومصنع دمياط المركزي</option>
                <option value="all-branches" className="bg-[#0c1320] text-white">كل الفروع مجمعة (الإدارة العامة)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Navigation Links (Independent Internal Scroll with custom styling) */}
        <nav className="p-3 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {navigationGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              <div className="flex items-center justify-between px-2.5 py-1">
                <p className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                  {group.title}
                </p>
                <span className="text-[9px] text-slate-400 font-mono">
                  {group.items.length}
                </span>
              </div>
              <ul className="space-y-0.5">
                {group.items.map((item, itemIdx) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href === "/dashboard/finance/receivables" && pathname.startsWith("/dashboard/finance/installments")) ||
                    (item.href === "/dashboard/finance/invoices" && pathname.startsWith("/dashboard/finance/taxes")) ||
                    (item.href === "/dashboard/finance/journal" && pathname.startsWith("/dashboard/finance/accounts"));
                  const Icon = item.icon;
                  return (
                    <li key={itemIdx}>
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 ${
                          isActive
                            ? "bg-gradient-to-r from-rewaq-gold to-rewaq-gold-dark text-slate-950 font-black shadow-md shadow-rewaq-gold/20"
                            : "text-slate-300 hover:bg-[#141e30] hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? "text-slate-950" : "text-slate-400 group-hover:text-rewaq-gold"
                          }`} />
                          <span className="truncate whitespace-nowrap font-medium text-[11.5px] leading-tight">
                            {item.name}
                          </span>
                        </div>
                        {item.badge && (
                          <span
                            className={`shrink-0 text-[9px] leading-none px-2 py-1 rounded-full font-bold whitespace-nowrap ml-1 transition-all ${getBadgeStyle(
                              item.badgeType,
                              isActive
                            )}`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {item.external && (
                          <ArrowUpRight className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                            isActive ? "text-slate-950" : "text-slate-400 group-hover:text-slate-200"
                          }`} />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Bottom Profile (Static at bottom of sidebar) */}
        <div className="p-3 border-t border-slate-800/80 bg-[#090f19] shrink-0">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#131b2c] border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-rewaq-gold/15 border border-rewaq-gold/30 text-rewaq-gold flex items-center justify-center font-bold text-xs shrink-0">
                أ.س
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">أحمد سمير</p>
                <p className="text-[10px] text-slate-400 truncate">المدير العام / Owner</p>
              </div>
            </div>
            <Link
              href="/"
              title="تسجيل الخروج"
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* 2. Main Scrollable Content Area */}
      <div className="flex-1 h-screen overflow-y-auto flex flex-col min-w-0">
        
        {/* Top Header (Sticky on scroll) */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between gap-4 shadow-2xs shrink-0">
          {/* Left: Mobile Menu & Global Search */}
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="فتح القائمة الجانبية"
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Bar (Ctrl + K) */}
            <div className="relative w-full">
              <input
                type="text"
                placeholder="ابحث في رِواق عن عميل، عقد، كود صنف، أو شحنة... (Ctrl + K)"
                className="w-full bg-slate-100/90 border border-slate-200 rounded-xl px-4 py-2 pr-9 pl-14 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rewaq-gold focus:bg-white transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <kbd className="hidden sm:inline-block absolute left-2.5 top-2 text-[10px] bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded shadow-2xs font-mono">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right: Live Vault Status, Quick Action & Notifications */}
          <div className="flex items-center gap-2.5">
            
            {/* Quick Cash in Vault Pill */}
            <div className="hidden md:flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-xl text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-slate-600 font-medium text-[11px]">خزينة الفرع كاش:</span>
              <span className="font-bold text-emerald-800 font-mono">148,500 ج.م</span>
            </div>

            {/* Quick Action: New Contract Button */}
            <button
              type="button"
              className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">تسجيل تعاقد / عربون</span>
            </button>

            {/* Notifications Center */}
            <div className="relative">
              <button
                type="button"
                aria-label="مركز التنبيهات"
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 relative transition"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
          </HRProvider>
        </PurchasingProvider>
      </FinanceProvider>
    </ShowroomProvider>
  );
}
