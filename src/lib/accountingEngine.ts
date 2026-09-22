// Rewaq ERP - Central Accounting & Egyptian Tax Engine

import {
  Account,
  JournalEntry,
  JournalLine,
  JournalSourceModule,
  TaxRateConfig,
  EtaInvoiceRecord,
  EtaInvoiceLine,
  AccountMappingConfig,
} from "@/types/finance";

/**
 * Validates that total debit exactly equals total credit in a journal entry.
 */
export function validateJournalBalance(lines: JournalLine[]): {
  isBalanced: boolean;
  totalDebit: number;
  totalCredit: number;
  difference: number;
} {
  const totalDebit = lines.reduce((acc, line) => acc + (Number(line.debit) || 0), 0);
  const totalCredit = lines.reduce((acc, line) => acc + (Number(line.credit) || 0), 0);
  const difference = Math.abs(Math.round((totalDebit - totalCredit) * 100) / 100);

  return {
    isBalanced: difference < 0.01,
    totalDebit: Math.round(totalDebit * 100) / 100,
    totalCredit: Math.round(totalCredit * 100) / 100,
    difference,
  };
}

/**
 * Generates an automated journal entry for a Customer Deposit / Advance payment.
 * Accounting rule: Dr. Cash/Bank (Asset) | Cr. Customer Advances (Liability)
 */
