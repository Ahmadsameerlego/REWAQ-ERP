"use client";

import React, { useState } from "react";
import {
  X,
  Building,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
} from "lucide-react";
import { usePurchasing } from "@/context/PurchasingContext";
import { SupplierCategory, PaymentTermsType } from "@/types/purchasing";

interface CreateSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateSupplierModal({
  isOpen,
  onClose,
}: CreateSupplierModalProps) {
  const { addSupplier } = usePurchasing();

  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [category, setCategory] = useState<SupplierCategory>("NATURAL_WOOD");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("دمياط");
  const [address, setAddress] = useState("");
  const [commercialRegistration, setCommercialRegistration] = useState("");
  const [taxId, setTaxId] = useState("");
  const [paymentTerms, setPaymentTerms] = useState<PaymentTermsType>("NET_30");
  const [paymentTermsDays, setPaymentTermsDays] = useState(30);
  const [creditLimit, setCreditLimit] = useState(300000);
  const [notes, setNotes] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim() || !phone.trim()) return;

    addSupplier({
      code: `SUP-${Math.floor(100 + Math.random() * 900)}`,
      nameAr,
      nameEn: nameEn || undefined,
      category,
      contactPerson,
      phone,
      email,
      city,
      address,
      commercialRegistration: commercialRegistration || undefined,
      taxId: taxId || "000-000-000",
      status: "ACTIVE",
      paymentTerms,
      paymentTermsDays: Number(paymentTermsDays),
      currency: "EGP",
      accountCode: "2010",
      creditLimit: Number(creditLimit),
      rating: 5.0,
      notes,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rewaq-gold/20 border border-rewaq-gold/40 flex items-center justify-center text-rewaq-gold font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black">إضافة مورد / مصنع أثاث جديد</h2>
              <p className="text-[11px] text-slate-300">
                تسجيل بيانات المصنع، السجل التجاري، البطاقة الضريبية وشروط السداد
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {isSuccess && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-black">تمت إضافة المورد بنجاح إلى المنظومة!</p>
                <p className="text-[11px] text-emerald-700">
                  أصبح المورد متاحاً لإصدار أوامر التوريد ومقارنة الأسعار وربط المنتجات.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                اسم المورد / الشركة / المصنع بالعربية:
              </label>
              <input
                type="text"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: مصنع رِواق للأخشاب الطبيعية"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-rewaq-gold"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                تصنيف التوريد والنشاط:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SupplierCategory)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-rewaq-gold"
              >
                <option value="NATURAL_WOOD">أخشاب طبيعية (زان، آرو، موسكي)</option>
                <option value="FABRICS_UPHOLSTERY">أقمشة تنجيد ومفروشات وكتان</option>
                <option value="FOAM_SPONGE">إسفنج طبي وعالي الكثافة</option>
                <option value="HARDWARE_HANDLES">إكسسوارات ومفصلات ومقابض</option>
                <option value="GLASS_METALS">مسطحات زجاج ورخام وإستانلس</option>
                <option value="LIGHTING_ELECTRIC">إضاءة ووحدات ليد وأباجورات</option>
                <option value="SHOWROOM_SUPPLIES">مستلزمات تغليف وتشغيل معارض</option>
                <option value="IMPORTED_FINISHED">أثاث تام الصنع جاهز</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                اسم المسؤول / جهة الاتصال:
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="مثال: م. أشرف التابعي"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-rewaq-gold"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                رقم الهاتف / الواتساب:
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01004829104"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-rewaq-gold"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                البريد الإلكتروني:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="factory@example.eg"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rewaq-gold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                المدينة / المحافظة:
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="دمياط / العاشر من رمضان / القاهرة"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-rewaq-gold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                رقم البطاقة الضريبية (9 أرقام):
              </label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="402-918-723"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-rewaq-gold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                رقم السجل التجاري:
              </label>
              <input
                type="text"
                value={commercialRegistration}
                onChange={(e) => setCommercialRegistration(e.target.value)}
                placeholder="109482-دمياط"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-rewaq-gold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                شروط السداد الافتراضية:
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => {
                  const val = e.target.value as PaymentTermsType;
                  setPaymentTerms(val);
                  setPaymentTermsDays(
                    val === "NET_15" ? 15 : val === "NET_30" ? 30 : val === "NET_45" ? 45 : val === "NET_60" ? 60 : 0
                  );
                }}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-rewaq-gold"
              >
                <option value="NET_30">آجل 30 يوم (Net 30)</option>
                <option value="NET_15">آجل 15 يوم (Net 15)</option>
                <option value="NET_45">آجل 45 يوم (Net 45)</option>
                <option value="NET_60">آجل 60 يوم (Net 60)</option>
                <option value="CASH">سداد نقدي عند التوريد</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                الحد الائتماني للمديونية (ج.م):
              </label>
              <input
                type="number"
                value={creditLimit}
                onChange={(e) => setCreditLimit(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-none focus:border-rewaq-gold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              العنوان والمقر الرئيسي:
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="المنطقة الصناعية - دمياط الجديدة"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rewaq-gold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              ملاحظات إضافية عن جودة التوريد والشهادات:
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ملاحظات حول سابقة الأعمال ومستوى التشطيب..."
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rewaq-gold h-16"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 shadow-md transition cursor-pointer"
            >
              حفظ المورد
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
