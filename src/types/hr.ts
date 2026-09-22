// Rewaq ERP - HR & Payroll Module Types
// Comprehensive Type Definitions for Employees, Attendance, Payroll, Leaves, Advances & Egyptian Compliance

export type HrRole = "HR_ADMIN" | "HR_OFFICER" | "PAYROLL_OFFICER" | "MANAGER" | "EMPLOYEE" | "FINANCE";

export type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "PROBATION" | "SUSPENDED" | "TERMINATED";

export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "COMMISSION_ONLY" | "PROBATION";

export type Gender = "MALE" | "FEMALE";

export type MaritalStatus = "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";

export type PaymentMethod = "BANK_TRANSFER" | "CASH" | "INSTAPAY" | "CHEQUE" | "WALLET";

export interface EmployeeDocument {
  id: string;
  name: string;
  type: "NATIONAL_ID" | "CONTRACT" | "GRADUATION_CERT" | "MILITARY_CERT" | "CRIMINAL_RECORD" | "OTHER";
  fileUrl: string;
  uploadedAt: string;
  notes?: string;
}

export interface EmployeeSalaryHistory {
  id: string;
  employeeId: string;
  oldSalary: number;
  newSalary: number;
  effectiveDate: string;
  reason: string;
  changedBy: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  employeeCode: string; // e.g., "EMP-101"
  fullName: string;
  fullNameEn?: string;
  avatarUrl?: string;
  nationalId: string;
  birthDate: string;
  gender: Gender;
  maritalStatus: MaritalStatus;
  phone: string;
  email: string;
  address: string;
  city: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;

  // Work Information
  branchId: string;
  branchName: string;
  departmentId: string;
  departmentName: string;
  positionId: string;
  positionTitle: string;
  directManagerId?: string;
  directManagerName?: string;
  hireDate: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  workStartDate: string;
  workEndDate?: string;
  scheduleId: string;
  scheduleName: string;

  // Financial & Payroll Setup
  basicSalary: number;
  housingAllowance: number;
  transportationAllowance: number;
  otherAllowances: number;
  commissionRate?: number; // e.g. 1.5% for Sales
  hasSocialInsurance: boolean;
  socialInsuranceNumber?: string;
  insuranceSalaryBase?: number; // الأجر التأميني
  isSubjectToIncomeTax: boolean;
  paymentMethod: PaymentMethod;
  bankName?: string;
  bankAccountNumber?: string;
  iban?: string;
  instapayHandle?: string;

  // Cost Center Link
  costCenterId: string;
  costCenterName: string;

  // User Account Link
  linkedUserId?: string;

  // Documents
  documents: EmployeeDocument[];

  // Audit
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  branchId: string; // Or "ALL"
  branchName: string;
  managerId?: string;
  managerName?: string;
  costCenterId: string;
  status: "ACTIVE" | "INACTIVE";
  description?: string;
  employeeCount?: number;
}

export interface Position {
  id: string;
  code: string;
  titleAr: string;
  titleEn: string;
  departmentId: string;
  departmentName: string;
  description?: string;
  minSalary?: number;
  maxSalary?: number;
  status: "ACTIVE" | "INACTIVE";
  employeeCount?: number;
}

export type ContractStatus = "DRAFT" | "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "TERMINATED";

export interface EmploymentContract {
  id: string;
  contractNumber: string;
  employeeId: string;
  employeeName: string;
  contractType: EmploymentType;
  startDate: string;
  endDate?: string;
  basicSalary: number;
  allowancesTotal: number;
  probationMonths: number;
  probationEndDate?: string;
  workingHoursWeekly: number;
  annualLeaveDays: number;
  noticePeriodDays: number;
  status: ContractStatus;
  signedAt?: string;
  documentUrl?: string;
  notes?: string;
}

export type ScheduleType = "FIXED" | "SHIFT" | "FLEXIBLE";

export interface WorkSchedule {
  id: string;
  code: string;
  name: string;
  type: ScheduleType;
  workDays: ("SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT")[];
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  dailyHours: number; // 8
  gracePeriodMinutes: number; // 15 mins
  overtimeAllowed: boolean;
  overtimeHourRateMultiplier: number; // 1.5x
  weekendDays: ("SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT")[];
  isDefault: boolean;
}

export type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT" | "LEAVE" | "HOLIDAY" | "OFF_DAY" | "HALF_DAY";
export type AttendanceSource = "BIOMETRIC" | "MANUAL" | "PORTAL" | "SYSTEM";

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  branchId: string;
  branchName: string;
  departmentName: string;
  date: string; // YYYY-MM-DD
  checkIn?: string; // HH:mm
  checkOut?: string; // HH:mm
  workHours: number;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  overtimeHours: number;
  status: AttendanceStatus;
  source: AttendanceSource;
  modifiedBy?: string;
  modificationReason?: string;
  modifiedAt?: string;
  notes?: string;
}

