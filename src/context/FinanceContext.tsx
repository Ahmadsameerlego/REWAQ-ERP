"use client";

import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import {
  Account,
  JournalEntry,
  JournalLine,
  CostCenter,
  TaxRateConfig,
  EtaInvoiceRecord,
  CustomerAdvance,
  CustomerInstallment,
  CustomerLedgerEntry,
  ReceiptVoucher,
  Treasury,
  BankAccount,
  TreasuryTransfer,
  TreasuryReconciliation,
  ExpenseCategory,
  Expense,
  Supplier,
  SupplierBill,
  SupplierPayment,
  SmartFinanceInsight,
  AccountingPeriod,
  AccountMappingConfig,
  FinanceRole,
} from "@/types/finance";
import {
  validateJournalBalance,
  generateCustomerAdvanceJournal,
  generateSaleInvoiceJournal,
  generateCollectionReceiptJournal,
  generateExpenseJournal,
  generateTreasuryTransferJournal,
  createReversalJournalEntry,
  validateEgyptianInvoiceForETA,
} from "@/lib/accountingEngine";

interface FinanceContextType {
  // Roles & Security
  activeRole: FinanceRole;
  setActiveRole: (role: FinanceRole) => void;

  // Chart of Accounts
  accounts: Account[];
  addAccount: (account: Omit<Account, "currentBalance">) => void;
  updateAccount: (code: string, updates: Partial<Account>) => void;

  // Journal Entries
  journalEntries: JournalEntry[];
  createJournalEntry: (entry: Omit<JournalEntry, "id" | "entryNumber" | "createdAt">) => JournalEntry;
  postJournalEntry: (id: string, user: string) => void;
  reverseJournalEntry: (id: string, user: string, reason: string) => JournalEntry | null;

  // Cost Centers
  costCenters: CostCenter[];

  // Treasuries & Banks
  treasuries: Treasury[];
  bankAccounts: BankAccount[];
  treasuryTransfers: TreasuryTransfer[];
  reconciliations: TreasuryReconciliation[];
  createTreasuryTransfer: (transfer: Omit<TreasuryTransfer, "id" | "transferNumber" | "status">) => TreasuryTransfer;
  approveTreasuryTransfer: (id: string, user: string) => void;
  createReconciliation: (rec: Omit<TreasuryReconciliation, "id">) => void;

  // Customer Receivables & Advances
  customerAdvances: CustomerAdvance[];
  customerInstallments: CustomerInstallment[];
  receipts: ReceiptVoucher[];
  createCustomerAdvance: (advance: Omit<CustomerAdvance, "id" | "advanceNumber" | "settledAmount" | "remainingAmount" | "status">) => CustomerAdvance;
  settleCustomerAdvance: (advanceId: string, invoiceId: string, amount: number) => void;
  createReceiptVoucher: (receipt: Omit<ReceiptVoucher, "id" | "receiptNumber" | "printCount">) => ReceiptVoucher;

  // Operating Expenses
  expenseCategories: ExpenseCategory[];
  expenses: Expense[];
  createExpense: (expense: Omit<Expense, "id" | "expenseNumber" | "status">) => Expense;
  approveExpense: (id: string, user: string) => void;
  payExpense: (id: string, user: string) => void;

  // Suppliers & Payables
  suppliers: Supplier[];
  supplierBills: SupplierBill[];
  supplierPayments: SupplierPayment[];
  createSupplierBill: (bill: Omit<SupplierBill, "id" | "billNumber" | "paidAmount" | "remainingAmount" | "status">) => SupplierBill;
  createSupplierPayment: (payment: Omit<SupplierPayment, "id" | "paymentNumber">) => SupplierPayment;

  // Egyptian Tax & ETA E-Invoicing
  taxConfigs: TaxRateConfig[];
  etaInvoices: EtaInvoiceRecord[];
  updateTaxConfig: (id: string, updates: Partial<TaxRateConfig>) => void;
  submitInvoiceToETA: (invoiceId: string) => { success: boolean; message: string; uuid?: string };
  retryEtaSubmission: (invoiceId: string) => void;

  // Smart Insights & Period Management
  insights: SmartFinanceInsight[];
  dismissInsight: (id: string) => void;
  periods: AccountingPeriod[];
  activePeriod: AccountingPeriod;
  closeAccountingPeriod: (periodId: string, user: string, notes: string) => void;

  // Account Mappings
  accountMappings: AccountMappingConfig;
  updateAccountMappings: (updates: Partial<AccountMappingConfig>) => void;

  // Helper Calculations & Totals
  financialSummary: {
    totalCashInTreasuries: number;
    totalCashInBanks: number;
    totalLiquidCash: number;
    totalSalesMonth: number;
    totalNetSalesMonth: number;
    totalVatOutputMonth: number;
    totalVatInputMonth: number;
    netVatPosition: number;
    totalCustomerReceivables: number;
    totalOverdueReceivables: number;
    totalCustomerAdvancesHeld: number;
    totalExpensesMonth: number;
    grossProfit: number;
    operatingProfit: number;
    netProfit: number;
    grossMarginPercent: number;
    netMarginPercent: number;
  };

  // AI Assistant Query Engine
  askFinanceAI: (query: string) => {
    answer: string;
    metrics?: { label: string; value: string; isGood?: boolean }[];
    relatedAction?: { label: string; href: string };
  };
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [activeRole, setActiveRole] = useState<FinanceRole>("FINANCE_MANAGER");

  // Initial Chart of Accounts (Egyptian SME Showroom Standard)
  const [accounts, setAccounts] = useState<Account[]>([
    // 1. Assets
    { code: "1010", nameAr: "خزينة فرع التجمع الخامس (الرئيسي)", nameEn: "New Cairo Vault", category: "ASSET", level: 2, isDebitNormal: true, currentBalance: 148500, isSystem: true, isActive: true },
    { code: "1011", nameAr: "خزينة فرع 6 أكتوبر (المول)", nameEn: "October Vault", category: "ASSET", level: 2, isDebitNormal: true, currentBalance: 85000, isSystem: true, isActive: true },
    { code: "1012", nameAr: "خزينة فرع طنطا", nameEn: "Tanta Vault", category: "ASSET", level: 2, isDebitNormal: true, currentBalance: 22000, isSystem: true, isActive: true },
    { code: "1013", nameAr: "الخزينة المركزية الإدارية", nameEn: "Main Central Vault", category: "ASSET", level: 2, isDebitNormal: true, currentBalance: 350000, isSystem: true, isActive: true },
    { code: "1020", nameAr: "بنك CIB - الحساب التجاري الرئيسي", nameEn: "CIB Main Operating Account", category: "ASSET", level: 2, isDebitNormal: true, currentBalance: 1850000, isSystem: true, isActive: true },
    { code: "1021", nameAr: "بنك مصر - نقاط البيع والتحصيلات", nameEn: "Banque Misr POS Collection", category: "ASSET", level: 2, isDebitNormal: true, currentBalance: 640000, isSystem: true, isActive: true },
    { code: "1030", nameAr: "مدينون وحسابات عملاء (أقساط وآجل)", nameEn: "Accounts Receivable", category: "ASSET", level: 1, isDebitNormal: true, currentBalance: 485000, isSystem: true, isActive: true },
    { code: "1040", nameAr: "مخزون المعارض والأثاث الجاهز والخامات", nameEn: "Inventory Asset", category: "ASSET", level: 1, isDebitNormal: true, currentBalance: 3420000, isSystem: true, isActive: true },
    { code: "1050", nameAr: "أصول ثابتة وتجهيزات وديكور المعارض", nameEn: "Fixed Assets & Fitouts", category: "ASSET", level: 1, isDebitNormal: true, currentBalance: 1200000, isSystem: true, isActive: true },
    { code: "1060", nameAr: "ضريبة القيمة المضافة القابلة للخصم (مدخلات 14%)", nameEn: "Input VAT Recoverable", category: "ASSET", level: 2, isDebitNormal: true, currentBalance: 58400, isSystem: true, isActive: true },

    // 2. Liabilities
    { code: "2010", nameAr: "دائنون وحسابات الموردين", nameEn: "Accounts Payable", category: "LIABILITY", level: 1, isDebitNormal: false, currentBalance: 320000, isSystem: true, isActive: true },
    { code: "2020", nameAr: "أمانات ومقدمات عملاء (عرابين تعاقدات)", nameEn: "Customer Advances & Deposits", category: "LIABILITY", level: 1, isDebitNormal: false, currentBalance: 410000, isSystem: true, isActive: true },
    { code: "2030", nameAr: "ضريبة القيمة المضافة المستحقة (مخرجات 14%)", nameEn: "Output VAT Payable (ETA)", category: "LIABILITY", level: 2, isDebitNormal: false, currentBalance: 178200, isSystem: true, isActive: true },
    { code: "2040", nameAr: "ضرائب أخرى ومصلحة الضرائب (خصم وأرباح 1%)", nameEn: "Withholding Tax Payable", category: "LIABILITY", level: 2, isDebitNormal: false, currentBalance: 14200, isSystem: true, isActive: true },
    { code: "2050", nameAr: "مصروفات مستحقة ومخصصات", nameEn: "Accrued Expenses", category: "LIABILITY", level: 1, isDebitNormal: false, currentBalance: 45000, isSystem: true, isActive: true },

    // 3. Equity
    { code: "3010", nameAr: "رأس المال المدفوع", nameEn: "Paid-in Capital", category: "EQUITY", level: 1, isDebitNormal: false, currentBalance: 5000000, isSystem: true, isActive: true },
    { code: "3020", nameAr: "أرباح مرحلة واحتياطيات", nameEn: "Retained Earnings", category: "EQUITY", level: 1, isDebitNormal: false, currentBalance: 1521500, isSystem: true, isActive: true },

    // 4. Revenue
    { code: "4010", nameAr: "إيرادات مبيعات معارض الأثاث", nameEn: "Furniture Sales Revenue", category: "REVENUE", level: 1, isDebitNormal: false, currentBalance: 6240000, isSystem: true, isActive: true },
    { code: "4020", nameAr: "إيرادات خدمات الشحن والتركيب", nameEn: "Delivery & Assembly Revenue", category: "REVENUE", level: 2, isDebitNormal: false, currentBalance: 185000, isSystem: true, isActive: true },
    { code: "4040", nameAr: "خصومات مبيعات ممنوحة (حساب مكمل سالب)", nameEn: "Sales Discounts Allowed", category: "REVENUE", level: 2, isDebitNormal: true, currentBalance: 142000, isSystem: true, isActive: true },

    // 5. Cost of Sales
    { code: "5010", nameAr: "تكلفة البضاعة المباعة (COGS)", nameEn: "Cost of Goods Sold", category: "COGS", level: 1, isDebitNormal: true, currentBalance: 3650000, isSystem: true, isActive: true },
    { code: "5020", nameAr: "تكاليف الشحن والتشوين المباشرة", nameEn: "Direct Logistics Cost", category: "COGS", level: 2, isDebitNormal: true, currentBalance: 110000, isSystem: true, isActive: true },

    // 6. Operating Expenses
    { code: "6010", nameAr: "إيجارات معارض ومستودعات", nameEn: "Showroom & Warehouse Rent", category: "EXPENSE", level: 1, isDebitNormal: true, currentBalance: 480000, isSystem: true, isActive: true },
    { code: "6020", nameAr: "رواتب وعمولات فريق المبيعات والموظفين", nameEn: "Salaries & Sales Commissions", category: "EXPENSE", level: 1, isDebitNormal: true, currentBalance: 540000, isSystem: true, isActive: true },
    { code: "6030", nameAr: "كهرباء ومرافق وضيافة المعارض", nameEn: "Utilities & Showroom Hospitality", category: "EXPENSE", level: 2, isDebitNormal: true, currentBalance: 65000, isSystem: true, isActive: true },
    { code: "6040", nameAr: "تسويق وإعلانات ميتا وتيك توك وجوجل", nameEn: "Marketing & Meta Ads", category: "EXPENSE", level: 1, isDebitNormal: true, currentBalance: 210000, isSystem: true, isActive: true },
    { code: "6050", nameAr: "صيانة أسطول الشحن وتجهيزات العرض", nameEn: "Vehicle & Asset Maintenance", category: "EXPENSE", level: 2, isDebitNormal: true, currentBalance: 48000, isSystem: true, isActive: true },
    { code: "6060", nameAr: "مصاريف إدارية وبنكية متنوعة", nameEn: "General & Administrative", category: "EXPENSE", level: 2, isDebitNormal: true, currentBalance: 32000, isSystem: true, isActive: true },
  ]);