export function generateCustomerAdvanceJournal({
  advanceNumber,
  contractOrderNumber,
  customerName,
  amount,
  paymentMethod,
  treasuryAccountCode,
  treasuryName,
  branchId,
  branchName,
  costCenterId,
  costCenterName,
  user,
}: {
  advanceNumber: string;
  contractOrderNumber: string;
  customerName: string;
  amount: number;
  paymentMethod: string;
  treasuryAccountCode: string;
  treasuryName: string;
  branchId: string;
  branchName: string;
  costCenterId: string;
  costCenterName: string;
  user: string;
}): JournalEntry {
  const lines: JournalLine[] = [
    {
      id: `jl-${Date.now()}-1`,
      accountCode: treasuryAccountCode,
      accountNameAr: treasuryName,
      debit: amount,
      credit: 0,
      description: `تحصيل عربون تعاقد ${contractOrderNumber} - عميل: ${customerName} (${paymentMethod})`,
      branchId,
      costCenterId,
    },
    {
      id: `jl-${Date.now()}-2`,
      accountCode: "2020",
      accountNameAr: "أمانات ومقدمات عملاء (عرابين)",
      debit: 0,
      credit: amount,
      description: `إثبات التزام عربون تعاقد ${contractOrderNumber} للعميل: ${customerName}`,
      branchId,
      costCenterId,
    },
  ];

  return {
    id: `je-adv-${Date.now()}`,
    entryNumber: `JE-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split("T")[0],
    reference: advanceNumber,
    sourceModule: "CONTRACT",
    sourceTransactionId: contractOrderNumber,
    description: `عربون تعاقد أثاث رقم ${contractOrderNumber} - ${customerName}`,
    lines,
    totalDebit: amount,
    totalCredit: amount,
    branchId,
    branchName,
    costCenterId,
    costCenterName,
    status: "POSTED",
    createdBy: user,
    createdAt: new Date().toISOString(),
    postedAt: new Date().toISOString(),
    postedBy: user,
  };
}

/**
 * Generates an automated journal entry for a full POS / Contract Invoice Sale with VAT and COGS.
 * Accounting rule:
 * 1) Dr. Cash / Customer Receivable
 *    Cr. Sales Revenue
 *    Cr. Output VAT Payable (14%)
 * 2) Dr. Cost of Goods Sold (COGS)
 *    Cr. Inventory Asset
 */
export function generateSaleInvoiceJournal({
  invoiceNumber,
  customerName,
  netSalesAmount,
  vatAmount,
  totalAmount,
  paidCashOrDeposit,
  remainingReceivable,
  estimatedCostPrice,
  treasuryAccountCode,
  treasuryName,
  branchId,
  branchName,
  costCenterId,
  costCenterName,
  user,
}: {
  invoiceNumber: string;
  customerName: string;
  netSalesAmount: number;
  vatAmount: number;
  totalAmount: number;
  paidCashOrDeposit: number;
  remainingReceivable: number;
  estimatedCostPrice: number;
  treasuryAccountCode: string;
  treasuryName: string;
  branchId: string;
  branchName: string;
  costCenterId: string;
  costCenterName: string;
  user: string;
}): JournalEntry {
  const lines: JournalLine[] = [];

  // 1. Debit Payment/Advance settlement
  if (paidCashOrDeposit > 0) {
    lines.push({
      id: `jl-${Date.now()}-1`,
      accountCode: treasuryAccountCode,
      accountNameAr: treasuryName,
      debit: paidCashOrDeposit,
      credit: 0,
      description: `المدفوع نقداً/تسوية عربون للفاتورة ${invoiceNumber} - ${customerName}`,
      branchId,
      costCenterId,
    });
  }

  // 2. Debit Remaining as Accounts Receivable
  if (remainingReceivable > 0) {
    lines.push({
      id: `jl-${Date.now()}-2`,
      accountCode: "1030",
      accountNameAr: "مدينون وحسابات عملاء (آجل/أقساط)",
      debit: remainingReceivable,
      credit: 0,
      description: `المتبقي آجل على العميل ${customerName} - فاتورة ${invoiceNumber}`,
      branchId,
      costCenterId,
    });
  }

  // 3. Credit Net Sales Revenue
  lines.push({
    id: `jl-${Date.now()}-3`,
    accountCode: "4010",
    accountNameAr: "إيرادات مبيعات معارض الأثاث",
    debit: 0,
    credit: netSalesAmount,
    description: `إيراد بيع أثاث - فاتورة ${invoiceNumber}`,
    branchId,
    costCenterId,
  });

  // 4. Credit Output VAT Payable
  if (vatAmount > 0) {
    lines.push({
      id: `jl-${Date.now()}-4`,
      accountCode: "2030",
      accountNameAr: "ضريبة القيمة المضافة المحصلة (مخرجات 14%)",
      debit: 0,
      credit: vatAmount,
      description: `قيمة مضافة 14% مصلحة الضرائب المصرية - فاتورة ${invoiceNumber}`,
      branchId,
      costCenterId,
    });
  }

  // 5. Cost of Goods Sold & Inventory Deduction
  if (estimatedCostPrice > 0) {
    lines.push({
      id: `jl-${Date.now()}-5`,
      accountCode: "5010",
      accountNameAr: "تكلفة البضاعة المباعة (COGS)",
      debit: estimatedCostPrice,
      credit: 0,
      description: `إثبات تكلفة الأصناف المباعة للفاتورة ${invoiceNumber}`,
      branchId,
      costCenterId,
    });

    lines.push({
      id: `jl-${Date.now()}-6`,
      accountCode: "1040",
      accountNameAr: "مخزون الأثاث التام والخامات",
      debit: 0,
      credit: estimatedCostPrice,
      description: `خصم تكلفة المخزون المنصرف للفاتورة ${invoiceNumber}`,
      branchId,
      costCenterId,
    });
  }

  const { totalDebit, totalCredit } = validateJournalBalance(lines);

  return {
    id: `je-sale-${Date.now()}`,
    entryNumber: `JE-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split("T")[0],
    reference: invoiceNumber,
    sourceModule: "POS",
    sourceTransactionId: invoiceNumber,
    description: `فاتورة مبيعات أثاث ضريبية #${invoiceNumber} - العميل: ${customerName}`,
    lines,
    totalDebit,
    totalCredit,
    branchId,
    branchName,
    costCenterId,
    costCenterName,
    status: "POSTED",
    createdBy: user,
    createdAt: new Date().toISOString(),
    postedAt: new Date().toISOString(),
    postedBy: user,
  };
}

