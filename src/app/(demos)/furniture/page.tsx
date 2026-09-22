import Link from "next/link";
import { ArrowRight, Sofa } from "lucide-react";

export default function FurnitureDemoPlaceholder() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-xl shadow-blue-600/20">
        <Sofa className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">ديمو 1: متجر ومعرض الأثاث الحديث (Modern Living)</h1>
      <p className="text-slate-600 max-w-md mb-8 text-sm">
        تم تجهيز المسار البرمجي لقالب الأثاث والمفروشات.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-800 transition"
      >
        <ArrowRight className="w-4 h-4" />
        <span>العودة للبوابة الرئيسية</span>
      </Link>
    </div>
  );
}
