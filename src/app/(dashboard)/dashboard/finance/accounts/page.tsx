"use client";

import React, { useState } from "react";
import {
  Layers,
  Search,
  Plus,
  Building2,
  FolderTree,
  ChevronDown,
  ChevronLeft,
  CheckCircle2,
  Lock,
} from "lucide-react";
import FinanceNav from "@/components/finance/FinanceNav";
import { useFinance } from "@/context/FinanceContext";
import { Account, AccountCategory } from "@/types/finance";
import { formatEGP } from "@/lib/accountingEngine";

export default function ChartOfAccountsPage() {
  const { accounts, addAccount } = useFinance();
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New account form state
  const [newCode, setNewCode] = useState("");
  const [newNameAr, setNewNameAr] = useState("");
  const [newNameEn, setNewNameEn] = useState("");
  const [newCategory, setNewCategory] = useState<AccountCategory>("EXPENSE");
  const [newLevel, setNewLevel] = useState(2);
  const [newIsDebitNormal, setNewIsDebitNormal] = useState(true);

  const categories: { key: AccountCategory | "ALL"; label: string; count: number }[] = [
    { key: "ALL", label: "جميع الحسابات", count: accounts.length },
    { key: "ASSET", label: "الأصول (1xxx)", count: accounts.filter((a) => a.category === "ASSET").length },
    { key: "LIABILITY", label: "الالتزامات والخصوم (2xxx)", count: accounts.filter((a) => a.category === "LIABILITY").length },
    { key: "EQUITY", label: "حقوق الملكية (3xxx)", count: accounts.filter((a) => a.category === "EQUITY").length },
    { key: "REVENUE", label: "الإيرادات (4xxx)", count: accounts.filter((a) => a.category === "REVENUE").length },
    { key: "COGS", label: "تكلفة المبيعات (5xxx)", count: accounts.filter((a) => a.category === "COGS").length },
    { key: "EXPENSE", label: "المصروفات التشغيلية (6xxx)", count: accounts.filter((a) => a.category === "EXPENSE").length },
  ];

  const filteredAccounts = accounts.filter((acc) => {
    const matchesCategory = selectedCategory === "ALL" || acc.category === selectedCategory;
    const matchesSearch =
      acc.code.includes(searchQuery) ||
      acc.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newNameAr) return;

    addAccount({
      code: newCode,
      nameAr: newNameAr,
      nameEn: newNameEn || newNameAr,
      category: newCategory,
      level: newLevel,
      isDebitNormal: newIsDebitNormal,
      isSystem: false,
      isActive: true,
    });

    setShowAddModal(false);
    setNewCode("");
    setNewNameAr("");
    setNewNameEn("");
  };

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <FinanceNav />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1">
              <FolderTree className="w-3 h-3" />
              دليل وشجرة الحسابات (Chart of Accounts)
            </span>
            <span className="text-xs text-slate-500 font-medium">| الهيكل المحاسبي القياسي</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
            شجرة الحسابات العامة والأرصدة اللحظية
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            تصنيف الحسابات الشجرية المعتمدة لمعارض ومصانع الأثاث بالسوق المصري.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-rewaq-gold font-bold text-xs px-4 py-2 rounded-xl shadow-2xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة حساب جديد</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              selectedCategory === cat.key
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>{cat.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedCategory === cat.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="ابحث بكود الحساب أو الاسم العربي أو الإنجليزي..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pr-9 text-xs text-slate-800 focus:outline-none focus:border-rewaq-gold"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <span className="text-xs font-bold text-slate-500">
          عدد الحسابات المعروضة: {filteredAccounts.length}
        </span>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black">
              <tr>
                <th className="p-3.5 w-28">كود الحساب</th>
                <th className="p-3.5">اسم الحساب بالعربية</th>
                <th className="p-3.5">الاسم بالإنجليزية (English)</th>
                <th className="p-3.5">التصنيف المحاسبي</th>
                <th className="p-3.5">الطبيعة العادية</th>
                <th className="p-3.5">الرصيد المالي الحالي</th>
                <th className="p-3.5 text-center">النوع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.map((acc) => (
                <tr key={acc.code} className="hover:bg-slate-50/80 transition">
                  <td className="p-3.5 font-mono font-black text-slate-900 text-sm">
                    {acc.code}
                  </td>

                  <td className="p-3.5 font-bold text-slate-900">
                    <span className={acc.level === 2 ? "mr-4 text-slate-800" : ""}>
                      {acc.level === 2 ? "↳ " : ""}
                      {acc.nameAr}
                    </span>
                  </td>

                  <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                    {acc.nameEn}
                  </td>

                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        acc.category === "ASSET"
                          ? "bg-emerald-100 text-emerald-800"
                          : acc.category === "LIABILITY"
                          ? "bg-amber-100 text-amber-800"
                          : acc.category === "EQUITY"
                          ? "bg-purple-100 text-purple-800"
                          : acc.category === "REVENUE"
                          ? "bg-blue-100 text-blue-800"
                          : acc.category === "COGS"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {acc.category}
                    </span>
                  </td>

                  <td className="p-3.5 font-bold text-slate-700">
                    {acc.isDebitNormal ? "مدين (Debit)" : "دائن (Credit)"}
                  </td>

                  <td className="p-3.5 font-mono font-black text-sm text-slate-900">
                    {formatEGP(acc.currentBalance)}
                  </td>

                  <td className="p-3.5 text-center">
                    {acc.isSystem ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3" />
                        نظامي
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        مخصص
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-5 space-y-4">
            <h3 className="text-sm font-black text-slate-900">إضافة حساب مالي جديد لدليل الحسابات</h3>
            <form onSubmit={handleAddAccountSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">كود الحساب:</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="مثال: 6070"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">التصنيف:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => {
                      const cat = e.target.value as AccountCategory;
                      setNewCategory(cat);
                      setNewIsDebitNormal(cat === "ASSET" || cat === "EXPENSE" || cat === "COGS");
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  >
                    <option value="EXPENSE">مصروفات (6xxx)</option>
                    <option value="REVENUE">إيرادات (4xxx)</option>
                    <option value="ASSET">أصول (1xxx)</option>
                    <option value="LIABILITY">خصوم والتزامات (2xxx)</option>
                    <option value="COGS">تكلفة مبيعات (5xxx)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الحساب بالعربية:</label>
                <input
                  type="text"
                  required
                  value={newNameAr}
                  onChange={(e) => setNewNameAr(e.target.value)}
                  placeholder="مثال: مصاريف شحن سريعة"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الاسم بالإنجليزية:</label>
                <input
                  type="text"
                  value={newNameEn}
                  onChange={(e) => setNewNameEn(e.target.value)}
                  placeholder="e.g. Express Shipping Expense"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-black bg-slate-900 text-rewaq-gold hover:bg-slate-800 rounded-xl"
                >
                  إضافة الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
