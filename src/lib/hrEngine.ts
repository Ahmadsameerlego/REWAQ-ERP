// Rewaq ERP - Egyptian HR & Payroll Calculation Engine
// Compliant with Egyptian Labor Law & Tax/Social Insurance regulations with full GL Integration

import {
  EgyptianHrSettings,
  PayrollItem,
  PayrollRun,
  Employee,
  AttendanceRecord,
  EmployeeAdvance,
  TaxBracketConfig,
} from "@/types/hr";
import { JournalEntry, JournalLine } from "@/types/finance";

export const DEFAULT_EGYPTIAN_HR_SETTINGS: EgyptianHrSettings = {
  // Egyptian Income Tax Config (2024-2026 Progressive Brackets & Personal Exemption)
  personalExemptionAnnual: 20000, // 20,000 EGP Annual personal exemption
  taxBrackets: [
    { id: "tb-1", name: "الشريحة الأولى (معفاة)", fromAmount: 0, toAmount: 40000, rate: 0.0 },
    { id: "tb-2", name: "الشريحة الثانية (2.5%)", fromAmount: 40000, toAmount: 55000, rate: 0.025 },
    { id: "tb-3", name: "الشريحة الثالثة (10%)", fromAmount: 55000, toAmount: 70000, rate: 0.10 },
    { id: "tb-4", name: "الشريحة الرابعة (15%)", fromAmount: 70000, toAmount: 200000, rate: 0.15 },
    { id: "tb-5", name: "الشريحة الخامسة (20%)", fromAmount: 200000, toAmount: 400000, rate: 0.20 },
    { id: "tb-6", name: "الشريحة السادسة (22.5%)", fromAmount: 400000, toAmount: 1200000, rate: 0.225 },
    { id: "tb-7", name: "الشريحة السابعة (25%)", fromAmount: 1200000, toAmount: 999999999, rate: 0.25 },
  ],

  // Egyptian Social Insurance Config (Law 148/2019)
  minInsuranceSalaryBase: 2000,
  maxInsuranceSalaryBase: 12600,
  employeeInsuranceRate: 0.11, // 11%
  employerInsuranceRate: 0.1875, // 18.75%

  // Attendance & Overtime Rules
  workingDaysPerMonth: 30,
  standardDailyHours: 8,
  defaultGraceMinutes: 15,
  daytimeOvertimeRate: 1.35, // 135% hourly rate
  nighttimeOvertimeRate: 1.7, // 170% hourly rate
  lateDeductionPer15MinPercentage: 0.125, // 1/8 of a daily salary

  // Accounting GL Accounts
  salariesExpenseAccountCode: "6020",
  allowancesExpenseAccountCode: "6020",
  employerInsuranceExpenseAccountCode: "6020",
  salariesPayableAccountCode: "2050",
  incomeTaxPayableAccountCode: "2040",
  socialInsurancePayableAccountCode: "2040",
  advancesAccountCode: "1030",
  defaultTreasuryAccountCode: "1010",
  defaultBankAccountCode: "1020",
};

/**
 * Formats a number as Egyptian Pounds (EGP)
 */
