"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Lock, 
  Mail, 
  Phone, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Store,
  ChevronDown,
  Eye,
  EyeOff,
  LayoutDashboard,
  Layers,
  Zap,
  TrendingUp,
  Shield,
  Smartphone,
  MessageCircle,
  Clock,
  UserCheck
} from "lucide-react";
import Logo from "@/components/brand/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>("owner");
  const [selectedBranch, setSelectedBranch] = useState<string>("branch-cairo");
  const [emailOrPhone, setEmailOrPhone] = useState<string>("owner@rewaqerp.com");
  const [password, setPassword] = useState<string>("••••••••••••");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const demoRoles = [
    {
      id: "owner",
      title: "المدير العام / المالك",
      englishTitle: "CEO & Business Owner",
      email: "owner@rewaqerp.com",
      description: "صلاحيات شاملة: تقارير الأرباح، الـ ROAS الإعلاني، مراقبة الخزائن، وربط كافة الفروع",
      badge: "الإدارة العليا",
      color: "from-rewaq-gold/20 to-amber-500/10 border-rewaq-gold/50 text-rewaq-gold",
      accent: "bg-rewaq-gold text-slate-950",
    },
    {
      id: "manager",
      title: "مدير صالة العرض",
      englishTitle: "Showroom Manager",
      email: "manager.cairo@rewaqerp.com",
      description: "إدارة الصالة، إشراف فريق البيع، اعتماد الخصومات الاستثنائية، وتقفيل العهدة اليومية",
      badge: "إدارة الصالة",
      color: "from-blue-500/20 to-cyan-500/10 border-blue-500/40 text-blue-400",
      accent: "bg-blue-500 text-white",
    },
    {
      id: "sales",
      title: "مسؤول المبيعات",
      englishTitle: "Sales & Interior Advisor",
      email: "sales.team@rewaqerp.com",
      description: "تسجيل العقود بالصالة، تابلت الكتالوج الرقمي، حجز العرابين، ومتابعة عمولات البيع",
      badge: "المبيعات والتابلت",
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400",
      accent: "bg-emerald-500 text-white",
    },
    {
      id: "accountant",
      title: "المدير المالي والخزينة",
      englishTitle: "CFO & Chief Accountant",
      email: "finance@rewaqerp.com",
      description: "التحصيلات، تسوية البواقي مع السائقين، الخزائن، مطابقة البنوك، وحسابات الموردين",
      badge: "المالية والخزينة",
      color: "from-purple-500/20 to-indigo-500/10 border-purple-500/40 text-purple-400",
      accent: "bg-purple-500 text-white",
    },
  ];

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    const role = demoRoles.find((r) => r.id === roleId);
    if (role) {
      setEmailOrPhone(role.email);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 600);
  };

  const handleQuickDemoClick = (roleId: string) => {
    handleRoleSelect(roleId);
    setIsLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#080d17] text-slate-100 flex flex-col justify-between selection:bg-rewaq-gold selection:text-slate-950 relative overflow-x-hidden">
      
      {/* Background Ambient Luxury Glows */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-rewaq-gold/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse duration-1000"></div>
      <div className="fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-rewaq-emerald/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f293d0a_1px,transparent_1px),linear-gradient(to_bottom,#1f293d0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none -z-10"></div>

      {/* Top Corporate Navigation Bar */}
      <header className="max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-30 bg-[#080d17]/80">
        <Logo size="lg" href="/" />

        <div className="flex items-center gap-3 md:gap-4">
          {/* Live System Status Pill */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 -mr-3.5"></span>
            <span>الخوادم السحابية: متصلة وآمنة 99.98%</span>
          </div>

          {/* Demos Portal Link */}
          <Link
            href="/demos"
            className="flex items-center gap-2 text-xs font-bold text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <Layers className="w-4 h-4 text-rewaq-gold" />
            <span className="hidden sm:inline">استعراض مواقع المعارض</span>
            <span className="sm:hidden">المواقع</span>
          </Link>

          {/* Contact Support Hotline */}
          <a
            href="https://wa.me/201013746111"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 text-xs font-bold text-rewaq-gold hover:text-rewaq-gold-light bg-rewaq-gold/10 hover:bg-rewaq-gold/20 border border-rewaq-gold/30 px-3.5 py-2.5 rounded-xl transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>01013746111</span>
          </a>
        </div>
      </header>

      {/* Main Login Workspace */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 lg:p-12 relative z-10">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Right Column: Executive Login Terminal (7 cols) */}
          <div className="lg:col-span-7 bg-gradient-to-b from-[#121a2a]/95 to-[#0b121e]/95 border border-slate-800/90 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl shadow-black/60 flex flex-col justify-between backdrop-blur-2xl relative">
            
            {/* Ambient Card Glow */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-rewaq-gold/10 rounded-full blur-2xl pointer-events-none"></div>

            <div>
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-slate-800/80">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rewaq-gold animate-pulse"></div>
                    <span className="text-[11px] font-bold text-rewaq-gold uppercase tracking-wider">
                      منصة الدخول الموحدة | Single Sign-On
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    تسجيل الدخول للمنظومة
                  </h1>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rewaq-emerald/10 border border-rewaq-emerald/30 text-rewaq-emerald-light text-xs font-bold self-start sm:self-center">
                  <ShieldCheck className="w-4 h-4 text-rewaq-emerald" />
                  <span>دخول تفاعلي تجريبي</span>
                </div>
              </div>

              {/* Quick Role Selection (4 Interactive Cards) */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-rewaq-gold" />
                    <span>اختر الحساب والدور الوظيفي للتجربة:</span>
                  </label>
                  <span className="text-[11px] text-slate-400">انقر للتبديل الفوري</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {demoRoles.map((role) => {
                    const isSelected = selectedRole === role.id;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleRoleSelect(role.id)}
                        className={`text-right p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between relative cursor-pointer group ${
                          isSelected
                            ? "bg-gradient-to-br from-rewaq-gold/15 via-[#1a253a] to-[#121c2d] border-rewaq-gold text-white shadow-lg shadow-rewaq-gold/10 ring-1 ring-rewaq-gold/40"
                            : "bg-[#0c1422]/90 border-slate-800/90 text-slate-400 hover:border-slate-700 hover:bg-[#101b2e] hover:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <span className={`text-xs font-black transition-colors ${
                            isSelected ? "text-rewaq-gold" : "text-white group-hover:text-slate-100"
                          }`}>
                            {role.title}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold tracking-tight ${
                            isSelected 
                              ? "bg-rewaq-gold text-slate-950 font-black shadow-sm" 
                              : "bg-slate-800 text-slate-400"
                          }`}>
                            {role.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">
                          {role.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                
                {/* Branch Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    الفرع أو المعرض النشط
                  </label>
                  <div className="relative">
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      aria-label="الفرع النشط"
                      className="w-full bg-[#0a101b] border border-slate-700/80 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-rewaq-gold focus:ring-1 focus:ring-rewaq-gold transition appearance-none cursor-pointer pr-10"
                    >
                      <option value="branch-cairo">صالة عرض التجمع الخامس (المعرض الرئيسي & VIP Studio)</option>
                      <option value="branch-october">صالة عرض الشيخ زايد (معرض الأثاث والديكور العصري)</option>
                      <option value="branch-lighting">صالة عرض مصر الجديدة (Lumière للإضاءة والتحف)</option>
                      <option value="branch-damietta">مستودع ومصنع دمياط المركزي (المخازن والتوريدات)</option>
                      <option value="all-branches">كل الفروع مجمعة (عرض تحليلي موحد للإدارة العليا)</option>
                    </select>
                    <Store className="w-4 h-4 text-rewaq-gold absolute right-3.5 top-3.5 pointer-events-none" />
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Email / Phone & Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      البريد الإلكتروني / اسم المستخدم
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        placeholder="user@rewaqerp.com"
                        className="w-full bg-[#0a101b] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rewaq-gold focus:ring-1 focus:ring-rewaq-gold transition pr-9 font-mono"
                        required
                      />
                      <Mail className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-[#0a101b] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rewaq-gold focus:ring-1 focus:ring-rewaq-gold transition pr-9 pl-9 font-mono"
                        required
                      />
                      <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                        className="absolute left-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-xs pt-1 pb-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-rewaq-gold focus:ring-rewaq-gold accent-rewaq-gold cursor-pointer"
                    />
                    <span>تذكر بيانات هذا الجهاز</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => alert("في النسخة التجريبية يمكنك الدخول فوراً عبر النقر على زر الدخول أدناه.")}
                    className="text-xs text-rewaq-gold hover:underline hover:text-rewaq-gold-light"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-rewaq-gold via-[#d4b068] to-rewaq-gold-dark hover:brightness-110 text-slate-950 font-black py-3.5 px-6 rounded-xl text-sm transition-all duration-200 shadow-xl shadow-rewaq-gold/20 flex items-center justify-center gap-2 cursor-pointer group active:scale-[0.99]"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2.5">
                      <span className="inline-block w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin"></span>
                      <span>جاري التحقق والدخول إلى المنظومة...</span>
                    </div>
                  ) : (
                    <>
                      <span>دخول لوحة التحكم المركزية (ERP & CRM)</span>
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick 1-Click Demo Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span className="font-semibold">دخول سريع بنقرة واحدة للعروض التقديمية:</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoClick("owner")}
                    className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-rewaq-gold/10 hover:bg-rewaq-gold/20 text-rewaq-gold border border-rewaq-gold/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3 h-3" />
                    <span>دخول فوري: المدير العام</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoClick("manager")}
                    className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>دخول: مدير الصالة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoClick("sales")}
                    className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>دخول: المبيعات</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoClick("accountant")}
                    className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>دخول: المحاسب</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Security Credentials Bar */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-rewaq-emerald" />
                تشفير آمن للبيانات 256-Bit SSL | متوافق مع الفاتورة الإلكترونية
              </span>
              <span className="font-mono text-rewaq-gold font-bold">rewaqerp.com</span>
            </div>
          </div>

          {/* Left Column: Enterprise Highlights & Trust Showcase (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#111928]/80 to-[#0a101b]/90 border border-slate-800/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden backdrop-blur-xl">
            
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-rewaq-emerald/10 rounded-full blur-2xl pointer-events-none"></div>

            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rewaq-gold/10 border border-rewaq-gold/30 text-rewaq-gold text-xs font-bold mb-5">
                <Sparkles className="w-3.5 h-3.5 text-rewaq-gold" />
                <span>المنظومة الأولى لقطاع الأثاث والديكور</span>
              </div>

              {/* Title & Pitch */}
              <h2 className="text-xl sm:text-2xl font-black text-white mb-3 leading-snug">
                كل عمليات معرضك تحت سقف منظومة <span className="text-rewaq-gold font-serif">رِواق</span>
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                نظام ERP وسحابي متكامل يربط بين إعلانات السوشيال ميديا، صالات العرض، المبيعات والعرابين، وسيارات الشحن والتركيبات.
              </p>

              {/* 4 Feature Items */}
              <div className="space-y-3.5">
                {[
                  {
                    title: "ربط إعلانات Meta و Conversions API",
                    desc: "معرفة مبيعات الصالة الناتجة عن كل حملة إعلانية بدقة ROAS بالجنيه.",
                    icon: TrendingUp,
                    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                  },
                  {
                    title: "إدارة العرابين وبواقي الاستلام (COD)",
                    desc: "تتبع دفعات الحجز، مواعيد التسليم، وتقفيل الكاش فوراً مع السائقين.",
                    icon: CheckCircle2,
                    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                  },
                  {
                    title: "فصل عينات الصالة عن بضاعة المستودع",
                    desc: "تمييز القطع المعروضة بالصالة عن المخزون الجاهز لمنع البيع المزدوج.",
                    icon: Store,
                    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                  },
                  {
                    title: "فواتير الواتساب الآلية وعقود البيع",
                    desc: "إرسال عقود البيع PDF وإشعارات الشحن والتركيب للعميل بنقرة واحدة.",
                    icon: MessageCircle,
                    color: "text-rewaq-gold bg-rewaq-gold/10 border-rewaq-gold/20",
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3 p-2.5 rounded-2xl bg-[#090f1a]/60 border border-slate-800/60 hover:border-slate-700/80 transition-all">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-200">{item.title}</h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Support & Contact Card */}
            <div className="mt-6 pt-5 border-t border-slate-800/80">
              <div className="p-4 rounded-2xl bg-[#080d18] border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rewaq-gold/15 border border-rewaq-gold/30 flex items-center justify-center text-rewaq-gold font-bold">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">المبيعات والدعم الفني</p>
                      <p className="text-[10px] text-slate-400">متاحون للرد وتخصيص النظام لمعرضك</p>
                    </div>
                  </div>
                  <a
                    href="https://wa.me/201013746111"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>واتساب</span>
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono font-bold text-center">
                  <a
                    href="tel:01013746111"
                    className="py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-800 text-rewaq-gold hover:border-rewaq-gold/50 transition-colors"
                  >
                    01013746111
                  </a>
                  <a
                    href="tel:+201018137969"
                    className="py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-800 text-rewaq-gold hover:border-rewaq-gold/50 transition-colors"
                  >
                    +20 10 18137969
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Global Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 relative z-10">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-rewaq-gold" />
          <span>منظومة رِواق ERP السحابية — إدارة صالات العرض والمعارض المتعددة</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <Link href="/demos" className="text-slate-400 hover:text-rewaq-gold transition-colors">
            بوابة المعاينات والديمو
          </Link>
          <span>•</span>
          <Link href="/dashboard" className="text-slate-400 hover:text-rewaq-gold transition-colors">
            لوحة الإدارة
          </Link>
          <span>•</span>
          <span className="font-mono text-rewaq-gold">v2.4 Enterprise</span>
        </div>
      </footer>
    </div>
  );
}