/**
 * Generates an automated journal entry for an Installment or Receivable collection.
 * Accounting rule: Dr. Cash/Bank (Asset) | Cr. Accounts Receivable (Asset reduction)
 */
export function generateCollectionReceiptJournal({
  receiptNumber,
  customerName,
  contractOrderNumber,
  installmentNumber,
  amount,
  paymentMethod,
  treasuryAccountCode,
  treasuryName,
  branchId,
  branchName,
  costCenterId,
  costCenterName,
  user,
}: {
  receiptNumber: string;
  customerName: string;
  contractOrderNumber: string;
  installmentNumber?: number;
  amount: number;
  paymentMethod: string;
  treasuryAccountCode: string;
  treasuryName: string;
  branchId: string;
  branchName: string;
  costCenterId: string;
  costCenterName: string;
  user: string;
}): JournalEntry {
  const installmentText = installmentNumber ? ` قسط رقم ${installmentNumber}` : "";
  const lines: JournalLine[] = [
    {
      id: `jl-${Date.now()}-1`,
      accountCode: treasuryAccountCode,
      accountNameAr: treasuryName,
      debit: amount,
      credit: 0,
      description: `تحصيل سند قبض ${receiptNumber} (${paymentMethod}) - عميل: ${customerName}`,
      branchId,
      costCenterId,
    },
    {
      id: `jl-${Date.now()}-2`,
      accountCode: "1030",
      accountNameAr: "مدينون وحسابات عملاء (آجل/أقساط)",
      debit: 0,
      credit: amount,
      description: `تسوية مستحق عقد ${contractOrderNumber}${installmentText} - ${customerName}`,
      branchId,
      costCenterId,
    },
  ];

  return {
    id: `je-col-${Date.now()}`,
    entryNumber: `JE-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split("T")[0],
    reference: receiptNumber,
    sourceModule: "CONTRACT",
    sourceTransactionId: contractOrderNumber,
    description: `سند قبض وتحصيل مستحق #${receiptNumber} - ${customerName}`,
    lines,
    totalDebit: amount,
    totalCredit: amount,
    branchId,
    branchName,
    costCenterId,
    costCenterName,
    status: "POSTED",
    createdBy: user,
    createdAt: new Date().toISOString(),
    postedAt: new Date().toISOString(),
    postedBy: user,
  };
}

/**
 * Generates an automated journal entry for an Operating Expense.
 * Accounting rule:
 * Dr. Expense Account (60xx)
 * Dr. Input VAT Recoverable (1060 - if taxable)
 * Cr. Treasury / Bank / Supplier Payable
 */
export function generateExpenseJournal({
  expenseNumber,
  vendorName,
  categoryName,
  expenseAccountCode,
  expenseAccountName,
  netAmount,
  taxAmount,
  totalAmount,
  paidFromAccountCode,
  paidFromAccountName,
  branchId,
  branchName,
  costCenterId,
  costCenterName,
  user,
}: {
  expenseNumber: string;
  vendorName: string;
  categoryName: string;
  expenseAccountCode: string;
  expenseAccountName: string;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidFromAccountCode: string;
  paidFromAccountName: string;
  branchId: string;
  branchName: string;
  costCenterId: string;
  costCenterName: string;
  user: string;
}): JournalEntry {
  const lines: JournalLine[] = [
    {
      id: `jl-${Date.now()}-1`,
      accountCode: expenseAccountCode,
      accountNameAr: expenseAccountName,
      debit: netAmount,
      credit: 0,
      description: `مصروف ${categoryName} - جهة الصرف: ${vendorName} #${expenseNumber}`,
      branchId,
      costCenterId,
    },
  ];

  if (taxAmount > 0) {
    lines.push({
      id: `jl-${Date.now()}-2`,
      accountCode: "1060",
      accountNameAr: "ضريبة القيمة المضافة القابلة للخصم (مدخلات 14%)",
      debit: taxAmount,
      credit: 0,
      description: `ضريبة مدخلات فاتورة مصروف ${expenseNumber} - ${vendorName}`,
      branchId,
      costCenterId,
    });
  }

  lines.push({
    id: `jl-${Date.now()}-3`,
    accountCode: paidFromAccountCode,
    accountNameAr: paidFromAccountName,
    debit: 0,
    credit: totalAmount,
    description: `سداد مصروف #${expenseNumber} - ${categoryName}`,
    branchId,
    costCenterId,
  });

  const { totalDebit, totalCredit } = validateJournalBalance(lines);

  return {
    id: `je-exp-${Date.now()}`,
    entryNumber: `JE-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split("T")[0],
    reference: expenseNumber,
    sourceModule: "EXPENSE",
    sourceTransactionId: expenseNumber,
    description: `إثبات وسداد مصروف ${categoryName} #${expenseNumber} - ${vendorName}`,
    lines,
    totalDebit,
    totalCredit,
    branchId,
    branchName,
    costCenterId,
    costCenterName,
    status: "POSTED",
    createdBy: user,
    createdAt: new Date().toISOString(),
    postedAt: new Date().toISOString(),
    postedBy: user,
  };
}

