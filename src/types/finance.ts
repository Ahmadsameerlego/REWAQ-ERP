// Rewaq ERP - Finance & Accounting Domain Types (Egyptian Market Ready)

export type AccountCategory = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "COGS" | "EXPENSE";

export interface Account {
  code: string; // e.g. "1010", "101001"
  nameAr: string;
  nameEn: string;
  category: AccountCategory;
  parentCode?: string;
  level: number;
  isDebitNormal: boolean;
  currentBalance: number;
  isSystem: boolean;
  isActive: boolean;
  description?: string;
}

export type JournalSourceModule =
  | "POS"
  | "CONTRACT"
  | "INVENTORY"
  | "DELIVERY"
  | "EXPENSE"
  | "TREASURY"
  | "TREASURY_PAYMENT"
  | "SUPPLIER"
  | "HR"
  | "PAYROLL"
  | "MANUAL"
  | "TAX"
  | string;

export type JournalStatus = "DRAFT" | "POSTED" | "REVERSED";

export interface JournalLine {
  id: string;
  accountCode: string;
  accountNameAr: string;
  debit: number;
  credit: number;
  description: string;
  branchId?: string;
  costCenterId?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string; // e.g. "JE-2026-0901"
  date: string;
  reference: string;
  sourceModule: JournalSourceModule;
  sourceTransactionId?: string;
  description: string;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  branchId: string;
  branchName?: string;
  costCenterId?: string;
  costCenterName?: string;
  status: JournalStatus;
  isBalanced?: boolean;
  notes?: string;
  createdBy: string;
  createdAt: string;
  postedAt?: string;
  postedBy?: string;
  reversedAt?: string;
  reversedBy?: string;
  reversalEntryId?: string;
  reversalReason?: string;
}

export interface CostCenter {
  id: string;
  code: string;
  nameAr: string;
  type: "BRANCH" | "SHOWROOM" | "LOGISTICS" | "MARKETING" | "ADMINISTRATION" | "PRODUCTION";
  manager: string;
  budgetAllocated: number;
  budgetSpent: number;
}

// Egyptian Tax Engine & E-Invoice Types
export interface TaxRateConfig {
  id: string;
  code: string; // e.g. "T1", "T2", "T0"
  nameAr: string;
  rate: number; // e.g. 0.14 for 14% VAT
  isDefault: boolean;
  taxType: "V009" | "V001" | "EXEMPT" | "ZERO"; // ETA Tax classification
  accountCode: string; // "2030" for Output VAT, "1060" for Input VAT
  description: string;
  effectiveFrom: string;
}

export type EtaDocType = "I" | "C" | "D" | "R"; // Invoice, Credit Note, Debit Note, Receipt
export type EtaSubmissionStatus = "VALID" | "SUBMITTED" | "INVALID" | "REJECTED" | "CANCELLED" | "PENDING_SIGNATURE";

