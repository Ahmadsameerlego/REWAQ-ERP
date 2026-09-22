import Link from "next/link";
import { ArrowRight, FileQuestion } from "lucide-react";
import Logo from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-rewaq-dark text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <Logo size="md" href="/" className="mb-8" />
      <div className="w-16 h-16 rounded-2xl bg-rewaq-card text-rewaq-gold flex items-center justify-center mb-4 border border-slate-800">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">الصفحة غير موجودة (404)</h1>
      <p className="text-slate-400 max-w-sm mb-6 text-xs">
        عذراً، الرابط الذي تحاول الوصول إليه غير متوفر في منظومة رِواق.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-rewaq-gold text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl hover:bg-rewaq-gold-dark transition"
      >
        <ArrowRight className="w-4 h-4" />
        <span>العودة للبوابة الرئيسية</span>
      </Link>
    </div>
  );
}
