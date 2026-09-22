import Link from "next/link";
import { ArrowRight, Lamp } from "lucide-react";

export default function LightingDemoPlaceholder() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mb-6 shadow-xl shadow-amber-500/20">
        <Lamp className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">ديمو 2: معرض الإضاءة والديكور الفاخر (Lumière)</h1>
      <p className="text-slate-400 max-w-md mb-8 text-sm">
        تم تجهيز المسار البرمجي لقالب النجف ووحدات الإضاءة والديكور.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-emerald-500 transition"
      >
        <ArrowRight className="w-4 h-4" />
        <span>العودة للبوابة الرئيسية</span>
      </Link>
    </div>
  );
}
