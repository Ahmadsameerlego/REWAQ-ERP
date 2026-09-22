"use client";

import React, { useState } from "react";
import {
  X,
  User,
  Briefcase,
  Wallet,
  Calendar,
  Building,
  CheckCircle2,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useHR } from "@/context/HRContext";
import { Employee, EmploymentType, Gender, MaritalStatus, PaymentMethod } from "@/types/hr";

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateEmployeeModal({ isOpen, onClose }: CreateEmployeeModalProps) {
  const { addEmployee, departments, positions, schedules } = useHR();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [formData, setFormData] = useState<Partial<Employee>>({
    fullName: "",
    fullNameEn: "",
    nationalId: "",
    birthDate: "1994-05-15",
    gender: "MALE",
    maritalStatus: "SINGLE",
    phone: "",
    email: "",
    address: "",
    city: "القاهرة",

    branchId: "branch-cairo",
    branchName: "فرع التجمع الرئيسي",
    departmentId: "dept-sales",
    departmentName: "إدارة مبيعات الصالات والمعارض",
    positionId: "pos-se",
    positionTitle: "مستشار مبيعات أثاث وصالة",
    hireDate: new Date().toISOString().split("T")[0],
    workStartDate: new Date().toISOString().split("T")[0],
    employmentType: "FULL_TIME",
    status: "ACTIVE",
    scheduleId: "sch-fixed-main",
    scheduleName: "دوام المعرض الرئيسي (التجمع والخامس)",

    basicSalary: 9000,
    housingAllowance: 1000,
    transportationAllowance: 1000,
    otherAllowances: 500,
    commissionRate: 1.5,
    hasSocialInsurance: true,
    socialInsuranceNumber: "",
    insuranceSalaryBase: 7000,
    isSubjectToIncomeTax: true,
    paymentMethod: "BANK_TRANSFER",
    bankName: "البنك التجاري الدولي (CIB)",
    bankAccountNumber: "",
    iban: "",
    instapayHandle: "",
    costCenterId: "cc-cairo",
    costCenterName: "فرع التجمع الخامس (الرئيسي)",
  });

  if (!isOpen) return null;

  const handleBranchChange = (branchId: string) => {
    let branchName = "فرع التجمع الرئيسي";
    let costCenterId = "cc-cairo";
    let costCenterName = "فرع التجمع الخامس (الرئيسي)";

    if (branchId === "branch-october") {
      branchName = "فرع 6 أكتوبر (المول)";
      costCenterId = "cc-october";
      costCenterName = "فرع 6 أكتوبر (المول)";
    } else if (branchId === "branch-damietta") {
      branchName = "مستودع ومصنع دمياط";
      costCenterId = "cc-damietta";
      costCenterName = "مستودع ومصنع دمياط";
    } else if (branchId === "branch-tanta") {
      branchName = "فرع طنطا (الدلتا)";
      costCenterId = "cc-tanta";
      costCenterName = "فرع طنطا (الدلتا)";
    }

    setFormData((prev) => ({ ...prev, branchId, branchName, costCenterId, costCenterName }));
  };

  const handleDeptChange = (departmentId: string) => {
    const dept = departments.find((d) => d.id === departmentId);
    setFormData((prev) => ({
      ...prev,
      departmentId,
      departmentName: dept ? dept.nameAr : prev.departmentName,
    }));
  };

  const handlePositionChange = (positionId: string) => {
    const pos = positions.find((p) => p.id === positionId);
    setFormData((prev) => ({
      ...prev,
      positionId,
      positionTitle: pos ? pos.titleAr : prev.positionTitle,
    }));
  };

  const handleScheduleChange = (scheduleId: string) => {
    const sch = schedules.find((s) => s.id === scheduleId);
    setFormData((prev) => ({
      ...prev,
      scheduleId,
      scheduleName: sch ? sch.name : prev.scheduleName,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName) {
      alert("يرجى إدخال اسم الموظف بالكامل");
      return;
    }

    addEmployee(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" dir="rtl">
        {/* Header */}
        <div className="p-5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rewaq-gold/20 border border-rewaq-gold/40 flex items-center justify-center text-rewaq-gold">
                <User className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-white">إضافة موظف جديد (Employee Onboarding)</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              إدخال البيانات الشخصية، التعاقدية، الراتب، والتأمينات في خطوة واحدة بدون تكرار
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`py-3 px-4 border-b-2 flex items-center justify-center gap-2 ${
              step === 1 ? "border-rewaq-gold bg-white text-slate-900" : "border-transparent text-slate-400"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 text-[11px] flex items-center justify-center font-mono">1</span>
            <span>البيانات الأساسية</span>
          </button>

          <button
            type="button"
            onClick={() => setStep(2)}
            className={`py-3 px-4 border-b-2 flex items-center justify-center gap-2 ${
              step === 2 ? "border-rewaq-gold bg-white text-slate-900" : "border-transparent text-slate-400"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 text-[11px] flex items-center justify-center font-mono">2</span>
            <span>الفرع والوظيفة والدوام</span>
          </button>

          <button
            type="button"
            onClick={() => setStep(3)}
            className={`py-3 px-4 border-b-2 flex items-center justify-center gap-2 ${
              step === 3 ? "border-rewaq-gold bg-white text-slate-900" : "border-transparent text-slate-400"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 text-[11px] flex items-center justify-center font-mono">3</span>
            <span>الراتب والبنك والتأمينات</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* STEP 1: Personal Data */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">الاسم الرباعي للموظف (عربي) *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: حسام عادل حسن إبراهيم"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-rewaq-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">الاسم بالإنجليزية</label>
                  <input
                    type="text"
                    placeholder="e.g. Hossam Adel Hassan"
                    value={formData.fullNameEn || ""}
                    onChange={(e) => setFormData({ ...formData, fullNameEn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-rewaq-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">الرقم القومي (14 رقم) *</label>
                  <input
                    type="text"
                    maxLength={14}
                    placeholder="29405150102456"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-rewaq-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">تاريخ الميلاد</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-rewaq-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم الهاتف الأساسي *</label>
                  <input
                    type="tel"
                    required
                    placeholder="010XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-rewaq-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">البريد الإلكتروني للعمل</label>
                  <input
                    type="email"
                    placeholder="employee@rewaqerp.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-rewaq-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">النوع</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
                  >
                    <option value="MALE">ذكر</option>
                    <option value="FEMALE">أنثى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">الحالة الاجتماعية</label>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value as MaritalStatus })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
                  >
                    <option value="SINGLE">أعزب / آنسة</option>
                    <option value="MARRIED">متزوج</option>
                    <option value="DIVORCED">مطلق</option>
                    <option value="WIDOWED">أرمل</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">المدينة والمحافظة</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-rewaq-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">العنوان التفصيلي</label>
                <input
                  type="text"
                  placeholder="رقم العمارة، اسم الشارع، الحي"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-rewaq-gold"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Work & Job Information */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">الفرع التابع له *</label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => handleBranchChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:bg-white focus:outline-none"
                  >
                    <option value="branch-cairo">فرع التجمع الخامس (الرئيسي)</option>
                    <option value="branch-october">فرع 6 أكتوبر (المول)</option>
                    <option value="branch-tanta">فرع طنطا (الدلتا)</option>
                    <option value="branch-damietta">مستودع ومصنع دمياط</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">الإدارة / القسم *</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => handleDeptChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:bg-white focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">المسمى الوظيفي *</label>
                  <select
                    value={formData.positionId}
                    onChange={(e) => handlePositionChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:bg-white focus:outline-none"
                  >
                    {positions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.titleAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">جدول ومواعيد الدوام *</label>
                  <select
                    value={formData.scheduleId}
                    onChange={(e) => handleScheduleChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:bg-white focus:outline-none"
                  >
                    {schedules.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.startTime} - {s.endTime})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">تاريخ التعيين</label>
                  <input
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value, workStartDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع التوظيف</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as EmploymentType })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
                  >
                    <option value="FULL_TIME">دوام كامل (عقد سنوي)</option>
                    <option value="PROBATION">فترة اختبار (3 أشهر)</option>
                    <option value="PART_TIME">دوام جزئي</option>
                    <option value="COMMISSION_ONLY">عمولة فقط</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">حالة الموظف</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
                  >
                    <option value="ACTIVE">نشط وعلى رأس العمل</option>
                    <option value="PROBATION">تحت الاختبار</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  مركز التكلفة المحاسبي التلقائي لهذا الموظف: <strong>{formData.costCenterName}</strong>
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: Financial & Payroll */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">الراتب الأساسي (ج.م) *</label>
                  <input
                    type="number"
                    required
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-rewaq-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">بدل انتقال وسفر (ج.م)</label>
                  <input
                    type="number"
                    value={formData.transportationAllowance}
                    onChange={(e) => setFormData({ ...formData, transportationAllowance: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">بدل سكن / أخرى (ج.م)</label>
                  <input
                    type="number"
                    value={formData.housingAllowance}
                    onChange={(e) => setFormData({ ...formData, housingAllowance: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Social Insurance & Taxes Box */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rewaq-gold" />
                  <span>إعدادات التأمينات الاجتماعية والضرائب المصرية</span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasSocialInsurance}
                      onChange={(e) => setFormData({ ...formData, hasSocialInsurance: e.target.checked })}
                      className="w-4 h-4 rounded text-rewaq-gold focus:ring-rewaq-gold"
                    />
                    <span className="font-bold text-slate-800">مؤمن عليه بالتأمينات الاجتماعية (11% موظف / 18.75% شركة)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isSubjectToIncomeTax}
                      onChange={(e) => setFormData({ ...formData, isSubjectToIncomeTax: e.target.checked })}
                      className="w-4 h-4 rounded text-rewaq-gold focus:ring-rewaq-gold"
                    />
                    <span className="font-bold text-slate-800">خاضع لضريبة كسب العمل (شرائح الدخل المصرية)</span>
                  </label>
                </div>

                {formData.hasSocialInsurance && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">الرقم التأميني</label>
                      <input
                        type="text"
                        placeholder="e.g. 19801244"
                        value={formData.socialInsuranceNumber || ""}
                        onChange={(e) => setFormData({ ...formData, socialInsuranceNumber: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">الأجر التأميني المشترك عليه (ج.م)</label>
                      <input
                        type="number"
                        value={formData.insuranceSalaryBase || ""}
                        onChange={(e) => setFormData({ ...formData, insuranceSalaryBase: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">طريقة صرف الراتب *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
                  >
                    <option value="BANK_TRANSFER">تحويل بنكي (Bank Account)</option>
                    <option value="INSTAPAY">إنستاباي (InstaPay Handle)</option>
                    <option value="CASH">نقداً من خزينة الفرع</option>
                  </select>
                </div>

                {formData.paymentMethod === "BANK_TRANSFER" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم البنك</label>
                      <input
                        type="text"
                        placeholder="CIB / بنك مصر / QNB"
                        value={formData.bankName || ""}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم الحساب أو IBAN</label>
                      <input
                        type="text"
                        placeholder="EG3800..."
                        value={formData.bankAccountNumber || ""}
                        onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                      />
                    </div>
                  </>
                )}

                {formData.paymentMethod === "INSTAPAY" && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">عنوان الدفع اللحظي (IPA)</label>
                    <input
                      type="text"
                      placeholder="name@instapay"
                      value={formData.instapayHandle || ""}
                      onChange={(e) => setFormData({ ...formData, instapayHandle: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev - 1) as any)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>الخطوة السابقة</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
              >
                إلغاء
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !formData.fullName) {
                    alert("يرجى إدخال اسم الموظف بالكامل");
                    return;
                  }
                  setStep((prev) => (prev + 1) as any);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black bg-slate-950 hover:bg-slate-800 text-rewaq-gold shadow-md transition"
              >
                <span>متابعة</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-black bg-rewaq-gold hover:bg-rewaq-gold-dark text-slate-950 shadow-md transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تأكيد وإنشاء الموظف وعقده</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