  // Cost Centers
  const [costCenters] = useState<CostCenter[]>([
    { id: "cc-cairo", code: "CC-01", nameAr: "فرع التجمع الخامس (الرئيسي)", type: "SHOWROOM", manager: "كريم يوسف", budgetAllocated: 850000, budgetSpent: 620000 },
    { id: "cc-october", code: "CC-02", nameAr: "فرع 6 أكتوبر (المول)", type: "SHOWROOM", manager: "سارة المهدي", budgetAllocated: 600000, budgetSpent: 480000 },
    { id: "cc-tanta", code: "CC-03", nameAr: "فرع طنطا (الدلتا)", type: "SHOWROOM", manager: "محمود الشناوي", budgetAllocated: 400000, budgetSpent: 355000 },
    { id: "cc-damietta", code: "CC-04", nameAr: "مستودع ومصنع دمياط", type: "PRODUCTION", manager: "م. أشرف سلامة", budgetAllocated: 1200000, budgetSpent: 980000 },
    { id: "cc-marketing", code: "CC-05", nameAr: "إدارة التسويق والحملات الرقمية", type: "MARKETING", manager: "نورهان هشام", budgetAllocated: 300000, budgetSpent: 210000 },
    { id: "cc-admin", code: "CC-06", nameAr: "الإدارة العامة والمالية", type: "ADMINISTRATION", manager: "أحمد سمير", budgetAllocated: 500000, budgetSpent: 375000 },
  ]);

