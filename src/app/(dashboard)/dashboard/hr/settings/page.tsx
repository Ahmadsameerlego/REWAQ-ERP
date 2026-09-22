"use client";

import React, { useState } from "react";
import { Settings, ShieldCheck, Save, Calculator, Clock, Layers, CheckCircle2 } from "lucide-react";
import HrNav from "@/components/hr/HrNav";
import { useHR } from "@/context/HRContext";
import { formatEGP } from "@/lib/hrEngine";

export default function HrSettingsPage() {
  const { settings, updateSettings } = useHR();

  const [formSettings, setFormSettings] = useState(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings, "أحمد سمير");
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <HrNav />

      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-rewaq-gold" />
            <span>إعدادات الموارد البشرية والروائب والامتثال المصري (HR & Compliance Settings)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            تخصيص شرائح ضريبة كسب العمل، حدود التأمينات الاجتماعية، وقواعد الحضور وربط الحسابات
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>حفظ التعديلات في المنظومة</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>تم حفظ وتحديث إعدادات الضرائب والتأمينات بنجاح وسريانها على كافة المسيرات القادمة.</span>
        </div>
      )}

      {/* Form Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: Egyptian Income Tax Brackets */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Calculator className="w-4 h-4 text-rewaq-gold" />
            <h3 className="font-bold text-sm text-slate-900">ضريبة كسب العمل المصرية (قانون 30 لسنة 2023 وتحديثاته)</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">حد الإعفاء الشخصي السنوي (ج.م)</label>
              <input
                type="number"
                value={formSettings.personalExemptionAnnual}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, personalExemptionAnnual: Number(e.target.value) })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                القيمة القانونية الحالية: 20,000 ج.م سنوياً (تخصم من وعاء الضريبة السنوي قبل تطبيق الشرائح)
              </span>
            </div>

            {/* Brackets Summary */}
            <div className="space-y-2 pt-2">
              <span className="font-bold text-slate-800 block">شرائح الدخل التصاعدية:</span>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {formSettings.taxBrackets.map((tb, idx) => (
                  <div key={tb.id} className="p-2.5 flex items-center justify-between text-[11px] bg-slate-50/50">
                    <span className="font-bold text-slate-800">{tb.name}</span>
                    <span className="font-mono text-slate-600">
                      من {formatEGP(tb.fromAmount)} إلى {tb.toAmount > 9999999 ? "ما زاد" : formatEGP(tb.toAmount)}
                    </span>
                    <span className="font-mono font-black text-emerald-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {(tb.rate * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Box 2: Egyptian Social Insurance */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">التأمينات الاجتماعية المصرية (قانون 148 لسنة 2019)</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">الحد الأدنى للأجر التأميني (ج.م)</label>
                <input
                  type="number"
                  value={formSettings.minInsuranceSalaryBase}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, minInsuranceSalaryBase: Number(e.target.value) })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الحد الأقصى للأجر التأميني (ج.م)</label>
                <input
                  type="number"
                  value={formSettings.maxInsuranceSalaryBase}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, maxInsuranceSalaryBase: Number(e.target.value) })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">نسبة خصم الموظف (المؤمن عليه)</label>
                <div className="relative">
                  <input
                    type="number"
                    step={0.01}
                    value={formSettings.employeeInsuranceRate}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, employeeInsuranceRate: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">11%</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نسبة مساهمة الشركة (المنشأة)</label>
                <div className="relative">
                  <input
                    type="number"
                    step={0.0025}
                    value={formSettings.employerInsuranceRate}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, employerInsuranceRate: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">18.75%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Box 3: Attendance Rules */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">قواعد احتساب الحضور والتأخير والإضافي</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">أيام العمل القياسية شهرياً</label>
              <input
                type="number"
                value={formSettings.workingDaysPerMonth}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, workingDaysPerMonth: Number(e.target.value) })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ساعات العمل القياسية يومياً</label>
              <input
                type="number"
                value={formSettings.standardDailyHours}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, standardDailyHours: Number(e.target.value) })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">معدل احتساب الساعة الإضافية</label>
              <input
                type="number"
                step={0.05}
                value={formSettings.daytimeOvertimeRate}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, daytimeOvertimeRate: Number(e.target.value) })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">فترة السماح الافتراضية (دقيقة)</label>
              <input
                type="number"
                value={formSettings.defaultGraceMinutes}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, defaultGraceMinutes: Number(e.target.value) })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Box 4: General Ledger Account Mappings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Layers className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-sm text-slate-900">ربط الحسابات المحاسبية بشجرة الحسابات (GL Mapping)</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-600">حساب مصروف الرواتب الأساسية (Dr):</span>
              <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-800">
                {formSettings.salariesExpenseAccountCode} - رواتب وعمولات
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-600">حساب الرواتب المستحقة للصرف (Cr):</span>
              <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-800">
                {formSettings.salariesPayableAccountCode} - مصروفات مستحقة رواتب
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-600">حساب مصلحة الضرائب لكسب العمل (Cr):</span>
              <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-800">
                {formSettings.incomeTaxPayableAccountCode} - ضرائب كسب عمل مستحقة
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-600">حساب الهيئة القومية للتأمينات (Cr):</span>
              <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-800">
                {formSettings.socialInsurancePayableAccountCode} - تأمينات اجتماعية مستحقة
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-600">حساب سلف الموظفين المستردة (Cr):</span>
              <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-800">
                {formSettings.advancesAccountCode} - مدينون سلف موظفين
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