export interface LeaveType {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  annualDays: number;
  isPaid: boolean;
  paidPercentage: number; // 100% or 75% etc
  requiresApproval: boolean;
  deductsPayroll: boolean;
  color: string;
  description?: string;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  year: number;
  entitledDays: number;
  usedDays: number;
  remainingDays: number;
}

export type LeaveRequestStatus = "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface LeaveRequest {
  id: string;
  requestNumber: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  attachmentUrl?: string;
  status: LeaveRequestStatus;
  requestedAt: string;
  approverName?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export type AdvanceStatus = "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface AdvanceRepayment {
  payrollRunId?: string;
  month: string; // "2026-09"
  amount: number;
  status: "PENDING" | "DEDUCTED" | "POSTPONED";
  deductedAt?: string;
}

export interface EmployeeAdvance {
  id: string;
  advanceNumber: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  branchName: string;
  requestDate: string;
  totalAmount: number;
  installmentCount: number;
  monthlyInstallment: number;
  remainingBalance: number;
  startMonth: string; // "2026-09"
  status: AdvanceStatus;
  reason: string;
  approvedBy?: string;
  approvedAt?: string;
  repayments: AdvanceRepayment[];
}

export type PayrollRunStatus = "DRAFT" | "CALCULATED" | "REVIEWED" | "APPROVED" | "PAID" | "CLOSED";

export interface PayrollItem {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  positionTitle: string;
  branchId: string;
  branchName: string;
  costCenterId: string;
  costCenterName: string;

  // Earnings
  basicSalary: number;
  housingAllowance: number;
  transportationAllowance: number;
  otherAllowances: number;
  totalAllowances: number;
  overtimeHours: number;
  overtimeAmount: number;
  bonusAmount: number;
  commissionsAmount: number;
  grossSalary: number;

  // Deductions
  absenceDays: number;
  absenceDeduction: number;
  lateMinutes: number;
  lateDeduction: number;
  advanceDeduction: number;
  otherDeductions: number;
  penaltiesDeduction: number;
  totalCompanyDeductions: number;

  // Egyptian Taxes & Social Insurance
  taxableSalary: number;
  incomeTax: number; // ضريبة كسب العمل
  employeeSocialInsurance: number; // 11%
  employerSocialInsurance: number; // 18.75%
  totalStatutoryDeductions: number; // Tax + Employee Insurance

  // Final Net
  totalDeductions: number; // Company + Statutory + Advance
  netSalary: number;

  // Intelligence & Review Highlights
  anomalies: {
    type: "SALARY_SPIKE" | "BIG_DEDUCTION" | "NEW_HIRE" | "TERMINATED" | "MISSING_BANK_INFO" | "BONUS_ALERT" | "ADVANCE_ALERT";
    message: string;
    severity: "INFO" | "WARNING" | "CRITICAL";
  }[];

  status: "PENDING" | "REVIEWED" | "FLAGGED";
  notes?: string;
}

export interface PayrollRun {
  id: string;
  runNumber: string;
  month: number; // 1 - 12
  year: number; // 2026
  periodLabel: string; // "سبتمبر 2026"
  branchId: string; // "ALL" or specific branch
  branchName: string;
  status: PayrollRunStatus;

  // Aggregate Totals
  employeeCount: number;
  totalBasic: number;
  totalAllowances: number;
  totalOvertime: number;
  totalBonuses: number;
  totalCommissions: number;
  totalGross: number;

  totalAbsenceDeductions: number;
  totalLateDeductions: number;
  totalAdvanceDeductions: number;
  totalOtherDeductions: number;
  totalPenalties: number;

  totalIncomeTax: number;
  totalEmployeeInsurance: number;
  totalEmployerInsurance: number;
  totalStatutoryCost: number;

  totalDeductions: number;
  totalNetSalary: number;
  totalEmployerCost: number; // Gross + Employer Insurance

  items: PayrollItem[];

  // Accounting Link
  accrualJournalEntryId?: string;
  accrualJournalEntryNumber?: string;
  paymentJournalEntryId?: string;
  paymentJournalEntryNumber?: string;
  paymentMethod?: PaymentMethod;
  paidFromTreasuryId?: string;
  paidFromTreasuryName?: string;
  paidAt?: string;

  // Workflow tracking
  createdAt: string;
  createdBy: string;
  calculatedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  closedAt?: string;
  closedBy?: string;
}

export interface Payslip {
  id: string;
  payslipNumber: string;
  payrollRunId: string;
  payrollMonth: number;
  payrollYear: number;
  periodLabel: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  positionTitle: string;
  branchName: string;
  nationalId: string;
  socialInsuranceNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;