/**
 * Generates an automated journal entry for Inter-Treasury / Bank Transfer.
 * Accounting rule: Dr. Destination Treasury/Bank | Cr. Source Treasury/Bank
 */
export function generateTreasuryTransferJournal({
  transferNumber,
  fromAccountCode,
  fromAccountName,
  toAccountCode,
  toAccountName,
  amount,
  reference,
  branchId,
  branchName,
  costCenterId,
  costCenterName,
  user,
}: {
  transferNumber: string;
  fromAccountCode: string;
  fromAccountName: string;
  toAccountCode: string;
  toAccountName: string;
  amount: number;
  reference: string;
  branchId: string;
  branchName: string;
  costCenterId: string;
  costCenterName: string;
  user: string;
}): JournalEntry {
  const lines: JournalLine[] = [
    {
      id: `jl-${Date.now()}-1`,
      accountCode: toAccountCode,
      accountNameAr: toAccountName,
      debit: amount,
      credit: 0,
      description: `تحويل وارد من ${fromAccountName} (مرجع: ${reference})`,
      branchId,
      costCenterId,
    },
    {
      id: `jl-${Date.now()}-2`,
      accountCode: fromAccountCode,
      accountNameAr: fromAccountName,
      debit: 0,
      credit: amount,
      description: `تحويل صادر إلى ${toAccountName} #${transferNumber}`,
      branchId,
      costCenterId,
    },
  ];

  return {
    id: `je-tr-${Date.now()}`,
    entryNumber: `JE-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split("T")[0],
    reference: transferNumber,
    sourceModule: "TREASURY",
    sourceTransactionId: transferNumber,
    description: `تحويل مالي بين الخزائن/البنوك #${transferNumber}: ${fromAccountName} -> ${toAccountName}`,
    lines,
    totalDebit: amount,
    totalCredit: amount,
    branchId,
    branchName,
    costCenterId,
    costCenterName,
    status: "POSTED",
    createdBy: user,
    createdAt: new Date().toISOString(),
    postedAt: new Date().toISOString(),
    postedBy: user,
  };
}

/**
 * Creates a reversal journal entry to reverse any posted transaction cleanly.
 * Swaps Debits and Credits and links back to the original entry.
 */