  // Treasuries & Banks
  const [treasuries, setTreasuries] = useState<Treasury[]>([
    { id: "tr-cairo", code: "TR-01", nameAr: "خزينة فرع التجمع الخامس", branchId: "branch-cairo", branchName: "فرع التجمع الرئيسي", accountCode: "1010", openingBalance: 50000, currentBalance: 148500, minOperationalLimit: 40000, maxOperationalLimit: 250000, type: "BRANCH_VAULT", managerName: "كريم يوسف", status: "ACTIVE" },
    { id: "tr-october", code: "TR-02", nameAr: "خزينة فرع 6 أكتوبر", branchId: "branch-october", branchName: "فرع 6 أكتوبر", accountCode: "1011", openingBalance: 30000, currentBalance: 85000, minOperationalLimit: 30000, maxOperationalLimit: 200000, type: "BRANCH_VAULT", managerName: "سارة المهدي", status: "ACTIVE" },
    { id: "tr-tanta", code: "TR-03", nameAr: "خزينة فرع طنطا", branchId: "branch-tanta", branchName: "فرع طنطا", accountCode: "1012", openingBalance: 30000, currentBalance: 22000, minOperationalLimit: 30000, maxOperationalLimit: 150000, type: "BRANCH_VAULT", managerName: "محمود الشناوي", status: "ACTIVE" },
    { id: "tr-main", code: "TR-00", nameAr: "الخزينة المركزية (الإدارة)", branchId: "all-branches", branchName: "الإدارة المركزية", accountCode: "1013", openingBalance: 200000, currentBalance: 350000, minOperationalLimit: 100000, maxOperationalLimit: 1000000, type: "MAIN_VAULT", managerName: "أحمد سمير", status: "ACTIVE" },
  ]);

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    { id: "bank-cib", code: "BNK-01", bankName: "البنك التجاري الدولي (CIB)", accountNameAr: "حساب الشركة التجاري الجاري", accountNumber: "100045892100", iban: "EG38001000458921000100223", accountCode: "1020", branch: "فرع التجمع الخامس", openingBalance: 1200000, currentBalance: 1850000, currency: "EGP", status: "ACTIVE" },
    { id: "bank-misr", code: "BNK-02", bankName: "بنك مصر", accountNameAr: "حساب تحصيلات ماكينات POS والفيزا", accountNumber: "204018765432", iban: "EG6500020401876543200100441", accountCode: "1021", branch: "فرع شيراتون", openingBalance: 400000, currentBalance: 640000, currency: "EGP", status: "ACTIVE" },
  ]);

  const [treasuryTransfers, setTreasuryTransfers] = useState<TreasuryTransfer[]>([
    {
      id: "trf-101",
      transferNumber: "TR-2026-044",
      fromId: "tr-october",
      fromName: "خزينة فرع 6 أكتوبر",
      fromType: "TREASURY",
      toId: "bank-cib",
      toName: "بنك CIB - الحساب التجاري",
      toType: "BANK",
      amount: 50000,
      date: "2026-09-20",
      reference: "إيداع بنكي متحصلات أسبوعية",
      status: "COMPLETED",
      requestedBy: "سارة المهدي",
      approvedBy: "أحمد سمير",
      completedAt: "2026-09-20 16:30",
      notes: "تم الإيداع بماكينة إيداع CIB وإرفاق الإيصال",
      journalEntryId: "je-trf-101",
    },
    {
      id: "trf-102",
      transferNumber: "TR-2026-045",
      fromId: "tr-cairo",
      fromName: "خزينة فرع التجمع الخامس",
      fromType: "TREASURY",
      toId: "tr-tanta",
      toName: "خزينة فرع طنطا",
      toType: "TREASURY",
      amount: 25000,
      date: "2026-09-22",
      reference: "تغذية عهدة خزينة طنطا لتعويض الحد التشغيلي",
      status: "PENDING_APPROVAL",
      requestedBy: "محمود الشناوي",
      notes: "تغذية عهدة نقدية للمصروفات التشغيلية",
    },
  ]);

  const [reconciliations, setReconciliations] = useState<TreasuryReconciliation[]>([
    {
      id: "rec-01",
      date: "2026-09-21",
      targetId: "tr-cairo",
      targetName: "خزينة فرع التجمع الخامس",
      targetType: "TREASURY",
      systemBalance: 148500,
      physicalBalance: 148500,
      difference: 0,
      status: "BALANCED",
      reconciliationNotes: "الجرد اليومي مطابق تماماً للسجلات والدفاتر",
      reconciledBy: "كريم يوسف",
    },
    {
      id: "rec-02",
      date: "2026-09-20",
      targetId: "bank-cib",
      targetName: "بنك CIB - الحساب التجاري",
      targetType: "BANK",
      systemBalance: 1850000,
      physicalBalance: 1850000,
      difference: 0,
      status: "BALANCED",
      reconciliationNotes: "مطابقة كشف الحساب البنكي لشهر سبتمبر",
      reconciledBy: "المحاسب المالي",
    },
  ]);

  // Egyptian Tax Configurations (Configurable, not hardcoded)
  const [taxConfigs, setTaxConfigs] = useState<TaxRateConfig[]>([
    {
      id: "tax-vat-14",
      code: "T1",
      nameAr: "ضريبة القيمة المضافة العامة (14%)",
      rate: 0.14,
      isDefault: true,
      taxType: "V009",
      accountCode: "2030",
      description: "النسبة العامة المفروضة على منتجات الأثاث وفق قانون الضريبة على القيمة المضافة المصري رقم 67 لسنة 2016 وتعديلاته.",
      effectiveFrom: "2017-07-01",
    },
    {
      id: "tax-exempt",
      code: "T2",
      nameAr: "معفى من ضريبة القيمة المضافة (0%)",
      rate: 0.0,
      isDefault: false,
      taxType: "EXEMPT",
      accountCode: "2030",
      description: "الأصناف أو الخدمات المعفاة بنص القانون المصري أو الدبلوماسيين.",
      effectiveFrom: "2016-09-08",
    },
    {
      id: "tax-withholding-1",
      code: "W1",
      nameAr: "الخصم والتحصيل تحت حساب الضريبة (1%)",
      rate: 0.01,
      isDefault: false,
      taxType: "V001",
      accountCode: "2040",
      description: "خصم 1% على فواتير الموردين والمشتريات التي تتجاوز 300 ج.م.",
      effectiveFrom: "2020-01-01",
    },
  ]);

  // Preloaded ETA E-Invoices
  const [etaInvoices, setEtaInvoices] = useState<EtaInvoiceRecord[]>([
    {
      id: "eta-inv-101",
      internalId: "INV-2026-1044",
      documentType: "I",
      documentTypeName: "فاتورة مبيعات ضريبية (E-Invoice B2B)",
      receiverType: "B",
      receiverTaxId: "492817293",
      receiverName: "شركة إعمار مصر للتنمية والاستثمار العقاري",
      receiverPhone: "01005544332",
      receiverAddress: "مبنى إعمار - التجمع الخامس - القاهرة",
      dateTimeIssued: "2026-09-21T14:30:00Z",
      dateTimeReceived: "2026-09-21T14:30:12Z",
      totalSalesAmount: 220000,
      totalDiscountAmount: 10000,
      netAmount: 210000,
      taxAmount: 29400,
      totalAmount: 239400,
      etaStatus: "VALID",
      uuid: "EGY-ETA-2026-9F8B-4C12-8871-3349102A7E11",
      submissionId: "SUB-8840192",
      longId: "ETA_DOC_0099482718274615",
      signatureToken: "MIIEVwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC78...EGY_E_TOKEN",
      qrCodeUrl: "https://invoicing.eta.gov.eg/documents/EGY-ETA-2026-9F8B-4C12-8871-3349102A7E11/share",
      validationErrors: [],
      lines: [
        { itemCode: "EG-11345678-SOFA01", itemType: "EGS", description: "صالون مودرن ملكي خشب زان أحمر (قماش كتان)", unitType: "EA", quantity: 2, unitPrice: 110000, salesTotal: 220000, discount: 10000, netTotal: 210000, taxRate: 0.14, taxAmount: 29400, total: 239400 },
      ],
      sourceModule: "CONTRACT",
      sourceReference: "RWQ-2026-8801",
      branchId: "branch-cairo",
      branchName: "فرع التجمع الرئيسي",
      journalEntryId: "je-sale-101",
    },
    {
      id: "eta-inv-102",
      internalId: "INV-2026-1045",
      documentType: "R",
      documentTypeName: "إيصال إلكتروني مستهلك نهائي (E-Receipt B2C)",
      receiverType: "P",
      receiverTaxId: "29012050102456", // National ID
      receiverName: "د. هاني ممدوح عبد الوهاب",
      receiverPhone: "01099887766",
      receiverAddress: "كمبوند ميفيدا - التجمع الخامس",
      dateTimeIssued: "2026-09-22T11:15:00Z",
      dateTimeReceived: "2026-09-22T11:15:05Z",
      totalSalesAmount: 145000,
      totalDiscountAmount: 5000,
      netAmount: 140000,
      taxAmount: 19600,
      totalAmount: 159600,
      etaStatus: "VALID",
      uuid: "EGY-ETA-2026-3A11-7D99-5502-8812440C9A33",
      submissionId: "SUB-8840224",
      longId: "ETA_DOC_0099482718274689",
      signatureToken: "MIIEVwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC78...POS_SIGNATURE",
      qrCodeUrl: "https://invoicing.eta.gov.eg/receipts/EGY-ETA-2026-3A11-7D99-5502-8812440C9A33/share",
      validationErrors: [],
      lines: [
        { itemCode: "EG-11345678-BED02", itemType: "EGS", description: "غرفة نوم ماستر كينج هيدبورد كابوتنيه", unitType: "EA", quantity: 1, unitPrice: 145000, salesTotal: 145000, discount: 5000, netTotal: 140000, taxRate: 0.14, taxAmount: 19600, total: 159600 },
      ],
      sourceModule: "POS",
      sourceReference: "POS-2026-0914",
      branchId: "branch-cairo",
      branchName: "فرع التجمع الرئيسي",
      journalEntryId: "je-sale-102",
    },
    {
      id: "eta-inv-103",
      internalId: "INV-2026-1046",
      documentType: "I",
      documentTypeName: "فاتورة مبيعات ضريبية (E-Invoice B2B)",
      receiverType: "B",
      receiverTaxId: "300450912",
      receiverName: "شركة النيل للتوريدات الفندقية",
      receiverPhone: "01223344556",
      dateTimeIssued: "2026-09-22T13:45:00Z",
      totalSalesAmount: 180000,
      totalDiscountAmount: 0,
      netAmount: 180000,
      taxAmount: 25200,
      totalAmount: 205200,
      etaStatus: "REJECTED",
      validationErrors: [
        "كود الصنف الداخلي 'TABLE-OAK-04' غير مسجل في منظومة الضرائب المصرية (يتطلب كود EGS أو GS1 معتمد مرتبط بـ GPC).",
      ],
      lines: [
        { itemCode: "TABLE-OAK-04", itemType: "EGS", description: "طاولة طعام أرو ماسيف مع 8 كراسي مخملية", unitType: "EA", quantity: 1, unitPrice: 180000, salesTotal: 180000, discount: 0, netTotal: 180000, taxRate: 0.14, taxAmount: 25200, total: 205200 },
      ],
      sourceModule: "CONTRACT",
      sourceReference: "RWQ-2026-8812",
      branchId: "branch-october",
      branchName: "فرع 6 أكتوبر",
    },
  ]);

  // Customer Advances (Deposits treated as Liabilities)
  const [customerAdvances, setCustomerAdvances] = useState<CustomerAdvance[]>([
    {
      id: "adv-501",
      advanceNumber: "ADV-5012",
      customerId: "cust-1",
      customerName: "د. هاني ممدوح عبد الوهاب",
      customerPhone: "01099887766",
      contractId: "RWQ-2026-8801",
      orderNumber: "RWQ-2026-8801",
      amount: 60000,
      settledAmount: 60000,
      remainingAmount: 0,
      paymentMethod: "CASH",
      treasuryOrBankId: "tr-cairo",
      treasuryOrBankName: "خزينة فرع التجمع الخامس",
      date: "2026-09-10",
      status: "SETTLED",
      notes: "عربون حجز صالون ملكي تم تسويته بالكامل مع الفاتورة رقم INV-2026-1044",
      receiptVoucherId: "REC-8801",
      journalEntryId: "je-adv-501",
    },
    {
      id: "adv-502",
      advanceNumber: "ADV-5013",
      customerId: "cust-2",
      customerName: "المهندس شريف فاروق الدسوقي",
      customerPhone: "01122334455",
      contractId: "RWQ-2026-8804",
      orderNumber: "RWQ-2026-8804",
      amount: 75000,
      settledAmount: 0,
      remainingAmount: 75000,
      paymentMethod: "BANK_TRANSFER",
      treasuryOrBankId: "bank-cib",
      treasuryOrBankName: "بنك CIB - الحساب التجاري",
      date: "2026-09-18",
      status: "ACTIVE",
      notes: "عربون تصنيع ركنة ليفينج وغرفة سفرة مخصصة (تحت التصنيع بدمياط)",
      receiptVoucherId: "REC-8815",
      journalEntryId: "je-adv-502",
    },
    {
      id: "adv-503",
      advanceNumber: "ADV-5014",
      customerId: "cust-3",
      customerName: "أ/ ياسمين عبد العزيز القاضي",
      customerPhone: "01234567890",
      contractId: "RWQ-2026-8808",
      orderNumber: "RWQ-2026-8808",
      amount: 45000,
      settledAmount: 0,
      remainingAmount: 45000,
      paymentMethod: "VALU",
      treasuryOrBankId: "bank-misr",
      treasuryOrBankName: "بنك مصر - نقاط البيع",
      date: "2026-09-19",
      status: "ACTIVE",
      notes: "دفعة أولى حجز غرفة نوم مودرن",
      receiptVoucherId: "REC-8820",
      journalEntryId: "je-adv-503",
    },
  ]);

  // Customer Installments Schedule
  const [customerInstallments, setCustomerInstallments] = useState<CustomerInstallment[]>([
    { id: "inst-01", contractId: "RWQ-2026-8801", orderNumber: "RWQ-2026-8801", customerId: "cust-1", customerName: "د. هاني ممدوح عبد الوهاب", customerPhone: "01099887766", installmentNumber: 1, totalInstallments: 3, amount: 60000, dueDate: "2026-09-15", paidAmount: 60000, remainingAmount: 0, status: "PAID", paidDate: "2026-09-15", receiptId: "REC-8830" },
    { id: "inst-02", contractId: "RWQ-2026-8801", orderNumber: "RWQ-2026-8801", customerId: "cust-1", customerName: "د. هاني ممدوح عبد الوهاب", customerPhone: "01099887766", installmentNumber: 2, totalInstallments: 3, amount: 60000, dueDate: "2026-09-25", paidAmount: 0, remainingAmount: 60000, status: "DUE" },
    { id: "inst-03", contractId: "RWQ-2026-8801", orderNumber: "RWQ-2026-8801", customerId: "cust-1", customerName: "د. هاني ممدوح عبد الوهاب", customerPhone: "01099887766", installmentNumber: 3, totalInstallments: 3, amount: 59400, dueDate: "2026-10-25", paidAmount: 0, remainingAmount: 59400, status: "PENDING" },
    { id: "inst-04", contractId: "RWQ-2026-8790", orderNumber: "RWQ-2026-8790", customerId: "cust-4", customerName: "أ. طارق عبد المجيد", customerPhone: "01011223344", installmentNumber: 2, totalInstallments: 4, amount: 35000, dueDate: "2026-09-10", paidAmount: 0, remainingAmount: 35000, status: "OVERDUE", notes: "تأخر 12 يوماً - تم التواصل عبر واتساب للتذكير" },
    { id: "inst-05", contractId: "RWQ-2026-8785", orderNumber: "RWQ-2026-8785", customerId: "cust-5", customerName: "د. نجلاء محمود رضوان", customerPhone: "01155667788", installmentNumber: 3, totalInstallments: 3, amount: 48000, dueDate: "2026-09-12", paidAmount: 0, remainingAmount: 48000, status: "OVERDUE", notes: "تأخر 10 أيام" },
    { id: "inst-06", contractId: "RWQ-2026-8802", orderNumber: "RWQ-2026-8802", customerId: "cust-6", customerName: "م. أشرف عبد السلام", customerPhone: "01288990011", installmentNumber: 1, totalInstallments: 2, amount: 42000, dueDate: "2026-09-26", paidAmount: 0, remainingAmount: 42000, status: "DUE" },
  ]);

  // Receipts / Payment Collection Vouchers
  const [receipts, setReceipts] = useState<ReceiptVoucher[]>([
    {
      id: "rec-8801",
      receiptNumber: "REC-8801",
      date: "2026-09-10",
      customerId: "cust-1",
      customerName: "د. هاني ممدوح عبد الوهاب",
      customerPhone: "01099887766",
      contractId: "RWQ-2026-8801",
      orderNumber: "RWQ-2026-8801",
      amount: 60000,
      paymentMethod: "CASH",
      treasuryOrBankId: "tr-cairo",
      treasuryOrBankName: "خزينة فرع التجمع الخامس",
      referenceNumber: "CASH-CAIRO-902",
      notes: "عربون تعاقد صالون ملكي",
      receivedBy: "كريم يوسف",
      type: "CONTRACT_DEPOSIT",
      journalEntryId: "je-adv-501",
      printCount: 2,
    },
    {
      id: "rec-8830",
      receiptNumber: "REC-8830",
      date: "2026-09-15",
      customerId: "cust-1",
      customerName: "د. هاني ممدوح عبد الوهاب",
      customerPhone: "01099887766",
      contractId: "RWQ-2026-8801",
      orderNumber: "RWQ-2026-8801",
      amount: 60000,
      paymentMethod: "INSTAPAY",
      treasuryOrBankId: "bank-cib",
      treasuryOrBankName: "بنك CIB - الحساب التجاري",
      referenceNumber: "INSTA-99281726",
      notes: "سداد القسط الأول لعقد RWQ-2026-8801",
      receivedBy: "المحاسب المالي",
      type: "INSTALLMENT_PAYMENT",
      installmentId: "inst-01",
      journalEntryId: "je-col-8830",
      printCount: 1,
    },
  ]);

  // Operating Expenses Categories
  const [expenseCategories] = useState<ExpenseCategory[]>([
    { id: "cat-rent", code: "EXP-CAT-01", nameAr: "إيجارات المعارض والمستودعات", defaultAccountCode: "6010", monthlyBudget: 500000, isTaxDeductible: true },
    { id: "cat-salaries", code: "EXP-CAT-02", nameAr: "رواتب وعمولات المبيعات", defaultAccountCode: "6020", monthlyBudget: 550000, isTaxDeductible: false },
    { id: "cat-marketing", code: "EXP-CAT-03", nameAr: "إعلانات وتسويق رقمي ومشاهير", defaultAccountCode: "6040", monthlyBudget: 170000, isTaxDeductible: true },
    { id: "cat-utilities", code: "EXP-CAT-04", nameAr: "كهرباء ومرافق وضيافة الصالة", defaultAccountCode: "6030", monthlyBudget: 70000, isTaxDeductible: true },
    { id: "cat-logistics", code: "EXP-CAT-05", nameAr: "صيانة أسطول الشحن والوقود", defaultAccountCode: "6050", monthlyBudget: 50000, isTaxDeductible: true },
    { id: "cat-admin", code: "EXP-CAT-06", nameAr: "مصاريف إدارية وبنكية متنوعة", defaultAccountCode: "6060", monthlyBudget: 35000, isTaxDeductible: true },
  ]);

  // Expenses
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "exp-301",
      expenseNumber: "EXP-2026-301",
      date: "2026-09-01",
      categoryId: "cat-rent",
      categoryName: "إيجارات المعارض والمستودعات",
      accountCode: "6010",
      amount: 180000,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 180000,
      paymentMethod: "BANK_TRANSFER",
      paidFromId: "bank-cib",
      paidFromName: "بنك CIB - الحساب التجاري",
      branchId: "branch-cairo",
      branchName: "فرع التجمع الرئيسي",
      costCenterId: "cc-cairo",
      costCenterName: "فرع التجمع الخامس (الرئيسي)",
      vendorName: "شركة كايرو فيستيفال سيتي لإدارة العقارات",
      invoiceNumber: "RENT-SEP-2026",
      description: "سداد القيمة الإيجارية الشهرية لمعرض التجمع الخامس لشهر سبتمبر 2026",
      status: "PAID",
      requestedBy: "المحاسب المالي",
      approvedBy: "أحمد سمير",
      paidAt: "2026-09-01",
      journalEntryId: "je-exp-301",
    },
    {
      id: "exp-302",
      expenseNumber: "EXP-2026-302",
      date: "2026-09-18",
      categoryId: "cat-marketing",
      categoryName: "إعلانات وتسويق رقمي ومشاهير",
      accountCode: "6040",
      amount: 75000,
      taxRate: 0.14,
      taxAmount: 10500,
      totalAmount: 85500,
      paymentMethod: "CARD",
      paidFromId: "bank-cib",
      paidFromName: "بنك CIB - الحساب التجاري",
      branchId: "all-branches",
      branchName: "الإدارة المركزية",
      costCenterId: "cc-marketing",
      costCenterName: "إدارة التسويق والحملات الرقمية",
      vendorName: "Meta Platforms Ireland / وكالة ميديا سبيس",
      vendorTaxId: "591029384",
      invoiceNumber: "META-INV-883019",
      description: "حملة إعلانية ممولة على فيسبوك وإنستغرام لموسم خريف 2026 لتوليد عملاء محتملين للصالونات",
      status: "PAID",
      requestedBy: "نورهان هشام",
      approvedBy: "أحمد سمير",
      paidAt: "2026-09-18",
      journalEntryId: "je-exp-302",
      isUnusual: true,
      unusualReason: "المصروفات الإعلانية أعلى بنسبة 24% من متوسط الثلاثة أشهر السابقة بسبب إطلاق كولكشن الخريف",
    },
    {
      id: "exp-303",
      expenseNumber: "EXP-2026-303",
      date: "2026-09-20",
      categoryId: "cat-logistics",
      categoryName: "صيانة أسطول الشحن والوقود",
      accountCode: "6050",
      amount: 14500,
      taxRate: 0.14,
      taxAmount: 2030,
      totalAmount: 16530,
      paymentMethod: "CASH",
      paidFromId: "tr-cairo",
      paidFromName: "خزينة فرع التجمع الخامس",
      branchId: "branch-cairo",
      branchName: "فرع التجمع الرئيسي",
      costCenterId: "cc-damietta",
      costCenterName: "مستودع ومصنع دمياط",
      vendorName: "مركز الأهرام لصيانة شاحنات النقل الجامبو",
      vendorTaxId: "201948271",
      invoiceNumber: "AHRAM-5510",
      description: "عمرة فرامل وتغيير طقم كاوتش كامل للشاحنة رقم (ط ر ب 8412)",
      status: "PAID",
      requestedBy: "كريم يوسف",
      approvedBy: "أحمد سمير",
      paidAt: "2026-09-20",
      journalEntryId: "je-exp-303",
    },
    {
      id: "exp-304",
      expenseNumber: "EXP-2026-304",
      date: "2026-09-22",
      categoryId: "cat-utilities",
      categoryName: "كهرباء ومرافق وضيافة الصالة",
      accountCode: "6030",
      amount: 8200,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 8200,
      paymentMethod: "CASH",
      paidFromId: "tr-october",
      paidFromName: "خزينة فرع 6 أكتوبر",
      branchId: "branch-october",
      branchName: "فرع 6 أكتوبر",
      costCenterId: "cc-october",
      costCenterName: "فرع 6 أكتوبر (المول)",
      vendorName: "شركة جنوب القاهرة لتوزيع الكهرباء",
      invoiceNumber: "ELEC-OCT-0922",
      description: "فاتورة استهلاك كهرباء معرض 6 أكتوبر لشهر أغسطس/سبتمبر",
      status: "PENDING_APPROVAL",
      requestedBy: "سارة المهدي",
    },
  ]);

  // Suppliers & Payables
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: "sup-01", code: "SUP-01", nameAr: "مؤسسة الرضوان لتجارة الأخشاب الزان والموسكي", contactPerson: "الحاج رضوان عبد العال", phone: "01001239876", taxNumber: "302918274", city: "دمياط", address: "المنطقة الصناعية - بجوار الغرفة التجارية", accountCode: "2010", totalPurchases: 1850000, totalPaid: 1650000, balance: 200000, creditLimit: 500000, paymentTermsDays: 45, category: "RAW_WOOD" },
    { id: "sup-02", code: "SUP-02", nameAr: "شركة أقمشة تكس ميديا للمفروشات والكتان", contactPerson: "م. حسام بدر", phone: "01112345678", taxNumber: "401928375", city: "المحلة الكبرى", address: "شارع البحر - المحلة الكبرى", accountCode: "2010", totalPurchases: 920000, totalPaid: 800000, balance: 120000, creditLimit: 250000, paymentTermsDays: 30, category: "FABRICS" },
    { id: "sup-03", code: "SUP-03", nameAr: "الرواد لإكسسوارات الأثاث والمقابض والميكانيزمات", contactPerson: "أ. ماجد فوزي", phone: "01229876543", taxNumber: "510293847", city: "القاهرة", address: "السبتية - وسط البلد", accountCode: "2010", totalPurchases: 450000, totalPaid: 450000, balance: 0, creditLimit: 150000, paymentTermsDays: 15, category: "HARDWARE" },
  ]);

  const [supplierBills, setSupplierBills] = useState<SupplierBill[]>([
    { id: "sb-101", billNumber: "BILL-2026-088", supplierId: "sup-01", supplierName: "مؤسسة الرضوان لتجارة الأخشاب الزان والموسكي", date: "2026-09-05", dueDate: "2026-10-20", subtotal: 175438, taxRate: 0.14, taxAmount: 24562, totalAmount: 200000, paidAmount: 0, remainingAmount: 200000, status: "UNPAID", referenceOrder: "PO-2026-0512", journalEntryId: "je-sb-101" },
    { id: "sb-102", billNumber: "BILL-2026-089", supplierId: "sup-02", supplierName: "شركة أقمشة تكس ميديا للمفروشات والكتان", date: "2026-09-12", dueDate: "2026-10-12", subtotal: 105263, taxRate: 0.14, taxAmount: 14737, totalAmount: 120000, paidAmount: 0, remainingAmount: 120000, status: "UNPAID", referenceOrder: "PO-2026-0518", journalEntryId: "je-sb-102" },
  ]);

  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>([]);

  // Journal Entries (Balanced, Egyptian Showroom Reality)
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([
    {
      id: "je-sale-101",
      entryNumber: "JE-2026-0901",
      date: "2026-09-21",
      reference: "INV-2026-1044",
      sourceModule: "CONTRACT",
      sourceTransactionId: "RWQ-2026-8801",
      description: "إثبات فاتورة مبيعات صالون ملكي لشركة إعمار مصر شاملة القيمة المضافة 14% والتكلفة",
      lines: [
        { id: "jl-1", accountCode: "2020", accountNameAr: "أمانات ومقدمات عملاء (عرابين)", debit: 60000, credit: 0, description: "تسوية العربون المسدد مسبقاً" },
        { id: "jl-2", accountCode: "1030", accountNameAr: "مدينون وحسابات عملاء (أقساط)", debit: 179400, credit: 0, description: "المستحق على شركة إعمار بالتقسيط" },
        { id: "jl-3", accountCode: "4010", accountNameAr: "إيرادات مبيعات معارض الأثاث", debit: 0, credit: 210000, description: "صافي إيراد بيع الصالون بعد الخصم" },
        { id: "jl-4", accountCode: "2030", accountNameAr: "ضريبة القيمة المضافة المستحقة (مخرجات 14%)", debit: 0, credit: 29400, description: "قيمة مضافة 14% مصلحة الضرائب" },
        { id: "jl-5", accountCode: "5010", accountNameAr: "تكلفة البضاعة المباعة (COGS)", debit: 125000, credit: 0, description: "تكلفة تصنيع الصالون وخامات الزان" },
        { id: "jl-6", accountCode: "1040", accountNameAr: "مخزون المعارض والأثاث الجاهز والخامات", debit: 0, credit: 125000, description: "صرف المخزون المباع من مستودع دمياط" },
      ],
      totalDebit: 364400,
      totalCredit: 364400,
      branchId: "branch-cairo",
      branchName: "فرع التجمع الرئيسي",
      costCenterId: "cc-cairo",
      costCenterName: "فرع التجمع الخامس (الرئيسي)",
      status: "POSTED",
      createdBy: "كريم يوسف",
      createdAt: "2026-09-21T14:30:00Z",
      postedAt: "2026-09-21T14:30:00Z",
      postedBy: "النظام المحاسبي الآلي",
    },
    {
      id: "je-exp-301",
      entryNumber: "JE-2026-0902",
      date: "2026-09-01",
      reference: "EXP-2026-301",
      sourceModule: "EXPENSE",
      sourceTransactionId: "EXP-2026-301",
      description: "سداد إيجار معرض التجمع الخامس لشهر سبتمبر 2026",
      lines: [
        { id: "jl-7", accountCode: "6010", accountNameAr: "إيجارات معارض ومستودعات", debit: 180000, credit: 0, description: "إيجار معرض التجمع" },
        { id: "jl-8", accountCode: "1020", accountNameAr: "بنك CIB - الحساب التجاري الرئيسي", debit: 0, credit: 180000, description: "تحويل بنكي صادر للمؤجر" },
      ],
      totalDebit: 180000,
      totalCredit: 180000,
      branchId: "branch-cairo",
      branchName: "فرع التجمع الرئيسي",
      costCenterId: "cc-cairo",
      costCenterName: "فرع التجمع الخامس (الرئيسي)",
      status: "POSTED",
      createdBy: "المحاسب المالي",
      createdAt: "2026-09-01T10:00:00Z",
      postedAt: "2026-09-01T10:00:00Z",
      postedBy: "أحمد سمير",
    },
    {
      id: "je-exp-302",
      entryNumber: "JE-2026-0903",
      date: "2026-09-18",
      reference: "EXP-2026-302",
      sourceModule: "EXPENSE",
      sourceTransactionId: "EXP-2026-302",
      description: "إثبات مصروفات إعلانات ميتا لشهر سبتمبر وضريبة المدخلات القابلة للخصم",
      lines: [
        { id: "jl-9", accountCode: "6040", accountNameAr: "تسويق وإعلانات ميتا وتيك توك وجوجل", debit: 75000, credit: 0, description: "إعلانات موسم الخريف" },
        { id: "jl-10", accountCode: "1060", accountNameAr: "ضريبة القيمة المضافة القابلة للخصم (مدخلات 14%)", debit: 10500, credit: 0, description: "ضريبة مدخلات فاتورة ميتا" },
        { id: "jl-11", accountCode: "1020", accountNameAr: "بنك CIB - الحساب التجاري الرئيسي", debit: 0, credit: 85500, description: "سداد عبر بطاقة ائتمان الشركة" },
      ],
      totalDebit: 85500,
      totalCredit: 85500,
      branchId: "all-branches",
      branchName: "الإدارة المركزية",
      costCenterId: "cc-marketing",
      costCenterName: "إدارة التسويق والحملات الرقمية",
      status: "POSTED",
      createdBy: "نورهان هشام",
      createdAt: "2026-09-18T12:00:00Z",
      postedAt: "2026-09-18T12:00:00Z",
      postedBy: "أحمد سمير",
    },
  ]);

  // Smart Finance Insights (Reason-first)
  const [insights, setInsights] = useState<SmartFinanceInsight[]>([
    {
      id: "ins-01",
      title: "مستحقات عملاء متأخرة واجبة المتابعة",
      description: "يوجد 83,000 ج.م أقساط متأخرة تجاوزت موعد استحقاقها بأكثر من 7 أيام تخص 2 عملاء.",
      severity: "HIGH",
      category: "RECEIVABLES",
      whyExplanation: "العميل 'طارق عبد المجيد' متأخر بقسط 35,000 ج.م منذ 12 يوماً، والعميلة 'د. نجلاء رضوان' متأخرة بقسط 48,000 ج.م منذ 10 أيام.",
      actionLabel: "عرض جدول الأقساط والتواصل",
      actionHref: "/dashboard/finance/installments",
      resolved: false,
      createdAt: "2026-09-22T08:00:00Z",
    },
    {
      id: "ins-02",
      title: "خزينة فرع طنطا أقل من الحد التشغيلي الأدنى",
      description: "رصيد خزينة فرع طنطا الحالي (22,000 ج.م) هبط تحت الحد الأدنى للأمان المحدد (30,000 ج.م).",
      severity: "HIGH",
      category: "CASH",
      whyExplanation: "بسبب سداد مصاريف صيانة وعهدة تشغيلية دون تحصيل نقدية كافية اليوم. يوجد طلب تحويل مالي بقيمة 25,000 ج.م ينتظر الاعتماد.",
      actionLabel: "اعتماد تغذية الخزينة",
      actionHref: "/dashboard/finance/treasury",
      resolved: false,
      createdAt: "2026-09-22T09:30:00Z",
    },
    {
      id: "ins-03",
      title: "ارتفاع مصروفات التسويق والإعلانات هذا الشهر",
      description: "بند التسويق وإعلانات ميتا (210,000 ج.م) ارتفع بنسبة 24% عن متوسط الثلاثة أشهر الماضية (169,000 ج.م).",
      severity: "MEDIUM",
      category: "EXPENSES",
      whyExplanation: "تم ضخ ميزانية إعلانية إضافية لإطلاق كولكشن صالونات خريف 2026؛ وقد ساهمت الحملة في زيادة طلبات المعاينة بنسبة 35%.",
      actionLabel: "فحص تحليل المصروفات",
      actionHref: "/dashboard/finance/expenses",
      resolved: false,
      createdAt: "2026-09-22T10:00:00Z",
    },
    {
      id: "ins-04",
      title: "تحصيلات نقدية وأقساط متوقعة خلال الـ 7 أيام القادمة",
      description: "من المتوقع تحصيل 240,000 ج.م تشمل أقساط مستحقة وعرابين تعاقدات جاهزة للتسليم.",
      severity: "INFO",
      category: "INSTALLMENTS",
      whyExplanation: "تشمل قسط د. هاني ممدوح (60,000 ج.م) وقسط م. أشرف (42,000 ج.م) بالإضافة لـ 138,000 ج.م دفعات استلام طلبات شحن.",
      actionLabel: "متابعة سندات القبض",
      actionHref: "/dashboard/finance/receipts",
      resolved: false,
      createdAt: "2026-09-22T11:00:00Z",
    },
    {
      id: "ins-05",
      title: "فاتورة إلكترونية مرفوضة من مصلحة الضرائب المصرية",
      description: "الفاتورة رقم INV-2026-1046 الموجهة لشركة النيل تم رفضها من بوابات المنظومة الضريبية.",
      severity: "HIGH",
      category: "TAX",
      whyExplanation: "السبب المذكور من مصلحة الضرائب: كود الصنف 'TABLE-OAK-04' غير مكود بنظام EGS المعياري المعتمد.",
      actionLabel: "تصحيح الكود وإعادة الإرسال",
      actionHref: "/dashboard/finance/taxes",
      resolved: false,
      createdAt: "2026-09-22T13:50:00Z",
    },
  ]);

  // Accounting Periods
  const [periods, setPeriods] = useState<AccountingPeriod[]>([
    { id: "period-2026-08", nameAr: "أغسطس 2026", code: "2026-08", startDate: "2026-08-01", endDate: "2026-08-31", status: "CLOSED", closedAt: "2026-09-05 18:00", closedBy: "أحمد سمير", lockedEntriesCount: 142, closingNotes: "تم إقفال الشهر وترحيل الإقرارات الضريبية والمطابقات البنكية بنجاح." },
    { id: "period-2026-09", nameAr: "سبتمبر 2026 (الشهر الحالي)", code: "2026-09", startDate: "2026-09-01", endDate: "2026-09-30", status: "OPEN", lockedEntriesCount: 0 },
    { id: "period-2026-10", nameAr: "أكتوبر 2026", code: "2026-10", startDate: "2026-10-01", endDate: "2026-10-31", status: "OPEN", lockedEntriesCount: 0 },
  ]);

  const activePeriod = periods.find((p) => p.status === "OPEN") || periods[1];

  // Account Mapping Configuration
  const [accountMappings, setAccountMappings] = useState<AccountMappingConfig>({
    productCategories: [
      { category: "صالونات وأنتريهات", salesAccount: "4010", cogsAccount: "5010", inventoryAccount: "1040", vatAccount: "2030" },
      { category: "غرف نوم ماستر", salesAccount: "4010", cogsAccount: "5010", inventoryAccount: "1040", vatAccount: "2030" },
      { category: "غرف طعام وسفرة", salesAccount: "4010", cogsAccount: "5010", inventoryAccount: "1040", vatAccount: "2030" },
      { category: "ديكورات وإكسسوارات", salesAccount: "4010", cogsAccount: "5010", inventoryAccount: "1040", vatAccount: "2030" },
    ],
    paymentMethods: [
      { method: "CASH", targetAccountCode: "1010", targetName: "خزينة فرع التجمع الخامس" },
      { method: "BANK_TRANSFER", targetAccountCode: "1020", targetName: "بنك CIB - الحساب التجاري" },
      { method: "CARD", targetAccountCode: "1021", targetName: "بنك مصر - ماكينات POS" },
      { method: "INSTAPAY", targetAccountCode: "1020", targetName: "بنك CIB - انستاباي" },
      { method: "VALU", targetAccountCode: "1021", targetName: "بنك مصر - تحصيلات فاليو" },
    ],
    expenseCategories: [
      { category: "إيجارات", accountCode: "6010", vatAccountCode: "1060" },
      { category: "رواتب وعمولات", accountCode: "6020", vatAccountCode: "1060" },
      { category: "تسويق وإعلانات", accountCode: "6040", vatAccountCode: "1060" },
      { category: "مرافق وضيافة", accountCode: "6030", vatAccountCode: "1060" },
      { category: "صيانة أسطول الشحن", accountCode: "6050", vatAccountCode: "1060" },
    ],
    defaultAdvanceAccount: "2020",
    defaultReceivableAccount: "1030",
    defaultPayableAccount: "2010",
    defaultVatOutputAccount: "2030",
    defaultVatInputAccount: "1060",
  });

  // Calculate live financial metrics
  const financialSummary = useMemo(() => {
    const totalCashInTreasuries = treasuries.reduce((sum, t) => sum + t.currentBalance, 0);
    const totalCashInBanks = bankAccounts.reduce((sum, b) => sum + b.currentBalance, 0);
    const totalLiquidCash = totalCashInTreasuries + totalCashInBanks;

    const salesAccount = accounts.find((a) => a.code === "4010");
    const deliveryRevenueAccount = accounts.find((a) => a.code === "4020");
    const discountAccount = accounts.find((a) => a.code === "4040");
    const cogsAccount = accounts.find((a) => a.code === "5010");
    const directLogisticsAccount = accounts.find((a) => a.code === "5020");

    const totalSalesMonth = (salesAccount?.currentBalance || 0) + (deliveryRevenueAccount?.currentBalance || 0);
    const totalDiscounts = discountAccount?.currentBalance || 0;
    const totalNetSalesMonth = totalSalesMonth - totalDiscounts;

    const totalCOGS = (cogsAccount?.currentBalance || 0) + (directLogisticsAccount?.currentBalance || 0);
    const grossProfit = totalNetSalesMonth - totalCOGS;
    const grossMarginPercent = totalNetSalesMonth > 0 ? (grossProfit / totalNetSalesMonth) * 100 : 0;

    const expenseAccounts = accounts.filter((a) => a.category === "EXPENSE");
    const totalExpensesMonth = expenseAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
    const operatingProfit = grossProfit - totalExpensesMonth;
    const netProfit = operatingProfit; // Before taxes/depr
    const netMarginPercent = totalNetSalesMonth > 0 ? (netProfit / totalNetSalesMonth) * 100 : 0;

    const vatOutputAccount = accounts.find((a) => a.code === "2030");
    const vatInputAccount = accounts.find((a) => a.code === "1060");
    const totalVatOutputMonth = vatOutputAccount?.currentBalance || 0;
    const totalVatInputMonth = vatInputAccount?.currentBalance || 0;
    const netVatPosition = totalVatOutputMonth - totalVatInputMonth; // Positive = Due to ETA

    const receivablesAccount = accounts.find((a) => a.code === "1030");
    const totalCustomerReceivables = receivablesAccount?.currentBalance || 0;
    const overdueList = customerInstallments.filter((i) => i.status === "OVERDUE");
    const totalOverdueReceivables = overdueList.reduce((sum, i) => sum + i.remainingAmount, 0);

    const advancesAccount = accounts.find((a) => a.code === "2020");
    const totalCustomerAdvancesHeld = advancesAccount?.currentBalance || 0;

    return {
      totalCashInTreasuries,
      totalCashInBanks,
      totalLiquidCash,
      totalSalesMonth,
      totalNetSalesMonth,
      totalVatOutputMonth,
      totalVatInputMonth,
      netVatPosition,
      totalCustomerReceivables,
      totalOverdueReceivables,
      totalCustomerAdvancesHeld,
      totalExpensesMonth,
      grossProfit,
      operatingProfit,
      netProfit,
      grossMarginPercent,
      netMarginPercent,
    };
  }, [accounts, treasuries, bankAccounts, customerInstallments]);

  // Actions
  const addAccount = (accountData: Omit<Account, "currentBalance">) => {
    const newAcc: Account = {
      ...accountData,
      currentBalance: 0,
    };
    setAccounts((prev) => [...prev, newAcc]);
  };

  const updateAccount = (code: string, updates: Partial<Account>) => {
    setAccounts((prev) => prev.map((a) => (a.code === code ? { ...a, ...updates } : a)));
  };

  const createJournalEntry = (entryData: Omit<JournalEntry, "id" | "entryNumber" | "createdAt">) => {
    const newEntryNumber = `JE-2026-${(journalEntries.length + 904).toString().padStart(4, "0")}`;
    const newEntry: JournalEntry = {
      ...entryData,
      id: `je-${Date.now()}`,
      entryNumber: newEntryNumber,
      createdAt: new Date().toISOString(),
    };

    setJournalEntries((prev) => [newEntry, ...prev]);

    // If posted immediately, update account balances
    if (newEntry.status === "POSTED") {
      updateAccountsFromJournal(newEntry.lines, false);
    }

    return newEntry;
  };

  const updateAccountsFromJournal = (lines: JournalLine[], isReversal: boolean) => {
    setAccounts((prevAccounts) => {
      const updated = [...prevAccounts];
      for (const line of lines) {
        const accIdx = updated.findIndex((a) => a.code === line.accountCode);
        if (accIdx !== -1) {
          const acc = updated[accIdx];
          const debitEffect = isReversal ? -line.debit : line.debit;
          const creditEffect = isReversal ? -line.credit : line.credit;

          if (acc.isDebitNormal) {
            acc.currentBalance += debitEffect - creditEffect;
          } else {
            acc.currentBalance += creditEffect - debitEffect;
          }
        }
      }
      return updated;
    });
  };

  const postJournalEntry = (id: string, user: string) => {
    const target = journalEntries.find((je) => je.id === id);
    if (!target || target.status === "POSTED") return;

    const { isBalanced } = validateJournalBalance(target.lines);
    if (!isBalanced) {
      throw new Error("لا يمكن ترحيل قيد غير متوازن (إجمالي المدين لا يساوي إجمالي الدائن)");
    }

    setJournalEntries((prev) =>
      prev.map((je) =>
        je.id === id
          ? {
              ...je,
              status: "POSTED",
              postedAt: new Date().toISOString(),
              postedBy: user,
            }
          : je
      )
    );

    updateAccountsFromJournal(target.lines, false);
  };

  const reverseJournalEntry = (id: string, user: string, reason: string): JournalEntry | null => {
    const target = journalEntries.find((je) => je.id === id);
    if (!target || target.status !== "POSTED") return null;

    const reversal = createReversalJournalEntry(target, user, reason);

    // Mark original as REVERSED
    setJournalEntries((prev) => [
      reversal,
      ...prev.map((je) =>
        je.id === id
          ? {
              ...je,
              status: "REVERSED" as const,
              reversedAt: new Date().toISOString(),
              reversedBy: user,
              reversalEntryId: reversal.id,
              reversalReason: reason,
            }
          : je
      ),
    ]);

    // Apply reversal balance changes
    updateAccountsFromJournal(reversal.lines, false);

    return reversal;
  };

  const createCustomerAdvance = (
    advanceData: Omit<CustomerAdvance, "id" | "advanceNumber" | "settledAmount" | "remainingAmount" | "status">
  ) => {
    const advanceNumber = `ADV-${(customerAdvances.length + 5015).toString()}`;
    const newAdvance: CustomerAdvance = {
      ...advanceData,
      id: `adv-${Date.now()}`,
      advanceNumber,
      settledAmount: 0,
      remainingAmount: advanceData.amount,
      status: "ACTIVE",
    };

    // 1. Generate automated balanced journal entry
    const journal = generateCustomerAdvanceJournal({
      advanceNumber,
      contractOrderNumber: advanceData.orderNumber || "عقد مباشر",
      customerName: advanceData.customerName,
      amount: advanceData.amount,
      paymentMethod: advanceData.paymentMethod,
      treasuryAccountCode: advanceData.treasuryOrBankId.startsWith("bank") ? "1020" : "1010",
      treasuryName: advanceData.treasuryOrBankName,
      branchId: "branch-cairo",
      branchName: "فرع التجمع الرئيسي",
      costCenterId: "cc-cairo",
      costCenterName: "فرع التجمع الخامس",
      user: "كاشير الصالة",
    });

    createJournalEntry(journal);
    newAdvance.journalEntryId = journal.id;

    // 2. Create Receipt Voucher automatically
    const receiptNumber = `REC-${(receipts.length + 8841).toString()}`;
    const newReceipt: ReceiptVoucher = {
      id: `rec-${Date.now()}`,
      receiptNumber,
      date: advanceData.date,
      customerId: advanceData.customerId,
      customerName: advanceData.customerName,
      customerPhone: advanceData.customerPhone,
      contractId: advanceData.contractId,
      orderNumber: advanceData.orderNumber,
      amount: advanceData.amount,
      paymentMethod: advanceData.paymentMethod,
      treasuryOrBankId: advanceData.treasuryOrBankId,
      treasuryOrBankName: advanceData.treasuryOrBankName,
      referenceNumber: `ADV-${advanceNumber}`,
      notes: advanceData.notes || `تحصيل عربون عقد أثاث #${advanceData.orderNumber}`,
      receivedBy: "كاشير الصالة",
      type: "CONTRACT_DEPOSIT",
      advanceId: newAdvance.id,
      journalEntryId: journal.id,
      printCount: 1,
    };
    setReceipts((prev) => [newReceipt, ...prev]);
    newAdvance.receiptVoucherId = newReceipt.id;

    // 3. Update Treasury Balance
    if (advanceData.treasuryOrBankId.startsWith("bank")) {
      setBankAccounts((prev) =>
        prev.map((b) =>
          b.id === advanceData.treasuryOrBankId
            ? { ...b, currentBalance: b.currentBalance + advanceData.amount }
            : b
        )
      );
    } else {
      setTreasuries((prev) =>
        prev.map((t) =>
          t.id === advanceData.treasuryOrBankId
            ? { ...t, currentBalance: t.currentBalance + advanceData.amount }
            : t
        )
      );
    }

    setCustomerAdvances((prev) => [newAdvance, ...prev]);
    return newAdvance;
  };

  const settleCustomerAdvance = (advanceId: string, invoiceId: string, amount: number) => {
    setCustomerAdvances((prev) =>
      prev.map((adv) => {
        if (adv.id === advanceId) {
          const newSettled = adv.settledAmount + amount;
          const newRemaining = Math.max(0, adv.amount - newSettled);
          return {
            ...adv,
            settledAmount: newSettled,
            remainingAmount: newRemaining,
            status: newRemaining === 0 ? ("SETTLED" as const) : ("PARTIALLY_SETTLED" as const),
          };
        }
        return adv;
      })
    );
  };

  const createReceiptVoucher = (
    receiptData: Omit<ReceiptVoucher, "id" | "receiptNumber" | "printCount">
  ) => {
    const receiptNumber = `REC-${(receipts.length + 8842).toString()}`;
    const newReceipt: ReceiptVoucher = {
      ...receiptData,
      id: `rec-${Date.now()}`,
      receiptNumber,
      printCount: 1,
    };

    // 1. Generate Journal Entry
    const journal = generateCollectionReceiptJournal({
      receiptNumber,
      customerName: receiptData.customerName,
      contractOrderNumber: receiptData.orderNumber || "تحصيل عام",
      amount: receiptData.amount,
      paymentMethod: receiptData.paymentMethod,
      treasuryAccountCode: receiptData.treasuryOrBankId.startsWith("bank") ? "1020" : "1010",
      treasuryName: receiptData.treasuryOrBankName,
      branchId: "branch-cairo",
      branchName: "فرع التجمع الرئيسي",
      costCenterId: "cc-cairo",
      costCenterName: "فرع التجمع الخامس",
      user: receiptData.receivedBy || "كاشير الصالة",
    });

    createJournalEntry(journal);
    newReceipt.journalEntryId = journal.id;

    // 2. Update Installment if linked
    if (receiptData.installmentId) {
      setCustomerInstallments((prev) =>
        prev.map((inst) =>
          inst.id === receiptData.installmentId
            ? {
                ...inst,
                paidAmount: inst.paidAmount + receiptData.amount,
                remainingAmount: Math.max(0, inst.amount - (inst.paidAmount + receiptData.amount)),
                status: inst.paidAmount + receiptData.amount >= inst.amount ? ("PAID" as const) : inst.status,
                paidDate: new Date().toISOString().split("T")[0],
                receiptId: newReceipt.id,
              }
            : inst
        )
      );
    }

    // 3. Update Treasury/Bank balance
    if (receiptData.treasuryOrBankId.startsWith("bank")) {
      setBankAccounts((prev) =>
        prev.map((b) =>
          b.id === receiptData.treasuryOrBankId
            ? { ...b, currentBalance: b.currentBalance + receiptData.amount }
            : b
        )
      );
    } else {
      setTreasuries((prev) =>
        prev.map((t) =>
          t.id === receiptData.treasuryOrBankId
            ? { ...t, currentBalance: t.currentBalance + receiptData.amount }
            : t
        )
      );
    }

    setReceipts((prev) => [newReceipt, ...prev]);
    return newReceipt;
  };

  const createExpense = (expenseData: Omit<Expense, "id" | "expenseNumber" | "status">) => {
    const expenseNumber = `EXP-2026-${(expenses.length + 305).toString()}`;
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      expenseNumber,
      status: activeRole === "FINANCE_MANAGER" || activeRole === "ADMIN" ? "APPROVED" : "PENDING_APPROVAL",
    };

    setExpenses((prev) => [newExpense, ...prev]);
    return newExpense;
  };

  const approveExpense = (id: string, user: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "APPROVED", approvedBy: user } : e))
    );
  };

  const payExpense = (id: string, user: string) => {
    const target = expenses.find((e) => e.id === id);
    if (!target) return;

    // 1. Generate Journal Entry
    const journal = generateExpenseJournal({
      expenseNumber: target.expenseNumber,
      vendorName: target.vendorName,
      categoryName: target.categoryName,
      expenseAccountCode: target.accountCode,
      expenseAccountName: target.categoryName,
      netAmount: target.amount,
      taxAmount: target.taxAmount,
      totalAmount: target.totalAmount,
      paidFromAccountCode: target.paidFromId.startsWith("bank") ? "1020" : "1010",
      paidFromAccountName: target.paidFromName,
      branchId: target.branchId,
      branchName: target.branchName,
      costCenterId: target.costCenterId,
      costCenterName: target.costCenterName,
      user,
    });

    createJournalEntry(journal);

    // 2. Deduct from Treasury/Bank
    if (target.paidFromId.startsWith("bank")) {
      setBankAccounts((prev) =>
        prev.map((b) =>
          b.id === target.paidFromId ? { ...b, currentBalance: b.currentBalance - target.totalAmount } : b
        )
      );
    } else {
      setTreasuries((prev) =>
        prev.map((t) =>
          t.id === target.paidFromId ? { ...t, currentBalance: t.currentBalance - target.totalAmount } : t
        )
      );
    }

    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: "PAID",
              paidAt: new Date().toISOString().split("T")[0],
              journalEntryId: journal.id,
            }
          : e
      )
    );
  };

  const createTreasuryTransfer = (
    transferData: Omit<TreasuryTransfer, "id" | "transferNumber" | "status">
  ) => {
    const transferNumber = `TR-2026-${(treasuryTransfers.length + 46).toString().padStart(3, "0")}`;
    const newTransfer: TreasuryTransfer = {
      ...transferData,
      id: `trf-${Date.now()}`,
      transferNumber,
      status: "PENDING_APPROVAL",
    };

    setTreasuryTransfers((prev) => [newTransfer, ...prev]);
    return newTransfer;
  };

  const approveTreasuryTransfer = (id: string, user: string) => {
    const target = treasuryTransfers.find((t) => t.id === id);
    if (!target) return;

    // 1. Generate Balanced Journal Entry
    const journal = generateTreasuryTransferJournal({
      transferNumber: target.transferNumber,
      fromAccountCode: target.fromType === "BANK" ? "1020" : "1010",
      fromAccountName: target.fromName,
      toAccountCode: target.toType === "BANK" ? "1020" : "1010",
      toAccountName: target.toName,
      amount: target.amount,
      reference: target.reference,
      branchId: "branch-cairo",
      branchName: "الإدارة المركزية",
      costCenterId: "cc-admin",
      costCenterName: "الإدارة العامة",
      user,
    });

    createJournalEntry(journal);

    // 2. Adjust Source Balance
    if (target.fromType === "BANK") {
      setBankAccounts((prev) =>
        prev.map((b) => (b.id === target.fromId ? { ...b, currentBalance: b.currentBalance - target.amount } : b))
      );
    } else {
      setTreasuries((prev) =>
        prev.map((t) => (t.id === target.fromId ? { ...t, currentBalance: t.currentBalance - target.amount } : t))
      );
    }

    // 3. Adjust Destination Balance
    if (target.toType === "BANK") {
      setBankAccounts((prev) =>
        prev.map((b) => (b.id === target.toId ? { ...b, currentBalance: b.currentBalance + target.amount } : b))
      );
    } else {
      setTreasuries((prev) =>
        prev.map((t) => (t.id === target.toId ? { ...t, currentBalance: t.currentBalance + target.amount } : t))
      );
    }

    setTreasuryTransfers((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: "COMPLETED",
              approvedBy: user,
              completedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
              journalEntryId: journal.id,
            }
          : t
      )
    );
  };

  const createReconciliation = (recData: Omit<TreasuryReconciliation, "id">) => {
    const newRec: TreasuryReconciliation = {
      ...recData,
      id: `rec-${Date.now()}`,
    };
    setReconciliations((prev) => [newRec, ...prev]);
  };

  const createSupplierBill = (
    billData: Omit<SupplierBill, "id" | "billNumber" | "paidAmount" | "remainingAmount" | "status">
  ) => {
    const billNumber = `BILL-2026-${(supplierBills.length + 90).toString().padStart(3, "0")}`;
    const newBill: SupplierBill = {
      ...billData,
      id: `sb-${Date.now()}`,
      billNumber,
      paidAmount: 0,
      remainingAmount: billData.totalAmount,
      status: "UNPAID",
    };

    setSupplierBills((prev) => [newBill, ...prev]);

    // Increase supplier balance
    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === billData.supplierId
          ? {
              ...s,
              totalPurchases: s.totalPurchases + billData.totalAmount,
              balance: s.balance + billData.totalAmount,
            }
          : s
      )
    );

    return newBill;
  };

  const createSupplierPayment = (paymentData: Omit<SupplierPayment, "id" | "paymentNumber">) => {
    const paymentNumber = `SPAY-${(supplierPayments.length + 101).toString()}`;
    const newPay: SupplierPayment = {
      ...paymentData,
      id: `spay-${Date.now()}`,
      paymentNumber,
    };

    // Deduct from supplier balance
    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === paymentData.supplierId
          ? {
              ...s,
              totalPaid: s.totalPaid + paymentData.amount,
              balance: Math.max(0, s.balance - paymentData.amount),
            }
          : s
      )
    );

    // Update bill if linked
    if (paymentData.billId) {
      setSupplierBills((prev) =>
        prev.map((b) =>
          b.id === paymentData.billId
            ? {
                ...b,
                paidAmount: b.paidAmount + paymentData.amount,
                remainingAmount: Math.max(0, b.totalAmount - (b.paidAmount + paymentData.amount)),
                status: b.paidAmount + paymentData.amount >= b.totalAmount ? ("PAID" as const) : ("PARTIAL" as const),
              }
            : b
        )
      );
    }

    setSupplierPayments((prev) => [newPay, ...prev]);
    return newPay;
  };

  const updateTaxConfig = (id: string, updates: Partial<TaxRateConfig>) => {
    setTaxConfigs((prev) => prev.map((tc) => (tc.id === id ? { ...tc, ...updates } : tc)));
  };

  const submitInvoiceToETA = (invoiceId: string) => {
    const inv = etaInvoices.find((i) => i.id === invoiceId);
    if (!inv) return { success: false, message: "الفاتورة غير موجودة" };

    const validation = validateEgyptianInvoiceForETA(inv);
    if (!validation.isValid) {
      setEtaInvoices((prev) =>
        prev.map((i) => (i.id === invoiceId ? { ...i, etaStatus: "REJECTED", validationErrors: validation.errors } : i))
      );
      return {
        success: false,
        message: `تم رفض الفاتورة من منظومة الضرائب: ${validation.errors.join(" | ")}`,
      };
    }

    const uuid = `EGY-ETA-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const submissionId = `SUB-${Math.floor(1000000 + Math.random() * 9000000)}`;

    setEtaInvoices((prev) =>
      prev.map((i) =>
        i.id === invoiceId
          ? {
              ...i,
              etaStatus: "VALID",
              uuid,
              submissionId,
              dateTimeReceived: new Date().toISOString(),
              signatureToken: `MIIEVwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSl...EGY_LIVE_${Date.now()}`,
              qrCodeUrl: `https://invoicing.eta.gov.eg/documents/${uuid}/share`,
              validationErrors: [],
            }
          : i
      )
    );

    return {
      success: true,
      message: `تم اعتماد وتوقيع الفاتورة بنجاح في مصلحة الضرائب المصرية بالرقم التعريفي الفريد UUID: ${uuid}`,
      uuid,
    };
  };

  const retryEtaSubmission = (invoiceId: string) => {
    // Fix any item codes for demonstration
    setEtaInvoices((prev) =>
      prev.map((i) => {
        if (i.id === invoiceId) {
          const updatedLines = i.lines.map((l) => ({
            ...l,
            itemCode: l.itemCode.startsWith("EG-") ? l.itemCode : `EG-11345678-${l.itemCode}`,
          }));
          return {
            ...i,
            lines: updatedLines,
            validationErrors: [],
            etaStatus: "VALID",
            uuid: `EGY-ETA-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            dateTimeReceived: new Date().toISOString(),
            signatureToken: `MIIEVwIBADANBgkqhkiG9w0BAQEFAASCBKkw...RETRY_OK`,
          };
        }
        return i;
      })
    );
  };

  const dismissInsight = (id: string) => {
    setInsights((prev) => prev.map((i) => (i.id === id ? { ...i, resolved: true } : i)));
  };

  const closeAccountingPeriod = (periodId: string, user: string, notes: string) => {
    setPeriods((prev) =>
      prev.map((p) =>
        p.id === periodId
          ? {
              ...p,
              status: "CLOSED",
              closedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
              closedBy: user,
              lockedEntriesCount: journalEntries.filter((je) => je.status === "POSTED").length,
              closingNotes: notes,
            }
          : p
      )
    );
  };

  const updateAccountMappings = (updates: Partial<AccountMappingConfig>) => {
    setAccountMappings((prev) => ({ ...prev, ...updates }));
  };

  // Smart Finance AI Query Engine (Arabic Dialect + Real Figures)
  const askFinanceAI = (query: string) => {
    const q = query.toLowerCase().trim();

    if (q.includes("طنطا") || q.includes("فرع طنطا")) {
      return {
        answer: "فرع طنطا حقق مبيعات إجمالية بلغت 1,120,000 ج.م هذا الشهر بهامش ربح إجمالي 38%. رصيد خزينة فرع طنطا الحالي 22,000 ج.م وهو أقل من الحد التشغيلي (30,000 ج.م)، ويوجد طلب تحويل عهدة بقيمة 25,000 ج.م ينتظر الاعتماد.",
        metrics: [
          { label: "مبيعات فرع طنطا", value: "1,120,000 ج.م", isGood: true },
          { label: "رصيد الخزينة", value: "22,000 ج.م", isGood: false },
          { label: "هامش الربح", value: "38%", isGood: true },
        ],
        relatedAction: { label: "فحص خزينة فرع طنطا", href: "/dashboard/finance/treasury" },
      };
    }

    if (q.includes("متأخر") || q.includes("أقساط") || q.includes("مين عليه")) {
      return {
        answer: "إجمالي الأقساط المتأخرة حالياً 83,000 ج.م تخص عميلين:\n1. طارق عبد المجيد (35,000 ج.م - متأخر 12 يوماً - عقد RWQ-2026-8790)\n2. د. نجلاء محمود (48,000 ج.م - متأخر 10 أيام - عقد RWQ-2026-8785).",
        metrics: [
          { label: "إجمالي المتأخرات", value: "83,000 ج.م", isGood: false },
          { label: "عدد الأقساط المتأخرة", value: "2 قسط", isGood: false },
        ],
        relatedAction: { label: "عرض جدول الأقساط ومتابعة التحصيل", href: "/dashboard/finance/installments" },
      };
    }

    if (q.includes("عربون") || q.includes("عرابين") || q.includes("مقدم")) {
      return {
        answer: `إجمالي العرابين ومقدمات الحجز المحتفظ بها حالياً كالتزامات محاسبية على الشركة يبلغ ${financialSummary.totalCustomerAdvancesHeld.toLocaleString()} ج.م، تم تسوية 60,000 ج.م منها مع فواتير هذا الشهر ويتبقى 120,000 ج.م لعقود قيد التصنيع والتجهيز.`,
        metrics: [
          { label: "رصيد حساب العرابين (2020)", value: `${financialSummary.totalCustomerAdvancesHeld.toLocaleString()} ج.م`, isGood: true },
        ],
        relatedAction: { label: "عرض دفتر العرابين", href: "/dashboard/finance/receivables" },
      };
    }

    if (q.includes("مصروف") || q.includes("أكبر") || q.includes("مصاريف")) {
      return {
        answer: "أكبر 3 بنود مصروفات تشغيلية هذا الشهر هي:\n1. رواتب وعمولات المبيعات: 540,000 ج.م\n2. إيجارات المعارض والمستودعات: 480,000 ج.م\n3. تسويق وإعلانات ميتا وتيك توك: 210,000 ج.م (بزيادة 24% عن المتوسط).\nإجمالي المصروفات: 1,375,000 ج.م.",
        metrics: [
          { label: "إجمالي المصروفات", value: `${financialSummary.totalExpensesMonth.toLocaleString()} ج.م` },
          { label: "أعلى بند", value: "الرواتب والعمولات" },
        ],
        relatedAction: { label: "عرض تقرير المصروفات", href: "/dashboard/finance/expenses" },
      };
    }

    if (q.includes("ضريب") || q.includes("مرفوض") || q.includes("فاتورة إلكترونية") || q.includes("eta")) {
      return {
        answer: "موقف الفواتير الإلكترونية: تم إصدار واعتماد فواتير وإيصالات بقيمة ضريبية 49,000 ج.م بنجاح على بوابة الضرائب المصرية. توجد فاتورة واحدة مرفوضة (INV-2026-1046) بقيمة 205,200 ج.م لشركة النيل بسبب نقص كود الصنف EGS.",
        metrics: [
          { label: "مخرجات القيمة المضافة 14%", value: `${financialSummary.totalVatOutputMonth.toLocaleString()} ج.م` },
          { label: "الفواتير المرفوضة", value: "1 فاتورة", isGood: false },
        ],
        relatedAction: { label: "بوابة الفاتورة الإلكترونية", href: "/dashboard/finance/taxes" },
      };
    }

    if (q.includes("ربح") || q.includes("أرباح") || q.includes("مكسب") || q.includes("هامش")) {
      return {
        answer: `حقق رِواق هذا الشهر مبيعات صافية بقيمة ${financialSummary.totalNetSalesMonth.toLocaleString()} ج.م بتكلفة بضاعة مباعة (COGS) ${ (3760000).toLocaleString() } ج.م، مما يحقق مجمل ربح ${financialSummary.grossProfit.toLocaleString()} ج.م (هامش ${financialSummary.grossMarginPercent.toFixed(1)}%) وصافي ربح تشغيلي ${financialSummary.operatingProfit.toLocaleString()} ج.م (هامش ${financialSummary.netMarginPercent.toFixed(1)}%).`,
        metrics: [
          { label: "مجمل الربح", value: `${financialSummary.grossProfit.toLocaleString()} ج.م`, isGood: true },
          { label: "هامش مجمل الربح", value: `${financialSummary.grossMarginPercent.toFixed(1)}%`, isGood: true },
          { label: "صافي الربح", value: `${financialSummary.netProfit.toLocaleString()} ج.م`, isGood: true },
        ],
        relatedAction: { label: "عرض قائمة الدخل (P&L)", href: "/dashboard/finance/reports" },
      };
    }

    // Default intelligent response
    return {
      answer: `إليك ملخص مؤشرات رِواق المالية اللحظية:\n• إجمالي السيولة النقدية في الخزائن والبنوك: ${financialSummary.totalLiquidCash.toLocaleString()} ج.م\n• صافي مبيعات الشهر: ${financialSummary.totalNetSalesMonth.toLocaleString()} ج.م\n• مستحقات العملاء الإجمالية: ${financialSummary.totalCustomerReceivables.toLocaleString()} ج.م (منها ${financialSummary.totalOverdueReceivables.toLocaleString()} ج.م متأخرة)\n• صافي الموقف الضريبي للقيمة المضافة المستحقة لمصلحة الضرائب: ${financialSummary.netVatPosition.toLocaleString()} ج.م.`,
      metrics: [
        { label: "إجمالي السيولة", value: `${financialSummary.totalLiquidCash.toLocaleString()} ج.م`, isGood: true },
        { label: "صافي المبيعات", value: `${financialSummary.totalNetSalesMonth.toLocaleString()} ج.م`, isGood: true },
        { label: "صافي الربح", value: `${financialSummary.netProfit.toLocaleString()} ج.م`, isGood: true },
      ],
      relatedAction: { label: "لوحة التحكم المالية", href: "/dashboard/finance" },
    };
  };

  return (
    <FinanceContext.Provider
      value={{
        activeRole,
        setActiveRole,
        accounts,
        addAccount,
        updateAccount,
        journalEntries,
        createJournalEntry,
        postJournalEntry,
        reverseJournalEntry,
        costCenters,
        treasuries,
        bankAccounts,
        treasuryTransfers,
        reconciliations,
        createTreasuryTransfer,
        approveTreasuryTransfer,
        createReconciliation,
        customerAdvances,
        customerInstallments,
        receipts,
        createCustomerAdvance,
        settleCustomerAdvance,
        createReceiptVoucher,
        expenseCategories,
        expenses,
        createExpense,
        approveExpense,
        payExpense,
        suppliers,
        supplierBills,
        supplierPayments,
        createSupplierBill,
        createSupplierPayment,
        taxConfigs,
        etaInvoices,
        updateTaxConfig,
        submitInvoiceToETA,
        retryEtaSubmission,
        insights,
        dismissInsight,
        periods,
        activePeriod,
        closeAccountingPeriod,
        accountMappings,
        updateAccountMappings,
        financialSummary,
        askFinanceAI,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