export function formatEGP(amount: number): string {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

/**
 * Calculates Egyptian Social Insurance amounts (Employee 11% & Employer 18.75%)
 */
export function calculateEgyptianSocialInsurance(
  salaryBase: number,
  hasInsurance: boolean,
  settings: EgyptianHrSettings = DEFAULT_EGYPTIAN_HR_SETTINGS
): {
  cappedBase: number;
  employeeShare: number;
  employerShare: number;
  totalInsurance: number;
} {
  if (!hasInsurance || salaryBase <= 0) {
    return { cappedBase: 0, employeeShare: 0, employerShare: 0, totalInsurance: 0 };
  }

  // Capped insurance salary base
  const cappedBase = Math.min(
    Math.max(salaryBase, settings.minInsuranceSalaryBase),
    settings.maxInsuranceSalaryBase
  );

  const employeeShare = Math.round(cappedBase * settings.employeeInsuranceRate);
  const employerShare = Math.round(cappedBase * settings.employerInsuranceRate);

  return {
    cappedBase,
    employeeShare,
    employerShare,
    totalInsurance: employeeShare + employerShare,
  };
}

/**
 * Calculates Egyptian Annual & Monthly Income Tax (ضريبة كسب العمل)
 */
export function calculateEgyptianIncomeTax(
  monthlyGross: number,
  monthlyEmployeeInsurance: number,
  isSubjectToTax: boolean,
  settings: EgyptianHrSettings = DEFAULT_EGYPTIAN_HR_SETTINGS
): {
  annualGross: number;
  annualInsurance: number;
  annualTaxable: number;
  annualTax: number;
  monthlyTax: number;
} {
  if (!isSubjectToTax || monthlyGross <= 0) {
    return { annualGross: 0, annualInsurance: 0, annualTaxable: 0, annualTax: 0, monthlyTax: 0 };
  }

  const annualGross = monthlyGross * 12;
  const annualInsurance = monthlyEmployeeInsurance * 12;

  // Net annual income before personal exemption
  const netAnnualBeforeExemption = Math.max(0, annualGross - annualInsurance);

  // Net annual taxable pool after deducting annual personal exemption
  const annualTaxable = Math.max(0, netAnnualBeforeExemption - settings.personalExemptionAnnual);

  if (annualTaxable <= 0) {
    return { annualGross, annualInsurance, annualTaxable: 0, annualTax: 0, monthlyTax: 0 };
  }

  // Calculate tax through progressive brackets
  let remainingTaxable = annualTaxable;
  let annualTax = 0;

  for (const bracket of settings.taxBrackets) {
    if (remainingTaxable <= 0) break;

    const bracketSpan = bracket.toAmount - bracket.fromAmount;
    const taxableInThisBracket = Math.min(remainingTaxable, bracketSpan);

    annualTax += taxableInThisBracket * bracket.rate;
    remainingTaxable -= taxableInThisBracket;
  }

  const monthlyTax = Math.max(0, Math.round((annualTax / 12) * 100) / 100);

  return {
    annualGross,
    annualInsurance,
    annualTaxable,
    annualTax: Math.round(annualTax),
    monthlyTax: Math.round(monthlyTax),
  };
}

/**
 * Computes individual Payroll Item for an employee
 */
export function computeEmployeePayrollItem({
  employee,
  attendanceRecords = [],
  activeAdvance,
  bonusAmount = 0,
  commissionsAmount = 0,
  otherDeductionsAmount = 0,
  penaltiesAmount = 0,
  previousMonthGross,
  settings = DEFAULT_EGYPTIAN_HR_SETTINGS,
}: {
  employee: Employee;
  attendanceRecords?: AttendanceRecord[];
  activeAdvance?: EmployeeAdvance;
  bonusAmount?: number;
  commissionsAmount?: number;
  otherDeductionsAmount?: number;
  penaltiesAmount?: number;
  previousMonthGross?: number;
  settings?: EgyptianHrSettings;
}): PayrollItem {
  const basicSalary = employee.basicSalary || 0;
  const housingAllowance = employee.housingAllowance || 0;
  const transportationAllowance = employee.transportationAllowance || 0;
  const otherAllowances = employee.otherAllowances || 0;
  const totalAllowances = housingAllowance + transportationAllowance + otherAllowances;

  // Rates
  const dailyRate = (basicSalary + totalAllowances) / (settings.workingDaysPerMonth || 30);
  const hourlyRate = dailyRate / (settings.standardDailyHours || 8);

  // Attendance metrics from records
  let overtimeHours = 0;
  let absenceDays = 0;
  let lateMinutes = 0;

  attendanceRecords.forEach((att) => {
    if (att.status === "ABSENT") {
      absenceDays += 1;
    }
    if (att.status === "LATE" || att.lateMinutes > 0) {
      lateMinutes += att.lateMinutes || 0;
    }
    if (att.overtimeHours > 0) {
      overtimeHours += att.overtimeHours;
    }
  });

  const overtimeAmount = Math.round(overtimeHours * hourlyRate * settings.daytimeOvertimeRate);
  const absenceDeduction = Math.round(absenceDays * dailyRate);

  // Late deduction formula: every 15 mins late above grace period
  const billableLateSlots = Math.floor(lateMinutes / 15);
  const lateDeduction = Math.round(billableLateSlots * (dailyRate * settings.lateDeductionPer15MinPercentage));

  // Advance deduction
  let advanceDeduction = 0;
  if (activeAdvance && activeAdvance.remainingBalance > 0 && activeAdvance.status === "ACTIVE") {
    advanceDeduction = Math.min(activeAdvance.monthlyInstallment, activeAdvance.remainingBalance);
  }

  // Gross Salary
  const grossSalary = basicSalary + totalAllowances + overtimeAmount + bonusAmount + commissionsAmount;

  // Social Insurance
  const insuranceBase = employee.insuranceSalaryBase || basicSalary;
  const insurance = calculateEgyptianSocialInsurance(insuranceBase, employee.hasSocialInsurance, settings);

  // Income Tax (calculated on Gross minus Employee Insurance)
  const tax = calculateEgyptianIncomeTax(grossSalary, insurance.employeeShare, employee.isSubjectToIncomeTax, settings);

  // Deductions Subtotals
  const totalCompanyDeductions = absenceDeduction + lateDeduction + penaltiesAmount + otherDeductionsAmount;
  const totalStatutoryDeductions = tax.monthlyTax + insurance.employeeShare;
  const totalDeductions = totalCompanyDeductions + totalStatutoryDeductions + advanceDeduction;

  // Net Salary
  const netSalary = Math.max(0, grossSalary - totalDeductions);

  // Detect Smart Anomalies
  const anomalies: PayrollItem["anomalies"] = [];

  // Anomaly: Salary spike or drop > 15% vs previous month
  if (previousMonthGross && previousMonthGross > 0) {
    const diff = grossSalary - previousMonthGross;
    const diffPct = Math.abs(diff / previousMonthGross);
    if (diffPct > 0.15) {
      anomalies.push({
        type: "SALARY_SPIKE",
        message: diff > 0
          ? `الراتب أعلى من الشهر السابق بنسبة ${Math.round(diffPct * 100)}% (+${formatEGP(diff)}) بسبب الحوافز أو الإضافي.`
          : `الراتب أقل من الشهر السابق بنسبة ${Math.round(diffPct * 100)}% (-${formatEGP(Math.abs(diff))}) بسبب الخصومات أو الغياب.`,
        severity: "INFO",
      });
    }
  }

  // Anomaly: Big deductions (> 25% of gross)
  if (grossSalary > 0 && totalDeductions / grossSalary > 0.25) {
    anomalies.push({
      type: "BIG_DEDUCTION",
      message: `إجمالي الخصومات (${formatEGP(totalDeductions)}) يتجاوز 25% من إجمالي المستحق (${Math.round((totalDeductions / grossSalary) * 100)}%).`,
      severity: "WARNING",
    });
  }

  // Anomaly: Missing Bank Info
  if (employee.paymentMethod === "BANK_TRANSFER" && !employee.bankAccountNumber) {
    anomalies.push({
      type: "MISSING_BANK_INFO",
      message: "طريقة الصرف تحويل بنكي لكن بيانات رقم الحساب أو IBAN غير مسجلة بالملف.",
      severity: "WARNING",
    });
  }

  // Anomaly: New Hire
  const isNewHire = new Date().getTime() - new Date(employee.hireDate).getTime() < 30 * 24 * 3600 * 1000;
  if (isNewHire) {
    anomalies.push({
      type: "NEW_HIRE",
      message: "موظف جديد تم تعيينه هذا الشهر.",
      severity: "INFO",
    });
  }

  return {
    id: `pi-${employee.id}-${Date.now()}`,
    employeeId: employee.id,
    employeeCode: employee.employeeCode,
    employeeName: employee.fullName,
    departmentName: employee.departmentName,
    positionTitle: employee.positionTitle,
    branchId: employee.branchId,
    branchName: employee.branchName,
    costCenterId: employee.costCenterId,
    costCenterName: employee.costCenterName,

    basicSalary,
    housingAllowance,
    transportationAllowance,
    otherAllowances,
    totalAllowances,
    overtimeHours,
    overtimeAmount,
    bonusAmount,
    commissionsAmount,
    grossSalary,

    absenceDays,
    absenceDeduction,
    lateMinutes,
    lateDeduction,
    advanceDeduction,
    otherDeductions: otherDeductionsAmount,
    penaltiesDeduction: penaltiesAmount,
    totalCompanyDeductions,

    taxableSalary: tax.annualTaxable / 12,
    incomeTax: tax.monthlyTax,
    employeeSocialInsurance: insurance.employeeShare,
    employerSocialInsurance: insurance.employerShare,
    totalStatutoryDeductions,

    totalDeductions,
    netSalary,
    anomalies,
    status: anomalies.some((a) => a.severity === "WARNING" || a.severity === "CRITICAL") ? "FLAGGED" : "PENDING",
  };
}

/**
 * Generates an automated Balanced Journal Entry for Payroll Accrual (استحقاق الرواتب)
 * Dr. 6020 (Salaries Expense - Basic)
 * Dr. 6020 (Allowances & Overtime Expense)
 * Dr. 6020 (Employer Social Insurance Expense)
 * Cr. 2050 (Salaries Payable - Net)
 * Cr. 2040 (Income Tax Payable)
 * Cr. 2040 (Social Insurance Payable - Employee + Employer)
 * Cr. 1030 (Employee Advances Settled)
 */
export function generatePayrollAccrualJournal({
  payrollRun,
  user,
  settings = DEFAULT_EGYPTIAN_HR_SETTINGS,
}: {
  payrollRun: PayrollRun;
  user: string;
  settings?: EgyptianHrSettings;
}): JournalEntry {
  const lines: JournalLine[] = [];
  const entryDate = new Date().toISOString().split("T")[0];

  // 1. Dr: Basic Salaries Expense
  if (payrollRun.totalBasic > 0) {
    lines.push({
      id: `jl-pr-basic-${Date.now()}`,
      accountCode: settings.salariesExpenseAccountCode,
      accountNameAr: "رواتب وعمولات فريق المبيعات والموظفين",
      debit: payrollRun.totalBasic,
      credit: 0,
      description: `استحقاق الرواتب الأساسية لمسير ${payrollRun.periodLabel} (${payrollRun.employeeCount} موظف)`,
      branchId: payrollRun.branchId,
    });
  }

  // 2. Dr: Allowances, Overtime, Bonuses & Commissions
  const totalVariableEarnings =
    payrollRun.totalAllowances + payrollRun.totalOvertime + payrollRun.totalBonuses + payrollRun.totalCommissions;
  if (totalVariableEarnings > 0) {
    lines.push({
      id: `jl-pr-allow-${Date.now()}`,
      accountCode: settings.allowancesExpenseAccountCode,
      accountNameAr: "بدلات وحوافز وعمولات إضافية للموظفين",
      debit: totalVariableEarnings,
      credit: 0,
      description: `بدلات وإضافي وعمولات مسير ${payrollRun.periodLabel}`,
      branchId: payrollRun.branchId,
    });
  }

  // 3. Dr: Employer Social Insurance Contribution Expense (18.75%)
  if (payrollRun.totalEmployerInsurance > 0) {
    lines.push({
      id: `jl-pr-emp-ins-${Date.now()}`,
      accountCode: settings.employerInsuranceExpenseAccountCode,
      accountNameAr: "حصة المنشأة في التأمينات الاجتماعية (18.75%)",
      debit: payrollRun.totalEmployerInsurance,
      credit: 0,
      description: `حصة الشركة في التأمينات الاجتماعية لشهر ${payrollRun.periodLabel}`,
      branchId: payrollRun.branchId,
    });
  }

  // 4. Cr: Net Salaries Payable
  if (payrollRun.totalNetSalary > 0) {
    lines.push({
      id: `jl-pr-net-${Date.now()}`,
      accountCode: settings.salariesPayableAccountCode,
      accountNameAr: "مصروفات مستحقة - رواتب وأجور واجبة الصرف",
      debit: 0,
      credit: payrollRun.totalNetSalary,
      description: `صافي الرواتب المستحقة لمسير ${payrollRun.periodLabel}`,
      branchId: payrollRun.branchId,
    });
  }

  // 5. Cr: Income Tax Payable (ضريبة كسب العمل)
  if (payrollRun.totalIncomeTax > 0) {
    lines.push({
      id: `jl-pr-tax-${Date.now()}`,
      accountCode: settings.incomeTaxPayableAccountCode,
      accountNameAr: "ضرائب أخرى ومصلحة الضرائب (كسب عمل مستقطع)",
      debit: 0,
      credit: payrollRun.totalIncomeTax,
      description: `ضريبة كسب العمل المستقطعة من رواتب ${payrollRun.periodLabel}`,
      branchId: payrollRun.branchId,
    });
  }

  // 6. Cr: Social Insurance Payable (Employee + Employer share)
  const totalSocialInsurancePayable = payrollRun.totalEmployeeInsurance + payrollRun.totalEmployerInsurance;
  if (totalSocialInsurancePayable > 0) {
    lines.push({
      id: `jl-pr-ins-pay-${Date.now()}`,
      accountCode: settings.socialInsurancePayableAccountCode,
      accountNameAr: "تأمينات اجتماعية مستحقة للهيئة (حصة العامل + المنشأة)",
      debit: 0,
      credit: totalSocialInsurancePayable,
      description: `التأمينات الاجتماعية المستحقة لشهر ${payrollRun.periodLabel}`,
      branchId: payrollRun.branchId,
    });
  }

  // 7. Cr: Employee Advances Repayment
  if (payrollRun.totalAdvanceDeductions > 0) {
    lines.push({
      id: `jl-pr-adv-${Date.now()}`,
      accountCode: settings.advancesAccountCode,
      accountNameAr: "مدينون - سلف موظفين مستردة من الرواتب",
      debit: 0,
      credit: payrollRun.totalAdvanceDeductions,
      description: `استرداد أقساط سلف موظفين من مسير ${payrollRun.periodLabel}`,
      branchId: payrollRun.branchId,
    });
  }

  // 8. Cr: Absence / Lateness / Penalty Deductions
  const totalInternalDeductions =
    payrollRun.totalAbsenceDeductions + payrollRun.totalLateDeductions + payrollRun.totalPenalties + payrollRun.totalOtherDeductions;
  if (totalInternalDeductions > 0) {
    lines.push({
      id: `jl-pr-ded-${Date.now()}`,
      accountCode: settings.salariesExpenseAccountCode,
      accountNameAr: "تخفيض مصروف الرواتب - جزاءات وغيابات",
      debit: 0,
      credit: totalInternalDeductions,
      description: `خصومات غياب وجزاءات من مسير ${payrollRun.periodLabel}`,
      branchId: payrollRun.branchId,
    });
  }

  // Validate balance
  const totalDebit = lines.reduce((acc, l) => acc + (l.debit || 0), 0);
  const totalCredit = lines.reduce((acc, l) => acc + (l.credit || 0), 0);

  return {
    id: `je-pr-accrual-${payrollRun.id}`,
    entryNumber: `JE-HR-${Date.now().toString().slice(-6)}`,
    date: entryDate,
    reference: payrollRun.runNumber,
    sourceModule: "EXPENSE",
    sourceTransactionId: payrollRun.id,
    description: `قيد استحقاق رواتب ${payrollRun.periodLabel} - ${payrollRun.branchName} (${payrollRun.employeeCount} موظف)`,
    lines,
    totalDebit,
    totalCredit,
    branchId: payrollRun.branchId,
    status: "POSTED",
    isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
    createdBy: user,
    createdAt: new Date().toISOString(),
    notes: `قيد آلي مولد من موديول HR & Payroll لمسير ${payrollRun.periodLabel}`,
  };
}

/**
 * Generates an automated Balanced Journal Entry for Payroll Payment (صرف الرواتب)
 * Dr. 2050 (Salaries Payable)
 * Cr. 1010/1020 (Treasury or Bank Account)
 */
export function generatePayrollPaymentJournal({
  payrollRun,
  treasuryAccountCode,
  treasuryName,
  user,
}: {
  payrollRun: PayrollRun;
  treasuryAccountCode: string;
  treasuryName: string;
  user: string;
}): JournalEntry {
  const amount = payrollRun.totalNetSalary;
  const entryDate = new Date().toISOString().split("T")[0];

  const lines: JournalLine[] = [
    {
      id: `jl-pr-pay-dr-${Date.now()}`,
      accountCode: "2050",
      accountNameAr: "مصروفات مستحقة - سداد صافي رواتب وأجور",
      debit: amount,
      credit: 0,
      description: `سداد صافي رواتب مسير ${payrollRun.periodLabel} لعدد ${payrollRun.employeeCount} موظف`,
      branchId: payrollRun.branchId,
    },
    {
      id: `jl-pr-pay-cr-${Date.now()}`,
      accountCode: treasuryAccountCode,
      accountNameAr: treasuryName,
      debit: 0,
      credit: amount,
      description: `صرف رواتب مسير ${payrollRun.periodLabel} من ${treasuryName}`,
      branchId: payrollRun.branchId,
    },
  ];

  return {
    id: `je-pr-pay-${payrollRun.id}`,
    entryNumber: `JE-HR-PAY-${Date.now().toString().slice(-6)}`,
    date: entryDate,
    reference: payrollRun.runNumber,
    sourceModule: "TREASURY_PAYMENT",
    sourceTransactionId: payrollRun.id,
    description: `قيد صرف مسير رواتب ${payrollRun.periodLabel} - ${treasuryName}`,
    lines,
    totalDebit: amount,
    totalCredit: amount,
    branchId: payrollRun.branchId,
    status: "POSTED",
    isBalanced: true,
    createdBy: user,
    createdAt: new Date().toISOString(),
    notes: `تم الصرف الفعلي لمسير الرواتب بقيمة ${formatEGP(amount)} من ${treasuryName}`,
  };
}