export interface EtaInvoiceLine {
  itemCode: string; // GS1 or EGS code (e.g. EG-11345678-SOFA01)
  itemType: "GS1" | "EGS";
  description: string;
  unitType: string;
  quantity: number;
  unitPrice: number;
  salesTotal: number;
  discount: number;
  netTotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export interface EtaInvoiceRecord {
  id: string;
  internalId: string; // e.g. "INV-2026-1044"
  documentType: EtaDocType;
  documentTypeName: string;
  receiverType: "B" | "P" | "F"; // Business, Person, Foreigner
  receiverTaxId?: string; // 9 digits for B2B or National ID for B2C
  receiverName: string;
  receiverPhone?: string;
  receiverAddress?: string;
  dateTimeIssued: string;
  dateTimeReceived?: string;
  totalSalesAmount: number;
  totalDiscountAmount: number;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  etaStatus: EtaSubmissionStatus;
  uuid?: string;
  submissionId?: string;
  longId?: string;
  signatureToken?: string;
  qrCodeUrl?: string;
  validationErrors: string[];
  lines: EtaInvoiceLine[];
  sourceModule: "POS" | "CONTRACT" | "MANUAL";
  sourceReference: string;
  branchId: string;
  branchName: string;
  journalEntryId?: string;
}

// Customer Receivables & Advances
export interface CustomerAdvance {
  id: string;
  advanceNumber: string; // e.g. "ADV-5012"
  customerId: string;
  customerName: string;
  customerPhone: string;
  contractId?: string;
  orderNumber?: string;
  amount: number;
  settledAmount: number;
  remainingAmount: number;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "CARD" | "VALU" | "INSTAPAY" | "CHEQUE";
  treasuryOrBankId: string;
  treasuryOrBankName: string;
  date: string;
  status: "ACTIVE" | "PARTIALLY_SETTLED" | "SETTLED" | "REFUNDED";
  notes: string;
  receiptVoucherId?: string;
  journalEntryId?: string;
}

export interface CustomerInstallment {
  id: string;
  contractId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  installmentNumber: number;
  totalInstallments: number;
  amount: number;
  dueDate: string;
  paidAmount: number;
  remainingAmount: number;
  status: "PAID" | "PENDING" | "DUE" | "OVERDUE";
  paidDate?: string;
  receiptId?: string;
  notes?: string;
}

export interface CustomerLedgerEntry {
  id: string;
  customerId: string;
  date: string;
  type: "OPENING" | "INVOICE" | "PAYMENT" | "ADVANCE_DEPOSIT" | "ADVANCE_SETTLEMENT" | "CREDIT_NOTE" | "REFUND";
  reference: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
  journalEntryId?: string;
}

export interface ReceiptVoucher {
  id: string;
  receiptNumber: string; // e.g. "REC-8840"
  date: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  contractId?: string;
  orderNumber?: string;
  invoiceId?: string;
  amount: number;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "CARD" | "VALU" | "INSTAPAY" | "CHEQUE";
  treasuryOrBankId: string;
  treasuryOrBankName: string;
  referenceNumber: string;
  notes: string;
  receivedBy: string;
  type: "CONTRACT_DEPOSIT" | "INSTALLMENT_PAYMENT" | "INVOICE_SETTLEMENT" | "DIRECT_COLLECTION";
  installmentId?: string;
  advanceId?: string;
  journalEntryId?: string;
  printCount: number;
}

// Treasuries & Banks
export interface Treasury {
  id: string;
  code: string;
  nameAr: string;
  branchId: string;
  branchName: string;
  accountCode: string;
  openingBalance: number;
  currentBalance: number;
  minOperationalLimit: number;
  maxOperationalLimit: number;
  type: "MAIN_VAULT" | "BRANCH_VAULT" | "POS_DRAWER";
  managerName: string;
  status: "ACTIVE" | "LOCKED";
}

export interface BankAccount {
  id: string;
  code: string;
  bankName: string;
  accountNameAr: string;
  accountNumber: string;
  iban: string;
  accountCode: string;
  branch: string;
  openingBalance: number;
  currentBalance: number;
  currency: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface TreasuryTransfer {
  id: string;
  transferNumber: string; // e.g. "TR-2026-044"
  fromId: string;
  fromName: string;
  fromType: "TREASURY" | "BANK";
  toId: string;
  toName: string;
  toType: "TREASURY" | "BANK";
  amount: number;
  date: string;
  reference: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "COMPLETED" | "REJECTED";
  requestedBy: string;
  approvedBy?: string;
  completedAt?: string;
  notes: string;
  journalEntryId?: string;
}

export interface TreasuryReconciliation {
  id: string;
  date: string;
  targetId: string;
  targetName: string;
  targetType: "TREASURY" | "BANK";
  systemBalance: number;
  physicalBalance: number;
  difference: number;
  status: "BALANCED" | "DISCREPANCY" | "RESOLVED";
  reconciliationNotes: string;
  reconciledBy: string;
  adjustmentJournalEntryId?: string;
}

// Operating Expenses
export interface ExpenseCategory {
  id: string;
  code: string;
  nameAr: string;
  defaultAccountCode: string;
  monthlyBudget: number;
  isTaxDeductible: boolean;
}

export interface Expense {
  id: string;
  expenseNumber: string; // e.g. "EXP-2026-302"
  date: string;
  categoryId: string;
  categoryName: string;
  accountCode: string;
  amount: number; // Subtotal before tax
  taxRate: number; // e.g. 0.14 or 0
  taxAmount: number;
  totalAmount: number;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "CARD" | "CHEQUE";
  paidFromId: string;
  paidFromName: string;
  branchId: string;
  branchName: string;
  costCenterId: string;
  costCenterName: string;
  vendorName: string;
  vendorTaxId?: string;
  invoiceNumber?: string;
  description: string;
  attachmentName?: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "PAID" | "REJECTED";
  requestedBy: string;
  approvedBy?: string;
  paidAt?: string;
  journalEntryId?: string;
  isUnusual?: boolean;
  unusualReason?: string;
}

// Suppliers & Payables
export interface Supplier {
  id: string;
  code: string;
  nameAr: string;
  contactPerson: string;
  phone: string;
  taxNumber: string;
  city: string;
  address: string;
  accountCode: string;
  totalPurchases: number;
  totalPaid: number;
  balance: number; // Positive = We owe them
  creditLimit: number;
  paymentTermsDays: number;
  category: "RAW_WOOD" | "FABRICS" | "HARDWARE" | "PACKAGING" | "LOGISTICS_PARTNER" | "SHOWROOM_SUPPLIES";
}

export interface SupplierBill {
  id: string;
  billNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  dueDate: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "PAID" | "PARTIAL" | "UNPAID" | "OVERDUE";
  referenceOrder?: string;
  journalEntryId?: string;
}

export interface SupplierPayment {
  id: string;
  paymentNumber: string;
  supplierId: string;
  supplierName: string;
  billId?: string;
  billNumber?: string;
  amount: number;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "CHEQUE";
  paidFromId: string;
  paidFromName: string;
  date: string;
  reference: string;
  notes: string;
  journalEntryId?: string;
}

// Smart Insights & Period Management
export interface SmartFinanceInsight {
  id: string;
  title: string;
  description: string;
  severity: "HIGH" | "MEDIUM" | "LOW" | "INFO";
  category: "RECEIVABLES" | "CASH" | "EXPENSES" | "TAX" | "MARGIN" | "INSTALLMENTS";
  whyExplanation: string;
  actionLabel?: string;
  actionHref?: string;
  resolved: boolean;
  createdAt: string;
}

export interface AccountingPeriod {
  id: string;
  nameAr: string; // e.g. "سبتمبر 2026"
  code: string; // "2026-09"
  startDate: string;
  endDate: string;
  status: "OPEN" | "CLOSING" | "CLOSED";
  closedAt?: string;
  closedBy?: string;
  lockedEntriesCount: number;
  closingNotes?: string;
}

export interface AccountMappingConfig {
  productCategories: {
    category: string;
    salesAccount: string;
    cogsAccount: string;
    inventoryAccount: string;
    vatAccount: string;
  }[];
  paymentMethods: {
    method: string;
    targetAccountCode: string;
    targetName: string;
  }[];
  expenseCategories: {
    category: string;
    accountCode: string;
    vatAccountCode: string;
  }[];
  defaultAdvanceAccount: string;
  defaultReceivableAccount: string;
  defaultPayableAccount: string;
  defaultVatOutputAccount: string;
  defaultVatInputAccount: string;
}

export type FinanceRole = "CASHIER" | "ACCOUNTANT" | "FINANCE_MANAGER" | "ADMIN";