export function createReversalJournalEntry(
  originalEntry: JournalEntry,
  reversedByUser: string,
  reversalReason: string
): JournalEntry {
  const reversalLines: JournalLine[] = originalEntry.lines.map((l, idx) => ({
    id: `jl-rev-${Date.now()}-${idx}`,
    accountCode: l.accountCode,
    accountNameAr: l.accountNameAr,
    debit: l.credit, // SWAP
    credit: l.debit, // SWAP
    description: `عكس قيد: ${l.description}`,
    branchId: l.branchId,
    costCenterId: l.costCenterId,
  }));

  const { totalDebit, totalCredit } = validateJournalBalance(reversalLines);

  return {
    id: `je-rev-${Date.now()}`,
    entryNumber: `REV-${originalEntry.entryNumber}`,
    date: new Date().toISOString().split("T")[0],
    reference: `عكس ${originalEntry.entryNumber}`,
    sourceModule: originalEntry.sourceModule,
    sourceTransactionId: originalEntry.sourceTransactionId,
    description: `عكس وإلغاء القيد رقم ${originalEntry.entryNumber} - السبب: ${reversalReason}`,
    lines: reversalLines,
    totalDebit,
    totalCredit,
    branchId: originalEntry.branchId,
    branchName: originalEntry.branchName,
    costCenterId: originalEntry.costCenterId,
    costCenterName: originalEntry.costCenterName,
    status: "POSTED",
    createdBy: reversedByUser,
    createdAt: new Date().toISOString(),
    postedAt: new Date().toISOString(),
    postedBy: reversedByUser,
    reversalEntryId: originalEntry.id,
    reversalReason,
  };
}

/**
 * Egyptian Tax Authority (ETA) Validation and Simulator Helper.
 */
