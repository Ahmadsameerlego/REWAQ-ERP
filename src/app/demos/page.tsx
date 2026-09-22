import Link from "next/link";
import { 
  LayoutDashboard, 
  Sofa, 
  Lamp, 
  Sparkles, 
  ArrowLeft, 
  ShieldCheck, 
  Layers, 
  LogIn
} from "lucide-react";
import Logo from "@/components/brand/Logo";

export const metadata = {
  title: "بوابة المعاينات والديمو | رِواق ERP",
  description: "استعرض لوحة تحكم رِواق ERP وقوالب مواقع المعارض المتكاملة (أثاث، إضاءة، وديكور فاخر)",
};

export default function DemosPortalPage() {
  return (
    <main className="min-h-screen bg-rewaq-dark text-slate-100 selection:bg-rewaq-gold selection:text-slate-950 flex flex-col justify-between p-6 md:p-12 relative overflow-hidden">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-rewaq-emerald/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-rewaq-gold/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between border-b border-slate-800/80 pb-6 relative z-10">
        <Logo size="lg" href="/" />

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-rewaq-gold to-rewaq-gold-light hover:brightness-110 px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-rewaq-gold/10"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>تسجيل الدخول للمنظومة</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-rewaq-card px-3.5 py-2 rounded-xl border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-rewaq-emerald" />
            <span>بوابة المعاينات المباشرة</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <section className="max-w-6xl mx-auto w-full my-auto py-12 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rewaq-gold/10 border border-rewaq-gold/30 text-rewaq-gold text-xs font-bold mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>منظومة صالات العرض والمعارض الذكية</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
            بوابة معاينة منظومة <span className="text-rewaq-gold font-serif">رِواق</span> المتكاملة
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            لوحة تحكم مركزية للـ ERP & CRM مع 3 قوالب مواقع إلكترونية مخصصة لتغطية كافة تخصصات معارض الأثاث والإضاءة والديكور.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Main ERP & CRM Dashboard */}
          <Link
            href="/dashboard"
            className="group relative bg-gradient-to-b from-rewaq-card to-rewaq-dark border-2 border-rewaq-gold/50 hover:border-rewaq-gold rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-rewaq-gold/15 flex flex-col justify-between"
          >
            <div className="absolute top-3 left-3 bg-rewaq-gold/20 text-rewaq-gold text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-rewaq-gold/30">
              الأساس الإداري
            </div>
            <div>
              <div className="w-14 h-14 rounded-2xl bg-rewaq-gold/10 border border-rewaq-gold/30 flex items-center justify-center text-rewaq-gold mb-5 group-hover:scale-105 transition-transform">
                <LayoutDashboard className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2 group-hover:text-rewaq-gold transition-colors">
                لوحة التحكم المركزية (ERP)
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                إدارة العملاء CRM، ربط إعلانات Meta، مسار المبيعات، حجوزات العرابين والبواقي، الشحن والتركيبات، والمخازن المتعددة.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-rewaq-gold">
              <span>دخول لوحة الإدارة</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Demo 1 - Furniture Showroom */}
          <Link
            href="/furniture"
            className="group relative bg-gradient-to-b from-rewaq-card to-rewaq-dark border border-slate-800 hover:border-blue-500/50 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 flex flex-col justify-between"
          >
            <div className="absolute top-3 left-3 bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-500/20">
              ديمو 1
            </div>
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-105 transition-transform">
                <Sofa className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                معرض الأثاث (Modern Living)
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                موقع متكامل لغرف النوم، السفرة، الصالونات والركنات المودرن والكلاسيك مع فلترة المقاسات والألوان.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
              <span>معاينة موقع الأثاث</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Demo 2 - Lighting & Decor */}
          <Link
            href="/lighting"
            className="group relative bg-gradient-to-b from-rewaq-card to-rewaq-dark border border-slate-800 hover:border-amber-500/50 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between"
          >
            <div className="absolute top-3 left-3 bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/20">
              ديمو 2
            </div>
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-105 transition-transform">
                <Lamp className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                معرض الإضاءة والديكور (Lumière)
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                مخصص للنجف الفاخر، وحدات الإضاءة الذكية، الأباليك، والتحف الديكورية مع كشف درجات حرارة الضوء (Warm/Cool).
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <span>معاينة موقع الإضاءة</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Demo 3 - Universal Luxury & Interior Business */}
          <Link
            href="/luxury-studio"
            className="group relative bg-gradient-to-b from-rewaq-card to-rewaq-dark border border-slate-800 hover:border-rewaq-emerald/50 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-rewaq-emerald/5 flex flex-col justify-between"
          >
            <div className="absolute top-3 left-3 bg-rewaq-emerald/20 text-rewaq-emerald-light text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-rewaq-emerald/30">
              ديمو 3
            </div>
            <div>
              <div className="w-14 h-14 rounded-2xl bg-rewaq-emerald/10 border border-rewaq-emerald/20 flex items-center justify-center text-rewaq-emerald-light mb-5 group-hover:scale-105 transition-transform">
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2 group-hover:text-rewaq-emerald-light transition-colors">
                الاستوديو الفاخر والتصميم الداخلي
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                قالب عام وشامل يناسب كبرى شركات التشطيبات، الأثاث الراقي، والتصميم الداخلي لأي بيزنس فاخر.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-rewaq-emerald-light">
              <span>معاينة الاستوديو الفاخر</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 relative z-10">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-rewaq-gold" />
          <span>Rewaq ERP — Multi-Branch Showroom Ecosystem</span>
        </div>
        <div>
          <span>الدومين الرسمي المعتمد: </span>
          <code className="text-rewaq-gold bg-rewaq-card px-2.5 py-1 rounded-lg border border-slate-800 font-mono font-bold">
            rewaqerp.com
          </code>
        </div>
      </footer>
    </main>
  );
}
