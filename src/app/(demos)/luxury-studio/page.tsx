import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function LuxuryStudioDemoPlaceholder() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-6 shadow-xl shadow-purple-600/20">
        <Sparkles className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">ديمو 3: الاستوديو الفاخر والتصميم الداخلي (Grand Living)</h1>
      <p className="text-stone-400 max-w-md mb-8 text-sm">
        تم تجهيز المسار البرمجي لقالب البيزنس الفاخر وشركات التشطيبات والتصميم الداخلي.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-stone-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-stone-700 transition"
      >
        <ArrowRight className="w-4 h-4" />
        <span>العودة للبوابة الرئيسية</span>
      </Link>
    </div>
  );
}