  // Earnings
  basicSalary: number;
  housingAllowance: number;
  transportationAllowance: number;
  otherAllowances: number;
  overtimeAmount: number;
  bonusAmount: number;
  commissionsAmount: number;
  grossSalary: number;

  // Deductions
  incomeTax: number;
  employeeSocialInsurance: number;
  advanceDeduction: number;
  absenceDeduction: number;
  lateDeduction: number;
  penaltiesDeduction: number;
  otherDeductions: number;
  totalDeductions: number;

  // Employer share info (for awareness)
  employerSocialInsurance: number;

  // Net Payable
  netSalary: number;
  issuedAt: string;
  paymentStatus: "PENDING" | "PAID";
  paidAt?: string;
}

export interface FinalSettlement {
  id: string;
  settlementNumber: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  positionTitle: string;
  branchName: string;
  hireDate: string;
  terminationDate: string;
  serviceDurationText: string;
  reason: "RESIGNATION" | "CONTRACT_END" | "TERMINATION" | "RETIREMENT" | "OTHER";

  // Financial Breakdown
  lastSalaryMonth: string;
  unpaidSalaryAmount: number;
  unusedLeaveDays: number;
  leaveCompensationAmount: number;
  endOfServiceGratuity: number;
  approvedBonuses: number;
  totalEntitlements: number;

  // Deductions
  outstandingAdvanceBalance: number;
  damagesOrPenalties: number;
  otherDeductions: number;
  totalDeductions: number;

  // Net Final Settlement
  netSettlementAmount: number;

  status: "DRAFT" | "REVIEWED" | "APPROVED" | "PAID";
  journalEntryId?: string;
  paidFromTreasuryId?: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface TaxBracketConfig {
  id: string;
  name: string;
  fromAmount: number;
  toAmount: number; // Infinity for last bracket
  rate: number; // e.g. 0%, 2.5%, 10%, 15%, 20%, 22.5%, 25%
}

export interface EgyptianHrSettings {
  // Egyptian Income Tax Config (Law 30 / recent 2024-2026 amendments)
  personalExemptionAnnual: number; // e.g. 20,000 EGP or 60,000 EGP
  taxBrackets: TaxBracketConfig[];

  // Egyptian Social Insurance Config (Law 148/2019)
  minInsuranceSalaryBase: number; // e.g. 2,000 EGP
  maxInsuranceSalaryBase: number; // e.g. 12,600 EGP
  employeeInsuranceRate: number; // 11% (0.11)
  employerInsuranceRate: number; // 18.75% (0.1875)

  // Attendance & Overtime Rules
  workingDaysPerMonth: number; // 30 or 26
  standardDailyHours: number; // 8
  defaultGraceMinutes: number; // 15
  daytimeOvertimeRate: number; // 1.35x or 1.5x
  nighttimeOvertimeRate: number; // 1.7x or 2.0x
  lateDeductionPer15MinPercentage: number; // % of day salary

  // Accounting General Ledger Mappings
  salariesExpenseAccountCode: string; // 6020
  allowancesExpenseAccountCode: string; // 6022
  employerInsuranceExpenseAccountCode: string; // 6023
  salariesPayableAccountCode: string; // 2051
  incomeTaxPayableAccountCode: string; // 2041
  socialInsurancePayableAccountCode: string; // 2042
  advancesAccountCode: string; // 1035
  defaultTreasuryAccountCode: string; // 1010
  defaultBankAccountCode: string; // 1020
}

export interface HrAuditLog {
  id: string;
  action: "EMPLOYEE_CREATED" | "SALARY_CHANGED" | "STATUS_CHANGED" | "ATTENDANCE_EDITED" | "LEAVE_APPROVED" | "ADVANCE_CREATED" | "PAYROLL_CREATED" | "PAYROLL_APPROVED" | "PAYROLL_PAID" | "SETTLEMENT_CREATED" | "CONTRACT_RENEWED" | string;
  entityType: "EMPLOYEE" | "ATTENDANCE" | "LEAVE" | "ADVANCE" | "PAYROLL" | "SETTLEMENT" | "CONTRACT" | string;
  entityId: string;
  employeeName?: string;
  details: string;
  oldValue?: string;
  newValue?: string;
  user: string;
  timestamp: string;
}

export interface HrSmartInsight {
  id: string;
  type: "CONTRACT_EXPIRING" | "REPEATED_ABSENCE" | "UNAPPROVED_PAYROLL" | "PENDING_LEAVE" | "DUE_ADVANCE" | "MISSING_DATA" | "PAYROLL_SPIKE";
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  resolved: boolean;
  date: string;
}