export function validateEgyptianInvoiceForETA(record: EtaInvoiceRecord): {
  isValid: boolean;
  errors: string[];
  recommendations: string[];
} {
  const errors: string[] = [];
  const recommendations: string[] = [];

  // Rule 1: B2B must have 9-digit tax registration number
  if (record.receiverType === "B") {
    if (!record.receiverTaxId || !/^\d{9}$/.test(record.receiverTaxId.replace(/-/g, ""))) {
      errors.push("فواتير الشركات (B2B) تتطلب رقم تسجيل ضريبي مصري صحيح مكون من 9 أرقام.");
    }
  }

  // Rule 2: Invoices above 150,000 EGP for Egyptian Individuals (B2C) require National ID (14 digits)
  if (record.receiverType === "P" && record.totalAmount >= 150000) {
    if (!record.receiverTaxId || record.receiverTaxId.replace(/\D/g, "").length !== 14) {
      errors.push("وفقاً لتعليمات مصلحة الضرائب المصرية: المعاملات للأفراد فوق 150,000 ج.م تتطلب الرقم القومي (14 رقماً).");
    }
  }

  // Rule 3: Line Item Codes must follow GS1 or EGS standard
  for (const line of record.lines) {
    if (!line.itemCode || line.itemCode.length < 5) {
      errors.push(`الصنف "${line.description}" لا يحتوي على كود سلعي معتمد (GS1/EGS).`);
    }
    if (line.taxRate !== 0.14 && line.taxRate !== 0) {
      recommendations.push(`نسبة الضريبة ${line.taxRate * 100}% للصنف "${line.description}" غير قياسية، تأكد من كود الإعفاء المعتمد.`);
    }
  }

  // Rule 4: Currency & Calculation Alignment
  const calculatedTax = record.lines.reduce((sum, l) => sum + l.taxAmount, 0);
  if (Math.abs(calculatedTax - record.taxAmount) > 1) {
    errors.push("عدم تطابق في إجمالي ضريبة القيمة المضافة المحسوبة على مستوى البنود مع إجمالي الفاتورة.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    recommendations,
  };
}

/**
 * Formats Egyptian Currency (EGP / ج.م) nicely.
 */
export function formatEGP(amount: number): string {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

/**
 * Generates an automated journal entry for a Supplier Purchase Bill / Invoice.
 * Accounting rule:
 * Dr. Inventory Asset / Raw Materials (1040)
 * Dr. Input VAT Recoverable 14% (1060)
 * Cr. Accounts Payable / Supplier (2010)
 */
export function generatePurchaseInvoiceJournal({
  invoiceNumber,
  supplierName,
  supplierInvoiceRef,
  poNumber,
  subtotal,
  taxAmount,
  totalAmount,
  branchId,
  branchName,
  costCenterId,
  costCenterName,
  user,
}: {
  invoiceNumber: string;
  supplierName: string;
  supplierInvoiceRef: string;
  poNumber: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  branchId: string;
  branchName: string;
  costCenterId: string;
  costCenterName: string;
  user: string;
}): JournalEntry {
  const lines: JournalLine[] = [
    {
      id: `jl-${Date.now()}-1`,
      accountCode: "1040",
      accountNameAr: "مخزون الأثاث التام والخامات",
      debit: subtotal,
      credit: 0,
      description: `إثبات مشتريات بضاعة مخزنية - فاتورة مورد ${supplierInvoiceRef} (أمر ${poNumber})`,
      branchId,
      costCenterId,
    },
  ];

  if (taxAmount > 0) {
    lines.push({
      id: `jl-${Date.now()}-2`,
      accountCode: "1060",
      accountNameAr: "ضريبة القيمة المضافة القابلة للخصم (مدخلات 14%)",
      debit: taxAmount,
      credit: 0,
      description: `ضريبة مدخلات 14% فاتورة مشتريات #${invoiceNumber} - المورد: ${supplierName}`,
      branchId,
      costCenterId,
    });
  }

  lines.push({
    id: `jl-${Date.now()}-3`,
    accountCode: "2010",
    accountNameAr: "دائنون وحسابات الموردين",
    debit: 0,
    credit: totalAmount,
    description: `استحقاق فاتورة توريد #${invoiceNumber} للمورد ${supplierName}`,
    branchId,
    costCenterId,
  });

  const { totalDebit, totalCredit } = validateJournalBalance(lines);

  return {
    id: `je-pinv-${Date.now()}`,
    entryNumber: `JE-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split("T")[0],
    reference: invoiceNumber,
    sourceModule: "SUPPLIER",
    sourceTransactionId: invoiceNumber,
    description: `فاتورة شراء وتوريد بضاعة #${invoiceNumber} - المورد: ${supplierName} (أمر شراء: ${poNumber})`,
    lines,
    totalDebit,
    totalCredit,
    branchId,
    branchName,
    costCenterId,
    costCenterName,
    status: "POSTED",
    createdBy: user,
    createdAt: new Date().toISOString(),
    postedAt: new Date().toISOString(),
    postedBy: user,
  };
}

/**
 * Generates an automated journal entry for a Purchase Return (Debit Note).
 * Accounting rule:
 * Dr. Accounts Payable / Supplier (2010) [Reduces liability]
 * Cr. Inventory Asset (1040) [Reduces inventory]
 * Cr. Input VAT Recoverable 14% (1060) [Reverses input tax]
 */
export function generatePurchaseReturnJournal({
  returnNumber,
  supplierName,
  poNumber,
  subtotal,
  taxAmount,
  totalRefundAmount,
  branchId,
  branchName,
  costCenterId,
  costCenterName,
  user,
}: {
  returnNumber: string;
  supplierName: string;
  poNumber: string;
  subtotal: number;
  taxAmount: number;
  totalRefundAmount: number;
  branchId: string;
  branchName: string;
  costCenterId: string;
  costCenterName: string;
  user: string;
}): JournalEntry {
  const lines: JournalLine[] = [
    {
      id: `jl-${Date.now()}-1`,
      accountCode: "2010",
      accountNameAr: "دائنون وحسابات الموردين",
      debit: totalRefundAmount,
      credit: 0,
      description: `تخفيض مستحقات المورد ${supplierName} بموجب إشعار مدين مرتجع #${returnNumber}`,
      branchId,
      costCenterId,
    },
    {
      id: `jl-${Date.now()}-2`,
      accountCode: "1040",
      accountNameAr: "مخزون الأثاث التام والخامات",
      debit: 0,
      credit: subtotal,
      description: `رد وتخفيض مخزون مرتجع للمورد #${returnNumber} (أمر ${poNumber})`,
      branchId,
      costCenterId,
    },
  ];

  if (taxAmount > 0) {
    lines.push({
      id: `jl-${Date.now()}-3`,
      accountCode: "1060",
      accountNameAr: "ضريبة القيمة المضافة القابلة للخصم (مدخلات 14%)",
      debit: 0,
      credit: taxAmount,
      description: `عكس ضريبة مدخلات 14% لمرتجع مشتريات #${returnNumber}`,
      branchId,
      costCenterId,
    });
  }

  const { totalDebit, totalCredit } = validateJournalBalance(lines);

  return {
    id: `je-pret-${Date.now()}`,
    entryNumber: `JE-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split("T")[0],
    reference: returnNumber,
    sourceModule: "SUPPLIER",
    sourceTransactionId: returnNumber,
    description: `إشعار مدين - مرتجع مشتريات إلى ${supplierName} #${returnNumber}`,
    lines,
    totalDebit,
    totalCredit,
    branchId,
    branchName,
    costCenterId,
    costCenterName,
    status: "POSTED",
    createdBy: user,
    createdAt: new Date().toISOString(),
    postedAt: new Date().toISOString(),
    postedBy: user,
  };
}

/**
 * Three-Way Matching Evaluator:
 * Compares (1) Purchase Order (Ordered), (2) Goods Receipt (Received), (3) Supplier Invoice (Billed).
 */
export function evaluateThreeWayMatch({
  orderedQty,
  receivedQty,
  invoicedQty,
  orderedUnitPrice,
  invoicedUnitPrice,
  priceTolerancePercent = 0,
  qtyTolerancePercent = 0,
}: {
  orderedQty: number;
  receivedQty: number;
  invoicedQty: number;
  orderedUnitPrice: number;
  invoicedUnitPrice: number;
  priceTolerancePercent?: number;
  qtyTolerancePercent?: number;
}): {
  status: "MATCHED" | "PRICE_MISMATCH" | "QUANTITY_MISMATCH" | "BOTH_MISMATCH";
  priceDiff: number;
  priceDiffPercent: number;
  qtyDiffVsReceived: number;
  qtyDiffVsOrdered: number;
  warnings: string[];
} {
  const warnings: string[] = [];
  const priceDiff = invoicedUnitPrice - orderedUnitPrice;
  const priceDiffPercent = orderedUnitPrice > 0 ? (priceDiff / orderedUnitPrice) * 100 : 0;
  const isPriceMismatch = Math.abs(priceDiffPercent) > priceTolerancePercent;

  const qtyDiffVsReceived = invoicedQty - receivedQty;
  const qtyDiffVsOrdered = invoicedQty - orderedQty;
  const isQtyMismatch = Math.abs(qtyDiffVsReceived) > (receivedQty * (qtyTolerancePercent / 100));

  if (isPriceMismatch) {
    if (priceDiff > 0) {
      warnings.push(`سعر الفاتورة أعلى من أمر الشراء بـ ${priceDiffPercent.toFixed(1)}% (+${priceDiff.toLocaleString()} ج.م)`);
    } else {
      warnings.push(`سعر الفاتورة أقل من أمر الشراء بـ ${Math.abs(priceDiffPercent).toFixed(1)}%`);
    }
  }

  if (isQtyMismatch) {
    if (qtyDiffVsReceived > 0) {
      warnings.push(`الفاتورة تطالب بـ ${invoicedQty} وحدة بينما المستلم الفعلي بالمستودع ${receivedQty} وحدة (عجز استلام ${qtyDiffVsReceived})`);
    } else if (qtyDiffVsReceived < 0) {
      warnings.push(`الكمية المفوترة (${invoicedQty}) أقل من المستلم فعلياً (${receivedQty})`);
    }
  }

  let status: "MATCHED" | "PRICE_MISMATCH" | "QUANTITY_MISMATCH" | "BOTH_MISMATCH" = "MATCHED";
  if (isPriceMismatch && isQtyMismatch) {
    status = "BOTH_MISMATCH";
  } else if (isPriceMismatch) {
    status = "PRICE_MISMATCH";
  } else if (isQtyMismatch) {
    status = "QUANTITY_MISMATCH";
  }

  return {
    status,
    priceDiff,
    priceDiffPercent,
    qtyDiffVsReceived,
    qtyDiffVsOrdered,
    warnings,
  };
}

