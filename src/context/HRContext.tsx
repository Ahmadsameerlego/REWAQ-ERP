"use client";

import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import {
  HrRole,
  Employee,
  Department,
  Position,
  EmploymentContract,
  WorkSchedule,
  AttendanceRecord,
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  EmployeeAdvance,
  PayrollRun,
  PayrollItem,
  Payslip,
  FinalSettlement,
  EgyptianHrSettings,
  HrAuditLog,
  HrSmartInsight,
  EmployeeSalaryHistory,
  PaymentMethod,
} from "@/types/hr";
import {
  DEFAULT_EGYPTIAN_HR_SETTINGS,
  computeEmployeePayrollItem,
  generatePayrollAccrualJournal,
  generatePayrollPaymentJournal,
  formatEGP,
} from "@/lib/hrEngine";
import { useFinance } from "@/context/FinanceContext";

interface HRContextType {
  // Roles & Security Simulation
  activeRole: HrRole;
  setActiveRole: (role: HrRole) => void;
  currentEmployeeId: string;
  setCurrentEmployeeId: (id: string) => void;

  // Employees & Lifecycle
  employees: Employee[];
  salaryHistories: EmployeeSalaryHistory[];
  addEmployee: (employeeData: Partial<Employee>, contractData?: Partial<EmploymentContract>, user?: string) => Employee;
  updateEmployee: (id: string, updates: Partial<Employee>, user?: string) => void;
  changeEmployeeSalary: (employeeId: string, newSalary: number, reason: string, effectiveDate: string, user: string) => void;
  terminateEmployee: (employeeId: string, terminationDate: string, reason: string, user: string) => void;

  // Departments & Positions
  departments: Department[];
  positions: Position[];
  addDepartment: (dept: Omit<Department, "id">) => Department;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  addPosition: (pos: Omit<Position, "id">) => Position;
  updatePosition: (id: string, updates: Partial<Position>) => void;

  // Employment Contracts
  contracts: EmploymentContract[];
  addContract: (contract: Omit<EmploymentContract, "id" | "contractNumber">) => EmploymentContract;
  updateContract: (id: string, updates: Partial<EmploymentContract>) => void;
  renewContract: (id: string, newEndDate: string, newSalary?: number, user?: string) => void;

  // Work Schedules
  schedules: WorkSchedule[];
  addSchedule: (sch: Omit<WorkSchedule, "id" | "code">) => WorkSchedule;
  updateSchedule: (id: string, updates: Partial<WorkSchedule>) => void;

  // Attendance
  attendanceRecords: AttendanceRecord[];
  recordPunch: (employeeId: string, type: "CHECK_IN" | "CHECK_OUT", source?: AttendanceRecord["source"]) => AttendanceRecord;
  addManualAttendance: (data: Omit<AttendanceRecord, "id">, user: string, reason: string) => AttendanceRecord;
  updateAttendance: (id: string, updates: Partial<AttendanceRecord>, user: string, reason: string) => void;

  // Leaves & Balances
  leaveTypes: LeaveType[];
  leaveBalances: LeaveBalance[];
  leaveRequests: LeaveRequest[];
  createLeaveRequest: (data: Omit<LeaveRequest, "id" | "requestNumber" | "status" | "requestedAt">) => LeaveRequest;
  approveLeaveRequest: (id: string, user: string) => void;
  rejectLeaveRequest: (id: string, user: string, reason: string) => void;
  adjustLeaveBalance: (balanceId: string, adjustments: { entitled?: number; used?: number }, user: string) => void;

  // Employee Advances (Loans)
  advances: EmployeeAdvance[];
  createAdvance: (data: Omit<EmployeeAdvance, "id" | "advanceNumber" | "remainingBalance" | "status" | "repayments">, user: string) => EmployeeAdvance;
  approveAdvance: (id: string, user: string) => void;
  cancelAdvance: (id: string, user: string) => void;

  // Monthly Payroll Runs
  payrollRuns: PayrollRun[];
  createPayrollRun: (month: number, year: number, branchId: string, user: string) => PayrollRun;
  recalculatePayrollRun: (runId: string) => PayrollRun | null;
  updatePayrollItem: (runId: string, itemId: string, updates: Partial<PayrollItem>, user: string) => void;
  reviewPayrollRun: (runId: string, user: string) => void;
  approvePayrollRun: (runId: string, user: string) => { success: boolean; journalEntryId?: string };
  payPayrollRun: (runId: string, treasuryId: string, paymentMethod: PaymentMethod, user: string) => { success: boolean; journalEntryId?: string };
  closePayrollRun: (runId: string, user: string) => void;

  // Payslips
  payslips: Payslip[];
  getPayslipByEmployeeAndPeriod: (employeeId: string, month: number, year: number) => Payslip | undefined;

  // Final Settlements
  finalSettlements: FinalSettlement[];
  createFinalSettlement: (data: Omit<FinalSettlement, "id" | "settlementNumber" | "status" | "createdAt">, user: string) => FinalSettlement;
  approveFinalSettlement: (id: string, user: string) => void;
  payFinalSettlement: (id: string, treasuryId: string, user: string) => void;

  // Settings & Egyptian Compliance
  settings: EgyptianHrSettings;
  updateSettings: (updates: Partial<EgyptianHrSettings>, user: string) => void;

  // Audit Logs & Smart Insights
  auditLogs: HrAuditLog[];
  insights: HrSmartInsight[];
  dismissInsight: (id: string) => void;

  // Summary Metrics & KPIs
  hrMetrics: {
    totalEmployees: number;
    activeEmployees: number;
    onLeaveEmployees: number;
    probationEmployees: number;
    newHiresThisMonth: number;
    expiringContractsCount: number;
    todayPresentCount: number;
    todayLateCount: number;
    todayAbsentCount: number;
    todayLeaveCount: number;
    pendingLeaveRequestsCount: number;
    pendingAdvancesCount: number;
    totalActiveAdvancesBalance: number;
    latestPayrollTotalNet: number;
    latestPayrollEmployerCost: number;
    latestPayrollStatus: string;
  };
}

const HRContext = createContext<HRContextType | undefined>(undefined);

export function HRProvider({ children }: { children: React.ReactNode }) {
  const { createJournalEntry, treasuries, bankAccounts } = useFinance();

  const [activeRole, setActiveRole] = useState<HrRole>("HR_ADMIN");
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>("emp-101");
  const [settings, setSettings] = useState<EgyptianHrSettings>(DEFAULT_EGYPTIAN_HR_SETTINGS);

  // 1. Departments
  const [departments, setDepartments] = useState<Department[]>([
    { id: "dept-sales", code: "D-01", nameAr: "إدارة مبيعات الصالات والمعارض", nameEn: "Showroom Sales", branchId: "ALL", branchName: "كل الفروع", managerId: "emp-102", managerName: "سارة المهدي", costCenterId: "cc-cairo", status: "ACTIVE", description: "مسؤولو مبيعات الأثاث والمفروشات واستقبال العملاء بالصالات", employeeCount: 5 },
    { id: "dept-design", code: "D-02", nameAr: "التصميم الداخلي والديكور (3D Studio)", nameEn: "Interior Design & 3D", branchId: "branch-cairo", branchName: "فرع التجمع الرئيسي", managerId: "emp-103", managerName: "م. كريم علام", costCenterId: "cc-cairo", status: "ACTIVE", description: "استشارات الديكور، وتخطيط المساحات والرسومات التنفيذية للأثاث", employeeCount: 2 },
    { id: "dept-logistics", code: "D-03", nameAr: "الشحن واللوجستيات والتركيبات", nameEn: "Dispatch & Assembly", branchId: "branch-cairo", branchName: "فرع التجمع الرئيسي", managerId: "emp-104", managerName: "كابتن وليد فاروق", costCenterId: "cc-cairo", status: "ACTIVE", description: "أسطول النقل، التشوين، والتسليم وفنيو تجميع غرف النوم والصالونات", employeeCount: 3 },
    { id: "dept-factory", code: "D-04", nameAr: "مصنع ومستودع دمياط للأخشاب", nameEn: "Damietta Factory & Woodcraft", branchId: "branch-damietta", branchName: "مستودع ومصنع دمياط", managerId: "emp-105", managerName: "م. أشرف سلامة", costCenterId: "cc-damietta", status: "ACTIVE", description: "تصنيع الخشب الزان، الأقمشة والتنجيد، والدهانات والتشطيبات الفاخرة", employeeCount: 3 },
    { id: "dept-finance", code: "D-05", nameAr: "الإدارة المالية والمحاسبة", nameEn: "Finance & Accounting", branchId: "all-branches", branchName: "الإدارة العامة", managerId: "emp-106", managerName: "أ. هاني عبد الحميد", costCenterId: "cc-admin", status: "ACTIVE", description: "الحسابات العامة، الخزائن، الضرائب، والتكاليف", employeeCount: 2 },
    { id: "dept-hr", code: "D-06", nameAr: "الموارد البشرية والشؤون الإدارية", nameEn: "Human Resources", branchId: "all-branches", branchName: "الإدارة العامة", managerId: "emp-101", managerName: "أحمد سمير", costCenterId: "cc-admin", status: "ACTIVE", description: "التوظيف، الرواتب، التأمينات، والحضور والتدريب", employeeCount: 1 },
  ]);

  // 2. Positions
  const [positions, setPositions] = useState<Position[]>([
    { id: "pos-sm", code: "POS-01", titleAr: "مدير مبيعات المعرض", titleEn: "Showroom Sales Manager", departmentId: "dept-sales", departmentName: "إدارة مبيعات الصالات والمعارض", minSalary: 18000, maxSalary: 28000, status: "ACTIVE", employeeCount: 2 },
    { id: "pos-se", code: "POS-02", titleAr: "مستشار مبيعات أثاث وصالة", titleEn: "Senior Furniture Sales Consultant", departmentId: "dept-sales", departmentName: "إدارة مبيعات الصالات والمعارض", minSalary: 8000, maxSalary: 15000, status: "ACTIVE", employeeCount: 3 },
    { id: "pos-id", code: "POS-03", titleAr: "مهندس تصميم داخلي وديكور 3D", titleEn: "Interior Designer & 3D Artist", departmentId: "dept-design", departmentName: "التصميم الداخلي والديكور (3D Studio)", minSalary: 12000, maxSalary: 20000, status: "ACTIVE", employeeCount: 2 },
    { id: "pos-dr", code: "POS-04", titleAr: "سائق شاحنة نقل أثاث (رخصة ثانية)", titleEn: "Furniture Transport Driver", departmentId: "dept-logistics", departmentName: "الشحن واللوجستيات والتركيبات", minSalary: 7000, maxSalary: 11000, status: "ACTIVE", employeeCount: 2 },
    { id: "pos-tech", code: "POS-05", titleAr: "فني تجميع وتركيب أثاث ماستر", titleEn: "Master Furniture Assembler", departmentId: "dept-logistics", departmentName: "الشحن واللوجستيات والتركيبات", minSalary: 8000, maxSalary: 13000, status: "ACTIVE", employeeCount: 1 },
    { id: "pos-carp", code: "POS-06", titleAr: "أسطى نجارة وتشطيب خشب زان", titleEn: "Master Carpenter", departmentId: "dept-factory", departmentName: "مصنع ومستودع دمياط للأخشاب", minSalary: 9000, maxSalary: 14000, status: "ACTIVE", employeeCount: 2 },
    { id: "pos-pnt", code: "POS-07", titleAr: "فني دهانات وبوليستر ولاكيه", titleEn: "Finishing & Coating Specialist", departmentId: "dept-factory", departmentName: "مصنع ومستودع دمياط للأخشاب", minSalary: 8500, maxSalary: 13000, status: "ACTIVE", employeeCount: 1 },
    { id: "pos-acc", code: "POS-08", titleAr: "محاسب عام وتكاليف معارض", titleEn: "Senior Showroom Accountant", departmentId: "dept-finance", departmentName: "الإدارة المالية والمحاسبة", minSalary: 10000, maxSalary: 16000, status: "ACTIVE", employeeCount: 2 },
    { id: "pos-hr", code: "POS-09", titleAr: "مدير الموارد البشرية والعمليات", titleEn: "HR & Operations Director", departmentId: "dept-hr", departmentName: "الموارد البشرية والشؤون الإدارية", minSalary: 25000, maxSalary: 40000, status: "ACTIVE", employeeCount: 1 },
  ]);

  // 3. Work Schedules
  const [schedules, setSchedules] = useState<WorkSchedule[]>([
    {
      id: "sch-fixed-main",
      code: "SCH-01",
      name: "دوام المعرض الرئيسي (التجمع والخامس)",
      type: "FIXED",
      workDays: ["SUN", "MON", "TUE", "WED", "THU", "SAT"],
      startTime: "10:00",
      endTime: "18:00",
      dailyHours: 8,
      gracePeriodMinutes: 15,
      overtimeAllowed: true,
      overtimeHourRateMultiplier: 1.35,
      weekendDays: ["FRI"],
      isDefault: true,
    },
    {
      id: "sch-mall-shift",
      code: "SCH-02",
      name: "دوام فروع المولات (6 أكتوبر - وردية مسائية)",
      type: "SHIFT",
      workDays: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
      startTime: "14:00",
      endTime: "22:00",
      dailyHours: 8,
      gracePeriodMinutes: 15,
      overtimeAllowed: true,
      overtimeHourRateMultiplier: 1.5,
      weekendDays: ["MON"],
      isDefault: false,
    },
    {
      id: "sch-factory-early",
      code: "SCH-03",
      name: "دوام مصنع ومستودع دمياط (صباحي باكر)",
      type: "FIXED",
      workDays: ["SAT", "SUN", "MON", "TUE", "WED", "THU"],
      startTime: "08:00",
      endTime: "16:00",
      dailyHours: 8,
      gracePeriodMinutes: 10,
      overtimeAllowed: true,
      overtimeHourRateMultiplier: 1.35,
      weekendDays: ["FRI"],
      isDefault: false,
    },
  ]);

  // 4. Leave Types
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([
    { id: "lt-annual", code: "ANNUAL", nameAr: "إجازة سنوية اعتيادية", nameEn: "Annual Leave", annualDays: 21, isPaid: true, paidPercentage: 100, requiresApproval: true, deductsPayroll: false, color: "#109e68", description: "الإجازة السنوية المقررة طبقاً لقانون العمل المصري (21 يوماً وتصل 30 يوماً لمن تجاوز 50 سنة)" },
    { id: "lt-sick", code: "SICK", nameAr: "إجازة مرضية معتمدة", nameEn: "Sick Leave", annualDays: 14, isPaid: true, paidPercentage: 100, requiresApproval: true, deductsPayroll: false, color: "#3b82f6", description: "إجازة مرضية بتقرير طبي معتمد من التأمين الصحي" },
    { id: "lt-emergency", code: "EMERGENCY", nameAr: "إجازة عارضة", nameEn: "Casual / Emergency Leave", annualDays: 6, isPaid: true, paidPercentage: 100, requiresApproval: false, deductsPayroll: false, color: "#f59e0b", description: "بحد أقصى يومين متتاليين و 6 أيام سنوياً" },
    { id: "lt-unpaid", code: "UNPAID", nameAr: "إجازة بدون مرتب", nameEn: "Unpaid Leave", annualDays: 30, isPaid: false, paidPercentage: 0, requiresApproval: true, deductsPayroll: true, color: "#ef4444", description: "تخصم أيام الغياب كاملة من استحقاق الراتب الشهري" },
  ]);

  // 5. Employees Seed Data (15 realistic employees)
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "emp-101",
      employeeCode: "EMP-101",
      fullName: "أحمد سمير مصطفى",
      fullNameEn: "Ahmed Samir Moustafa",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
      nationalId: "28805120102456",
      birthDate: "1988-05-12",
      gender: "MALE",
      maritalStatus: "MARRIED",
      phone: "01001234567",
      email: "ahmed.samir@rewaqerp.com",
      address: "فيلا 14، الحي الدبلوماسي، التجمع الخامس",
      city: "القاهرة الجديدة",
      emergencyContactName: "مروة عادل (الزوجة)",
      emergencyContactPhone: "01123456789",

      branchId: "branch-cairo",
      branchName: "فرع التجمع الرئيسي",
      departmentId: "dept-hr",
      departmentName: "الموارد البشرية والشؤون الإدارية",
      positionId: "pos-hr",
      positionTitle: "مدير الموارد البشرية والعمليات",
      directManagerId: undefined,
      directManagerName: "مجلس الإدارة",
      hireDate: "2023-01-15",
      employmentType: "FULL_TIME",
      status: "ACTIVE",
      workStartDate: "2023-01-15",
      scheduleId: "sch-fixed-main",
      scheduleName: "دوام المعرض الرئيسي (التجمع والخامس)",

      basicSalary: 32000,
      housingAllowance: 3000,
      transportationAllowance: 2000,
      otherAllowances: 1000,
      commissionRate: 0,
      hasSocialInsurance: true,
      socialInsuranceNumber: "14890214",
      insuranceSalaryBase: 12600,
      isSubjectToIncomeTax: true,
      paymentMethod: "BANK_TRANSFER",
      bankName: "البنك التجاري الدولي (CIB)",
      bankAccountNumber: "100045892100",
      iban: "EG38001000458921000100223",
      costCenterId: "cc-admin",
      costCenterName: "الإدارة العامة والمالية",

      documents: [
        { id: "doc-1", name: "عقد العمل الموثق 2026.pdf", type: "CONTRACT", fileUrl: "#", uploadedAt: "2023-01-15" },
        { id: "doc-2", name: "بطاقة الرقم القومي سارية.pdf", type: "NATIONAL_ID", fileUrl: "#", uploadedAt: "2023-01-15" },
      ],
      createdAt: "2023-01-15T09:00:00Z",
      updatedAt: "2026-09-01T10:00:00Z",
    },
    {
      id: "emp-102",
      employeeCode: "EMP-102",
      fullName: "سارة فؤاد المهدي",
      fullNameEn: "Sara Fouad El-Mahdy",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
      nationalId: "29208150103789",
      birthDate: "1992-08-15",
      gender: "FEMALE",
      maritalStatus: "SINGLE",
      phone: "01098765432",
      email: "sara.mahdy@rewaqerp.com",
      address: "عمارة 8، شارع التسعين الشمالي، التجمع الخامس",
      city: "القاهرة الجديدة",
      emergencyContactName: "فؤاد المهدي (الوالد)",
      emergencyContactPhone: "01234567890",

      branchId: "branch-cairo",
      branchName: "فرع التجمع الرئيسي",
      departmentId: "dept-sales",
      departmentName: "إدارة مبيعات الصالات والمعارض",
      positionId: "pos-sm",
      positionTitle: "مدير مبيعات المعرض",
      directManagerId: "emp-101",
      directManagerName: "أحمد سمير",
      hireDate: "2023-03-01",
      employmentType: "FULL_TIME",
      status: "ACTIVE",
      workStartDate: "2023-03-01",
      scheduleId: "sch-fixed-main",
      scheduleName: "دوام المعرض الرئيسي (التجمع والخامس)",

      basicSalary: 22000,
      housingAllowance: 2000,
      transportationAllowance: 1500,
      otherAllowances: 500,
      commissionRate: 1.5,
      hasSocialInsurance: true,
      socialInsuranceNumber: "15902144",
      insuranceSalaryBase: 12600,
      isSubjectToIncomeTax: true,
      paymentMethod: "BANK_TRANSFER",
      bankName: "البنك التجاري الدولي (CIB)",
      bankAccountNumber: "100098234120",
      iban: "EG38001000982341200100881",
      costCenterId: "cc-cairo",
      costCenterName: "فرع التجمع الخامس (الرئيسي)",

      documents: [],
      createdAt: "2023-03-01T09:00:00Z",
      updatedAt: "2026-09-01T10:00:00Z",
    },
    {
      id: "emp-103",
      employeeCode: "EMP-103",
      fullName: "م. كريم علام يوسف",
      fullNameEn: "Karim Allam Youssef",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
      nationalId: "29403210101890",
      birthDate: "1994-03-21",
      gender: "MALE",
      maritalStatus: "MARRIED",
      phone: "01145678901",
      email: "karim.allam@rewaqerp.com",
      address: "كمبوند ميفيدا، القاهرة الجديدة",
      city: "القاهرة",

      branchId: "branch-cairo",
      branchName: "فرع التجمع الرئيسي",
      departmentId: "dept-design",
      departmentName: "التصميم الداخلي والديكور (3D Studio)",
      positionId: "pos-id",
      positionTitle: "مهندس تصميم داخلي وديكور 3D",
      directManagerId: "emp-101",
      directManagerName: "أحمد سمير",
      hireDate: "2023-06-15",
      employmentType: "FULL_TIME",
      status: "ACTIVE",
      workStartDate: "2023-06-15",
      scheduleId: "sch-fixed-main",
      scheduleName: "دوام المعرض الرئيسي (التجمع والخامس)",

      basicSalary: 16000,
      housingAllowance: 1500,
      transportationAllowance: 1000,
      otherAllowances: 500,
      commissionRate: 2.0,
      hasSocialInsurance: true,
      socialInsuranceNumber: "16781200",
      insuranceSalaryBase: 10000,
      isSubjectToIncomeTax: true,
      paymentMethod: "BANK_TRANSFER",
      bankName: "بنك مصر",
      bankAccountNumber: "204018765432",
      iban: "EG6500020401876543200100441",
      costCenterId: "cc-cairo",
      costCenterName: "فرع التجمع الخامس (الرئيسي)",

      documents: [],
      createdAt: "2023-06-15T09:00:00Z",
      updatedAt: "2026-09-01T10:00:00Z",
    },
    {
      id: "emp-104",
      employeeCode: "EMP-104",
      fullName: "وليد فاروق الشناوي",
      fullNameEn: "Walid Farouk El-Shennawy",
      nationalId: "28611050104512",
      birthDate: "1986-11-05",
      gender: "MALE",
      maritalStatus: "MARRIED",
      phone: "01233445566",
      email: "walid.farouk@rewaqerp.com",
      address: "شارع الهرم، الجيزة",
      city: "الجيزة",

      branchId: "branch-cairo",
      branchName: "فرع التجمع الرئيسي",
      departmentId: "dept-logistics",
      departmentName: "الشحن واللوجستيات والتركيبات",
      positionId: "pos-dr",
      positionTitle: "سائق شاحنة نقل أثاث (رخصة ثانية)",
      directManagerId: "emp-101",
      directManagerName: "أحمد سمير",
      hireDate: "2023-08-01",
      employmentType: "FULL_TIME",
      status: "ACTIVE",
      workStartDate: "2023-08-01",
      scheduleId: "sch-fixed-main",
      scheduleName: "دوام المعرض الرئيسي (التجمع والخامس)",

      basicSalary: 9500,
      housingAllowance: 500,
      transportationAllowance: 1000,
      otherAllowances: 500,
      hasSocialInsurance: true,
      socialInsuranceNumber: "17890123",
      insuranceSalaryBase: 7000,
      isSubjectToIncomeTax: true,
      paymentMethod: "CASH",
      costCenterId: "cc-cairo",
      costCenterName: "فرع التجمع الخامس (الرئيسي)",

      documents: [],
      createdAt: "2023-08-01T09:00:00Z",
      updatedAt: "2026-09-01T10:00:00Z",
    },
    {
      id: "emp-105",
      employeeCode: "EMP-105",
      fullName: "م. أشرف سلامة البحيري",
      fullNameEn: "Ashraf Salama El-Beheiry",
      nationalId: "28004181101987",
      birthDate: "1980-04-18",
      gender: "MALE",
      maritalStatus: "MARRIED",
      phone: "01011223344",
      email: "ashraf.salama@rewaqerp.com",
      address: "شارع عبد الرحمن، دمياط القديمة",
      city: "دمياط",

      branchId: "branch-damietta",
      branchName: "مستودع ومصنع دمياط",
      departmentId: "dept-factory",
      departmentName: "مصنع ومستودع دمياط للأخشاب",
      positionId: "pos-carp",
      positionTitle: "أسطى نجارة وتشطيب خشب زان",
      directManagerId: "emp-101",
      directManagerName: "أحمد سمير",
      hireDate: "2023-02-10",
      employmentType: "FULL_TIME",
      status: "ACTIVE",
      workStartDate: "2023-02-10",
      scheduleId: "sch-factory-early",
      scheduleName: "دوام مصنع ومستودع دمياط (صباحي باكر)",

      basicSalary: 13500,
      housingAllowance: 0,
      transportationAllowance: 1000,
      otherAllowances: 1000,
      hasSocialInsurance: true,
      socialInsuranceNumber: "12349081",
      insuranceSalaryBase: 9000,
      isSubjectToIncomeTax: true,
      paymentMethod: "INSTAPAY",
      instapayHandle: "ashraf.salama@instapay",
      costCenterId: "cc-damietta",
      costCenterName: "مستودع ومصنع دمياط",

      documents: [],
      createdAt: "2023-02-10T09:00:00Z",
      updatedAt: "2026-09-01T10:00:00Z",
    },
    {
      id: "emp-106",
      employeeCode: "EMP-106",
      fullName: "هاني عبد الحميد زهران",
      fullNameEn: "Hany Abdelhamid Zahran",
      nationalId: "28709140102145",
      birthDate: "1987-09-14",
      gender: "MALE",
      maritalStatus: "MARRIED",
      phone: "01199887766",
      email: "hany.zahran@rewaqerp.com",
      address: "مدينة نصر، الحي السابع، القاهرة",
      city: "القاهرة",

      branchId: "all-branches",
      branchName: "الإدارة العامة",
      departmentId: "dept-finance",
      departmentName: "الإدارة المالية والمحاسبة",
      positionId: "pos-acc",
      positionTitle: "محاسب عام وتكاليف معارض",
      directManagerId: "emp-101",
      directManagerName: "أحمد سمير",
      hireDate: "2023-04-01",
      employmentType: "FULL_TIME",
      status: "ACTIVE",
      workStartDate: "2023-04-01",
      scheduleId: "sch-fixed-main",
      scheduleName: "دوام المعرض الرئيسي (التجمع والخامس)",

      basicSalary: 14000,
      housingAllowance: 1000,
      transportationAllowance: 1000,
      otherAllowances: 0,
      hasSocialInsurance: true,
      socialInsuranceNumber: "18902451",
      insuranceSalaryBase: 10000,
      isSubjectToIncomeTax: true,
      paymentMethod: "BANK_TRANSFER",
      bankName: "البنك التجاري الدولي (CIB)",
      bankAccountNumber: "100049210087",
      iban: "EG38001000492100870100299",
      costCenterId: "cc-admin",
      costCenterName: "الإدارة العامة والمالية",

      documents: [],
      createdAt: "2023-04-01T09:00:00Z",
      updatedAt: "2026-09-01T10:00:00Z",
    },
    {
      id: "emp-107",
      employeeCode: "EMP-107",
      fullName: "نورهان هشام الصاوي",
      fullNameEn: "Nourhan Hesham El-Sawy",
      nationalId: "29602110103412",
      birthDate: "1996-02-11",
      gender: "FEMALE",
      maritalStatus: "SINGLE",
      phone: "01044556677",
      email: "nourhan.sawy@rewaqerp.com",
      address: "الشيخ زايد، الحي الثامن",
      city: "الجيزة",

      branchId: "branch-october",
      branchName: "فرع 6 أكتوبر (المول)",
      departmentId: "dept-sales",
      departmentName: "إدارة مبيعات الصالات والمعارض",
      positionId: "pos-se",
      positionTitle: "مستشار مبيعات أثاث وصالة",
      directManagerId: "emp-102",
      directManagerName: "سارة المهدي",
      hireDate: "2024-02-01",
      employmentType: "FULL_TIME",
      status: "ACTIVE",
      workStartDate: "2024-02-01",
      scheduleId: "sch-mall-shift",
      scheduleName: "دوام فروع المولات (6 أكتوبر - وردية مسائية)",

      basicSalary: 9000,
      housingAllowance: 1000,
      transportationAllowance: 1000,
      otherAllowances: 500,
      commissionRate: 1.5,
      hasSocialInsurance: true,
      socialInsuranceNumber: "19801244",
      insuranceSalaryBase: 7000,
      isSubjectToIncomeTax: true,
      paymentMethod: "BANK_TRANSFER",
      bankName: "بنك مصر",
      bankAccountNumber: "204099812450",
      costCenterId: "cc-october",
      costCenterName: "فرع 6 أكتوبر (المول)",

      documents: [],
      createdAt: "2024-02-01T09:00:00Z",
      updatedAt: "2026-09-01T10:00:00Z",
    },
    {
      id: "emp-108",
      employeeCode: "EMP-108",
      fullName: "طارق زياد عبد العال",
      fullNameEn: "Tarek Ziad Abdel-Aal",
      nationalId: "29107250105678",
      birthDate: "1991-07-25",
      gender: "MALE",
      maritalStatus: "MARRIED",
      phone: "01288776655",
      email: "tarek.ziad@rewaqerp.com",
      address: "المعادي، شارع النصر",
      city: "القاهرة",

      branchId: "branch-cairo",
      branchName: "فرع التجمع الرئيسي",
      departmentId: "dept-logistics",
      departmentName: "الشحن واللوجستيات والتركيبات",
      positionId: "pos-tech",
      positionTitle: "فني تجميع وتركيب أثاث ماستر",
      directManagerId: "emp-104",
      directManagerName: "وليد فاروق",
      hireDate: "2024-05-15",
      employmentType: "FULL_TIME",
      status: "ACTIVE",
      workStartDate: "2024-05-15",
      scheduleId: "sch-fixed-main",
      scheduleName: "دوام المعرض الرئيسي (التجمع والخامس)",

      basicSalary: 10500,
      housingAllowance: 500,
      transportationAllowance: 1000,
      otherAllowances: 500,
      hasSocialInsurance: true,
      socialInsuranceNumber: "20912441",
      insuranceSalaryBase: 8000,
      isSubjectToIncomeTax: true,
      paymentMethod: "CASH",
      costCenterId: "cc-cairo",
      costCenterName: "فرع التجمع الخامس (الرئيسي)",

      documents: [],
      createdAt: "2024-05-15T09:00:00Z",
      updatedAt: "2026-09-01T10:00:00Z",
    },
    {
      id: "emp-109",
      employeeCode: "EMP-109",
      fullName: "محمود الشناوي عبد ربه",
      fullNameEn: "Mahmoud El-Shennawy",
      nationalId: "28912101601245",
      birthDate: "1989-12-10",
      gender: "MALE",
      maritalStatus: "MARRIED",
      phone: "01066778899",
      email: "mahmoud.tanta@rewaqerp.com",
      address: "شارع البحر، طنطا",
      city: "الغربية",

      branchId: "branch-tanta",
      branchName: "فرع طنطا (الدلتا)",
      departmentId: "dept-sales",
      departmentName: "إدارة مبيعات الصالات والمعارض",
      positionId: "pos-sm",
      positionTitle: "مدير مبيعات المعرض",
      directManagerId: "emp-102",
      directManagerName: "سارة المهدي",
      hireDate: "2024-08-01",
      employmentType: "FULL_TIME",
      status: "ACTIVE",
      workStartDate: "2024-08-01",
      scheduleId: "sch-fixed-main",
      scheduleName: "دوام المعرض الرئيسي (التجمع والخامس)",

      basicSalary: 17000,
      housingAllowance: 1000,
      transportationAllowance: 1000,
      otherAllowances: 500,
      commissionRate: 1.5,
      hasSocialInsurance: true,
      socialInsuranceNumber: "21458901",
      insuranceSalaryBase: 11000,
      isSubjectToIncomeTax: true,
      paymentMethod: "BANK_TRANSFER",
      bankName: "بنك مصر",
      bankAccountNumber: "204011234900",
      costCenterId: "cc-tanta",
      costCenterName: "فرع طنطا (الدلتا)",

      documents: [],
      createdAt: "2024-08-01T09:00:00Z",
      updatedAt: "2026-09-01T10:00:00Z",
    },
    {
      id: "emp-110",
      employeeCode: "EMP-110",
      fullName: "ياسمين خالد العزازي",
      fullNameEn: "Yasmine Khaled El-Azazy",
      nationalId: "29705040102911",
      birthDate: "1997-05-04",
      gender: "FEMALE",
      maritalStatus: "SINGLE",
      phone: "01122334488",
      email: "yasmine.azazy@rewaqerp.com",
      address: "الرحاب، المرحلة الرابعة",
      city: "القاهرة الجديدة",

      branchId: "branch-cairo",
      branchName: "فرع التجمع الرئيسي",
      departmentId: "dept-design",
      departmentName: "التصميم الداخلي والديكور (3D Studio)",
      positionId: "pos-id",
      positionTitle: "مهندس تصميم داخلي وديكور 3D",
      directManagerId: "emp-103",
      directManagerName: "كريم علام",
      hireDate: "2025-01-10",
      employmentType: "FULL_TIME",
      status: "ACTIVE",
      workStartDate: "2025-01-10",
      scheduleId: "sch-fixed-main",
      scheduleName: "دوام المعرض الرئيسي (التجمع والخامس)",

      basicSalary: 13000,
      housingAllowance: 1000,
      transportationAllowance: 1000,
      otherAllowances: 0,
      commissionRate: 2.0,
      hasSocialInsurance: true,
      socialInsuranceNumber: "22345091",
      insuranceSalaryBase: 9000,
      isSubjectToIncomeTax: true,
      paymentMethod: "BANK_TRANSFER",
      bankName: "البنك التجاري الدولي (CIB)",
      bankAccountNumber: "100088712340",
      costCenterId: "cc-cairo",
      costCenterName: "فرع التجمع الخامس (الرئيسي)",

      documents: [],
      createdAt: "2025-01-10T09:00:00Z",
      updatedAt: "2026-09-01T10:00:00Z",
    },
    {
      id: "emp-111",
      employeeCode: "EMP-111",
      fullName: "سامح إبراهيم القاضي",
      fullNameEn: "Sameh Ibrahim El-Kady",
      nationalId: "28409191102450",
      birthDate: "1984-09-19",
      gender: "MALE",
      maritalStatus: "MARRIED",
      phone: "01033221100",
      email: "sameh.kady@rewaqerp.com",
      address: "شارع الجلاء، دمياط",
      city: "دمياط",

      branchId: "branch-damietta",
      branchName: "مستودع ومصنع دمياط",
      departmentId: "dept-factory",
      departmentName: "مصنع ومستودع دمياط للأخشاب",
      positionId: "pos-pnt",
      positionTitle: "فني دهانات وبوليستر ولاكيه",
      directManagerId: "emp-105",
      directManagerName: "أشرف سلامة",
      hireDate: "2025-03-01",
      employmentType: "FULL_TIME",
      status: "ACTIVE",
      workStartDate: "2025-03-01",
      scheduleId: "sch-factory-early",
      scheduleName: "دوام مصنع ومستودع دمياط (صباحي باكر)",

      basicSalary: 11000,
      housingAllowance: 0,
      transportationAllowance: 1000,
      otherAllowances: 500,
      hasSocialInsurance: true,
      socialInsuranceNumber: "23456711",
      insuranceSalaryBase: 8000,
      isSubjectToIncomeTax: true,
      paymentMethod: "CASH",
      costCenterId: "cc-damietta",
      costCenterName: "مستودع ومصنع دمياط",

      documents: [],
      createdAt: "2025-03-01T09:00:00Z",
      updatedAt: "2026-09-01T10:00:00Z",
    },
    {
      id: "emp-112",
      employeeCode: "EMP-112",
      fullName: "منى عادل السعدني",
      fullNameEn: "Mona Adel El-Saadany",
      nationalId: "29801200104521",
      birthDate: "1998-01-20",
      gender: "FEMALE",
      maritalStatus: "SINGLE",
      phone: "01155443322",
      email: "mona.saadany@rewaqerp.com",
      address: "التجمع الثالث، عمارة 12",
      city: "القاهرة الجديدة",

      branchId: "branch-cairo",
      branchName: "فرع التجمع الرئيسي",
      departmentId: "dept-sales",
      departmentName: "إدارة مبيعات الصالات والمعارض",
      positionId: "pos-se",
      positionTitle: "مستشار مبيعات أثاث وصالة",
      directManagerId: "emp-102",
      directManagerName: "سارة المهدي",
      hireDate: "2025-09-01", // New hire
      employmentType: "PROBATION",
      status: "PROBATION",
      workStartDate: "2025-09-01",
      scheduleId: "sch-fixed-main",
      scheduleName: "دوام المعرض الرئيسي (التجمع والخامس)",

      basicSalary: 8500,
      housingAllowance: 500,
      transportationAllowance: 1000,
      otherAllowances: 0,
      commissionRate: 1.5,
      hasSocialInsurance: true,
      socialInsuranceNumber: "24567890",
      insuranceSalaryBase: 6000,
      isSubjectToIncomeTax: true,
      paymentMethod: "BANK_TRANSFER",
      bankName: "البنك التجاري الدولي (CIB)",
      bankAccountNumber: "100077651230",
      costCenterId: "cc-cairo",
      costCenterName: "فرع التجمع الخامس (الرئيسي)",

      documents: [],
      createdAt: "2025-09-01T09:00:00Z",
      updatedAt: "2026-09-01T10:00:00Z",
    },
  ]);

  // 6. Contracts Seed Data
  const [contracts, setContracts] = useState<EmploymentContract[]>([
    {
      id: "cnt-101",
      contractNumber: "CNT-2023-101",
      employeeId: "emp-101",
      employeeName: "أحمد سمير مصطفى",
      contractType: "FULL_TIME",
      startDate: "2023-01-15",
      endDate: "2027-01-14",
      basicSalary: 32000,
      allowancesTotal: 6000,
      probationMonths: 3,
      workingHoursWeekly: 48,
      annualLeaveDays: 21,
      noticePeriodDays: 60,
      status: "ACTIVE",
    },
    {
      id: "cnt-102",
      contractNumber: "CNT-2023-102",
      employeeId: "emp-102",
      employeeName: "سارة فؤاد المهدي",
      contractType: "FULL_TIME",
      startDate: "2023-03-01",
      endDate: "2026-10-15", // Expiring soon in ~23 days!
      basicSalary: 22000,
      allowancesTotal: 4000,
      probationMonths: 3,
      workingHoursWeekly: 48,
      annualLeaveDays: 21,
      noticePeriodDays: 30,
      status: "EXPIRING_SOON",
    },
    {
      id: "cnt-103",
      contractNumber: "CNT-2023-103",
      employeeId: "emp-103",
      employeeName: "م. كريم علام يوسف",
      contractType: "FULL_TIME",
      startDate: "2023-06-15",
      endDate: "2026-10-30", // Expiring soon!
      basicSalary: 16000,
      allowancesTotal: 3000,
      probationMonths: 3,
      workingHoursWeekly: 48,
      annualLeaveDays: 21,
      noticePeriodDays: 30,
      status: "EXPIRING_SOON",
    },
    {
      id: "cnt-104",
      contractNumber: "CNT-2023-104",
      employeeId: "emp-104",
      employeeName: "وليد فاروق الشناوي",
      contractType: "FULL_TIME",
      startDate: "2023-08-01",
      endDate: "2027-07-31",
      basicSalary: 9500,
      allowancesTotal: 2000,
      probationMonths: 3,
      workingHoursWeekly: 48,
      annualLeaveDays: 21,
      noticePeriodDays: 30,
      status: "ACTIVE",
    },
    {
      id: "cnt-112",
      contractNumber: "CNT-2025-112",
      employeeId: "emp-112",
      employeeName: "منى عادل السعدني",
      contractType: "PROBATION",
      startDate: "2025-09-01",
      endDate: "2025-12-01",
      probationMonths: 3,
      probationEndDate: "2025-12-01",
      basicSalary: 8500,
      allowancesTotal: 1500,
      workingHoursWeekly: 48,
      annualLeaveDays: 21,
      noticePeriodDays: 15,
      status: "ACTIVE",
    },
  ]);

  // 7. Salary History Seed Data
  const [salaryHistories, setSalaryHistories] = useState<EmployeeSalaryHistory[]>([
    {
      id: "sh-1",
      employeeId: "emp-101",
      oldSalary: 28000,
      newSalary: 32000,
      effectiveDate: "2025-01-01",
      reason: "علاوة سنوية وترقية للمسؤوليات الإدارية الموسعة",
      changedBy: "مجلس الإدارة",
      createdAt: "2024-12-28T10:00:00Z",
    },
    {
      id: "sh-2",
      employeeId: "emp-102",
      oldSalary: 18000,
      newSalary: 22000,
      effectiveDate: "2025-01-01",
      reason: "علاوة تفوق وتحقيق 140% من مستهدف مبيعات المعارض",
      changedBy: "أحمد سمير",
      createdAt: "2024-12-28T11:00:00Z",
    },
  ]);

  // 8. Attendance Records (Live today + Monthly history)
  const todayStr = "2026-09-22";
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: "att-101-today",
      employeeId: "emp-101",
      employeeCode: "EMP-101",
      employeeName: "أحمد سمير مصطفى",
      branchId: "branch-cairo",
      branchName: "فرع التجمع الرئيسي",
      departmentName: "الموارد البشرية والشؤون الإدارية",
      date: todayStr,
      checkIn: "09:48",
      checkOut: undefined,
      workHours: 7.5,
      lateMinutes: 0,
      earlyLeaveMinutes: 0,
      overtimeHours: 0,
      status: "PRESENT",
      source: "BIOMETRIC",
    },
    {
      id: "att-102-today",
      employeeId: "emp-102",
      employeeCode: "EMP-102",
      employeeName: "سارة فؤاد المهدي",
      branchId: "branch-cairo",
      branchName: "فرع التجمع الرئيسي",
      departmentName: "إدارة مبيعات الصالات والمعارض",
      date: todayStr,
      checkIn: "09:55",
      checkOut: undefined,
      workHours: 7.0,
      lateMinutes: 0,
      earlyLeaveMinutes: 0,
      overtimeHours: 0,
      status: "PRESENT",
      source: "BIOMETRIC",
    },
    {
      id: "att-103-today",
      employeeId: "emp-103",
      employeeCode: "EMP-103",
      employeeName: "م. كريم علام يوسف",
      branchId: "branch-cairo",
      branchName: "فرع التجمع الرئيسي",
      departmentName: "التصميم الداخلي والديكور (3D Studio)",
      date: todayStr,
      checkIn: "10:35",
      checkOut: undefined,
      workHours: 6.5,
      lateMinutes: 20, // 20 mins late
      earlyLeaveMinutes: 0,
      overtimeHours: 0,
      status: "LATE",
      source: "BIOMETRIC",
    },
    {
      id: "att-104-today",
      employeeId: "emp-104",
      employeeCode: "EMP-104",
      employeeName: "وليد فاروق الشناوي",
      branchId: "branch-cairo",
      branchName: "فرع التجمع الرئيسي",
      departmentName: "الشحن واللوجستيات والتركيبات",
      date: todayStr,
      checkIn: "09:30",
      checkOut: undefined,
      workHours: 8.0,
      lateMinutes: 0,
      earlyLeaveMinutes: 0,
      overtimeHours: 2.0, // 2 hours overtime
      status: "PRESENT",
      source: "BIOMETRIC",
    },
    {
      id: "att-105-today",
      employeeId: "emp-105",
      employeeCode: "EMP-105",
      employeeName: "م. أشرف سلامة البحيري",
      branchId: "branch-damietta",
      branchName: "مستودع ومصنع دمياط",
      departmentName: "مصنع ومستودع دمياط للأخشاب",
      date: todayStr,
      checkIn: "07:55",
      checkOut: undefined,
      workHours: 8.0,
      lateMinutes: 0,
      earlyLeaveMinutes: 0,
      overtimeHours: 0,
      status: "PRESENT",
      source: "BIOMETRIC",
    },
    {
      id: "att-106-today",
      employeeId: "emp-106",
      employeeCode: "EMP-106",
      employeeName: "هاني عبد الحميد زهران",
      branchId: "all-branches",
      branchName: "الإدارة العامة",
      departmentName: "الإدارة المالية والمحاسبة",
      date: todayStr,
      checkIn: "09:50",
      checkOut: undefined,
      workHours: 7.0,
      lateMinutes: 0,
      earlyLeaveMinutes: 0,
      overtimeHours: 0,
      status: "PRESENT",
      source: "BIOMETRIC",
    },
    {
      id: "att-107-today",
      employeeId: "emp-107",
      employeeCode: "EMP-107",
      employeeName: "نورهان هشام الصاوي",
      branchId: "branch-october",
      branchName: "فرع 6 أكتوبر (المول)",
      departmentName: "إدارة مبيعات الصالات والمعارض",
      date: todayStr,
      checkIn: undefined,
      checkOut: undefined,
      workHours: 0,
      lateMinutes: 0,
      earlyLeaveMinutes: 0,
      overtimeHours: 0,
      status: "LEAVE",
      source: "SYSTEM",
      notes: "إجازة سنوية معتمدة",
    },
    {
      id: "att-108-today",
      employeeId: "emp-108",
      employeeCode: "EMP-108",
      employeeName: "طارق زياد عبد العال",
      branchId: "branch-cairo",
      branchName: "فرع التجمع الرئيسي",
      departmentName: "الشحن واللوجستيات والتركيبات",
      date: todayStr,
      checkIn: undefined,
      checkOut: undefined,
      workHours: 0,
      lateMinutes: 0,
      earlyLeaveMinutes: 0,
      overtimeHours: 0,
      status: "ABSENT",
      source: "SYSTEM",
      notes: "غياب بدون إذن مسبق",
    },
  ]);

  // 9. Leave Balances & Requests
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([
    { id: "lb-101-ann", employeeId: "emp-101", employeeName: "أحمد سمير مصطفى", leaveTypeId: "lt-annual", leaveTypeName: "إجازة سنوية اعتيادية", year: 2026, entitledDays: 21, usedDays: 4, remainingDays: 17 },
    { id: "lb-102-ann", employeeId: "emp-102", employeeName: "سارة فؤاد المهدي", leaveTypeId: "lt-annual", leaveTypeName: "إجازة سنوية اعتيادية", year: 2026, entitledDays: 21, usedDays: 6, remainingDays: 15 },
    { id: "lb-103-ann", employeeId: "emp-103", employeeName: "م. كريم علام يوسف", leaveTypeId: "lt-annual", leaveTypeName: "إجازة سنوية اعتيادية", year: 2026, entitledDays: 21, usedDays: 8, remainingDays: 13 },
    { id: "lb-107-ann", employeeId: "emp-107", employeeName: "نورهان هشام الصاوي", leaveTypeId: "lt-annual", leaveTypeName: "إجازة سنوية اعتيادية", year: 2026, entitledDays: 21, usedDays: 10, remainingDays: 11 },
  ]);

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: "lr-101",
      requestNumber: "LR-2026-0042",
      employeeId: "emp-107",
      employeeName: "نورهان هشام الصاوي",
      departmentName: "إدارة مبيعات الصالات والمعارض",
      leaveTypeId: "lt-annual",
      leaveTypeName: "إجازة سنوية اعتيادية",
      startDate: "2026-09-22",
      endDate: "2026-09-24",
      daysCount: 3,
      reason: "ظروف عائلية وسفر قصير",
      status: "APPROVED",
      requestedAt: "2026-09-18T14:30:00Z",
      approverName: "سارة المهدي",
      approvedAt: "2026-09-19T09:00:00Z",
    },
    {
      id: "lr-102",
      requestNumber: "LR-2026-0043",
      employeeId: "emp-103",
      employeeName: "م. كريم علام يوسف",
      departmentName: "التصميم الداخلي والديكور (3D Studio)",
      leaveTypeId: "lt-emergency",
      leaveTypeName: "إجازة عارضة",
      startDate: "2026-09-28",
      endDate: "2026-09-29",
      daysCount: 2,
      reason: "تجديد مستندات رسمية وتراخيص",
      status: "PENDING_APPROVAL",
      requestedAt: "2026-09-21T16:00:00Z",
    },
  ]);

  // 10. Advances (Loans)
  const [advances, setAdvances] = useState<EmployeeAdvance[]>([
    {
      id: "adv-101",
      advanceNumber: "ADV-2026-0012",
      employeeId: "emp-104",
      employeeName: "وليد فاروق الشناوي",
      departmentName: "الشحن واللوجستيات والتركيبات",
      branchName: "فرع التجمع الرئيسي",
      requestDate: "2026-08-01",
      totalAmount: 12000,
      installmentCount: 6,
      monthlyInstallment: 2000,
      remainingBalance: 10000,
      startMonth: "2026-08",
      status: "ACTIVE",
      reason: "مصاريف تجديد سيارة خاصة ومصاريف دراسية للأبناء",
      approvedBy: "أحمد سمير",
      approvedAt: "2026-08-02T11:00:00Z",
      repayments: [
        { month: "2026-08", amount: 2000, status: "DEDUCTED", deductedAt: "2026-08-31" },
        { month: "2026-09", amount: 2000, status: "PENDING" },
        { month: "2026-10", amount: 2000, status: "PENDING" },
        { month: "2026-11", amount: 2000, status: "PENDING" },
        { month: "2026-12", amount: 2000, status: "PENDING" },
        { month: "2027-01", amount: 2000, status: "PENDING" },
      ],
    },
    {
      id: "adv-102",
      advanceNumber: "ADV-2026-0013",
      employeeId: "emp-108",
      employeeName: "طارق زياد عبد العال",
      departmentName: "الشحن واللوجستيات والتركيبات",
      branchName: "فرع التجمع الرئيسي",
      requestDate: "2026-09-10",
      totalAmount: 6000,
      installmentCount: 3,
      monthlyInstallment: 2000,
      remainingBalance: 6000,
      startMonth: "2026-09",
      status: "ACTIVE",
      reason: "تجهيز مسكن ومصاريف طارئة",
      approvedBy: "أحمد سمير",
      approvedAt: "2026-09-11T10:30:00Z",
      repayments: [
        { month: "2026-09", amount: 2000, status: "PENDING" },
        { month: "2026-10", amount: 2000, status: "PENDING" },
        { month: "2026-11", amount: 2000, status: "PENDING" },
      ],
    },
  ]);

  // 11. Payroll Runs
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>(() => {
    // Generate August 2026 closed run & September 2026 Draft run
    const augItems: PayrollItem[] = employees.slice(0, 11).map((emp) =>
      computeEmployeePayrollItem({
        employee: emp,
        attendanceRecords: [],
        bonusAmount: emp.id === "emp-102" ? 3500 : 0,
        commissionsAmount: emp.id === "emp-102" ? 4500 : emp.id === "emp-103" ? 2500 : 0,
        settings: DEFAULT_EGYPTIAN_HR_SETTINGS,
      })
    );

    const totalBasicAug = augItems.reduce((acc, i) => acc + i.basicSalary, 0);
    const totalAllowancesAug = augItems.reduce((acc, i) => acc + i.totalAllowances, 0);
    const totalBonusesAug = augItems.reduce((acc, i) => acc + i.bonusAmount, 0);
    const totalCommissionsAug = augItems.reduce((acc, i) => acc + i.commissionsAmount, 0);
    const totalGrossAug = augItems.reduce((acc, i) => acc + i.grossSalary, 0);
    const totalTaxesAug = augItems.reduce((acc, i) => acc + i.incomeTax, 0);
    const totalEmpInsAug = augItems.reduce((acc, i) => acc + i.employeeSocialInsurance, 0);
    const totalEmplrInsAug = augItems.reduce((acc, i) => acc + i.employerSocialInsurance, 0);
    const totalDeductionsAug = augItems.reduce((acc, i) => acc + i.totalDeductions, 0);
    const totalNetAug = augItems.reduce((acc, i) => acc + i.netSalary, 0);

    const augRun: PayrollRun = {
      id: "pr-2026-08",
      runNumber: "PAY-2026-08",
      month: 8,
      year: 2026,
      periodLabel: "أغسطس 2026",
      branchId: "ALL",
      branchName: "كل الفروع مجمعة",
      status: "PAID",
      employeeCount: augItems.length,
      totalBasic: totalBasicAug,
      totalAllowances: totalAllowancesAug,
      totalOvertime: 0,
      totalBonuses: totalBonusesAug,
      totalCommissions: totalCommissionsAug,
      totalGross: totalGrossAug,
      totalAbsenceDeductions: 0,
      totalLateDeductions: 0,
      totalAdvanceDeductions: 2000,
      totalOtherDeductions: 0,
      totalPenalties: 0,
      totalIncomeTax: totalTaxesAug,
      totalEmployeeInsurance: totalEmpInsAug,
      totalEmployerInsurance: totalEmplrInsAug,
      totalStatutoryCost: totalTaxesAug + totalEmpInsAug + totalEmplrInsAug,
      totalDeductions: totalDeductionsAug,
      totalNetSalary: totalNetAug,
      totalEmployerCost: totalGrossAug + totalEmplrInsAug,
      items: augItems,
      accrualJournalEntryId: "je-pr-acc-aug26",
      accrualJournalEntryNumber: "JE-HR-008912",
      paymentJournalEntryId: "je-pr-pay-aug26",
      paymentJournalEntryNumber: "JE-HR-008913",
      paymentMethod: "BANK_TRANSFER",
      paidFromTreasuryName: "البنك التجاري الدولي (CIB)",
      paidAt: "2026-08-31T15:00:00Z",
      createdAt: "2026-08-25T10:00:00Z",
      createdBy: "أحمد سمير",
      approvedBy: "أحمد سمير",
      approvedAt: "2026-08-28T14:00:00Z",
    };

    // September 2026 Active Draft
    const sepItems: PayrollItem[] = employees.map((emp) => {
      const adv = emp.id === "emp-104" ? advances[0] : emp.id === "emp-108" ? advances[1] : undefined;
      const prevAugItem = augItems.find((a) => a.employeeId === emp.id);

      return computeEmployeePayrollItem({
        employee: emp,
        attendanceRecords: attendanceRecords.filter((a) => a.employeeId === emp.id),
        activeAdvance: adv,
        bonusAmount: emp.id === "emp-101" ? 5000 : emp.id === "emp-103" ? 2000 : 0,
        commissionsAmount: emp.id === "emp-102" ? 6200 : emp.id === "emp-107" ? 3100 : 0,
        previousMonthGross: prevAugItem?.grossSalary,
        settings: DEFAULT_EGYPTIAN_HR_SETTINGS,
      });
    });

    const totalBasicSep = sepItems.reduce((acc, i) => acc + i.basicSalary, 0);
    const totalAllowancesSep = sepItems.reduce((acc, i) => acc + i.totalAllowances, 0);
    const totalOvertimeSep = sepItems.reduce((acc, i) => acc + i.overtimeAmount, 0);
    const totalBonusesSep = sepItems.reduce((acc, i) => acc + i.bonusAmount, 0);
    const totalCommissionsSep = sepItems.reduce((acc, i) => acc + i.commissionsAmount, 0);
    const totalGrossSep = sepItems.reduce((acc, i) => acc + i.grossSalary, 0);
    const totalAbsenceSep = sepItems.reduce((acc, i) => acc + i.absenceDeduction, 0);
    const totalLateSep = sepItems.reduce((acc, i) => acc + i.lateDeduction, 0);
    const totalAdvancesSep = sepItems.reduce((acc, i) => acc + i.advanceDeduction, 0);
    const totalTaxesSep = sepItems.reduce((acc, i) => acc + i.incomeTax, 0);
    const totalEmpInsSep = sepItems.reduce((acc, i) => acc + i.employeeSocialInsurance, 0);
    const totalEmplrInsSep = sepItems.reduce((acc, i) => acc + i.employerSocialInsurance, 0);
    const totalDeductionsSep = sepItems.reduce((acc, i) => acc + i.totalDeductions, 0);
    const totalNetSep = sepItems.reduce((acc, i) => acc + i.netSalary, 0);

    const sepRun: PayrollRun = {
      id: "pr-2026-09",
      runNumber: "PAY-2026-09",
      month: 9,
      year: 2026,
      periodLabel: "سبتمبر 2026",
      branchId: "ALL",
      branchName: "كل الفروع مجمعة",
      status: "CALCULATED",
      employeeCount: sepItems.length,
      totalBasic: totalBasicSep,
      totalAllowances: totalAllowancesSep,
      totalOvertime: totalOvertimeSep,
      totalBonuses: totalBonusesSep,
      totalCommissions: totalCommissionsSep,
      totalGross: totalGrossSep,
      totalAbsenceDeductions: totalAbsenceSep,
      totalLateDeductions: totalLateSep,
      totalAdvanceDeductions: totalAdvancesSep,
      totalOtherDeductions: 0,
      totalPenalties: 0,
      totalIncomeTax: totalTaxesSep,
      totalEmployeeInsurance: totalEmpInsSep,
      totalEmployerInsurance: totalEmplrInsSep,
      totalStatutoryCost: totalTaxesSep + totalEmpInsSep + totalEmplrInsSep,
      totalDeductions: totalDeductionsSep,
      totalNetSalary: totalNetSep,
      totalEmployerCost: totalGrossSep + totalEmplrInsSep,
      items: sepItems,
      createdAt: "2026-09-20T08:00:00Z",
      createdBy: "أحمد سمير",
      calculatedAt: "2026-09-22T10:00:00Z",
    };

    return [sepRun, augRun];
  });

  // 12. Payslips
  const payslips = useMemo<Payslip[]>(() => {
    const list: Payslip[] = [];
    payrollRuns.forEach((run) => {
      run.items.forEach((item) => {
        const emp = employees.find((e) => e.id === item.employeeId);
        list.push({
          id: `ps-${run.id}-${item.employeeId}`,
          payslipNumber: `SLIP-${run.year}${String(run.month).padStart(2, "0")}-${item.employeeCode}`,
          payrollRunId: run.id,
          payrollMonth: run.month,
          payrollYear: run.year,
          periodLabel: run.periodLabel,
          employeeId: item.employeeId,
          employeeCode: item.employeeCode,
          employeeName: item.employeeName,
          departmentName: item.departmentName,
          positionTitle: item.positionTitle,
          branchName: item.branchName,
          nationalId: emp?.nationalId || "",
          socialInsuranceNumber: emp?.socialInsuranceNumber,
          bankName: emp?.bankName,
          bankAccountNumber: emp?.bankAccountNumber,

          basicSalary: item.basicSalary,
          housingAllowance: item.housingAllowance,
          transportationAllowance: item.transportationAllowance,
          otherAllowances: item.otherAllowances,
          overtimeAmount: item.overtimeAmount,
          bonusAmount: item.bonusAmount,
          commissionsAmount: item.commissionsAmount,
          grossSalary: item.grossSalary,

          incomeTax: item.incomeTax,
          employeeSocialInsurance: item.employeeSocialInsurance,
          advanceDeduction: item.advanceDeduction,
          absenceDeduction: item.absenceDeduction,
          lateDeduction: item.lateDeduction,
          penaltiesDeduction: item.penaltiesDeduction,
          otherDeductions: item.otherDeductions,
          totalDeductions: item.totalDeductions,

          employerSocialInsurance: item.employerSocialInsurance,
          netSalary: item.netSalary,
          issuedAt: run.calculatedAt || run.createdAt,
          paymentStatus: run.status === "PAID" || run.status === "CLOSED" ? "PAID" : "PENDING",
          paidAt: run.paidAt,
        });
      });
    });
    return list;
  }, [payrollRuns, employees]);

  // 13. Final Settlements
  const [finalSettlements, setFinalSettlements] = useState<FinalSettlement[]>([]);

  // 14. Audit Logs
  const [auditLogs, setAuditLogs] = useState<HrAuditLog[]>([
    {
      id: "log-1",
      action: "EMPLOYEE_CREATED",
      entityType: "EMPLOYEE",
      entityId: "emp-112",
      employeeName: "منى عادل السعدني",
      details: "إضافة موظف جديد وتعيين العقد وراتب 8,500 ج.م بفرع التجمع",
      user: "أحمد سمير",
      timestamp: "2025-09-01T09:00:00Z",
    },
    {
      id: "log-2",
      action: "ADVANCE_CREATED",
      entityType: "ADVANCE",
      entityId: "adv-102",
      employeeName: "طارق زياد عبد العال",
      details: "الموافقة على سلفة طارئة 6,000 ج.م مقسمة على 3 أشهر",
      user: "أحمد سمير",
      timestamp: "2026-09-11T10:30:00Z",
    },
    {
      id: "log-3",
      action: "LEAVE_APPROVED",
      entityType: "LEAVE",
      entityId: "lr-101",
      employeeName: "نورهان هشام الصاوي",
      details: "اعتماد إجازة اعتيادية 3 أيام لشهر سبتمبر",
      user: "سارة المهدي",
      timestamp: "2026-09-19T09:00:00Z",
    },
  ]);

  // 15. Smart Insights
  const [insights, setInsights] = useState<HrSmartInsight[]>([
    {
      id: "ins-1",
      type: "CONTRACT_EXPIRING",
      severity: "WARNING",
      title: "عقود عمل ستنتهي قريباً",
      message: "يوجد 2 عقد عمل (سارة المهدي وم. كريم علام) سينتهيان خلال 30 يوماً وتتطلب التجديد.",
      actionLabel: "مراجعة العقود",
      actionHref: "/dashboard/hr/contracts",
      resolved: false,
      date: "2026-09-22",
    },
    {
      id: "ins-2",
      type: "PAYROLL_SPIKE",
      severity: "INFO",
      title: "مؤشر زيادة في مسير سبتمبر",
      message: "راتب أحمد سمير أعلى بنسبة 15% لوجود مكافأة أداء ربع سنوي بقيمة 5,000 ج.م.",
      actionLabel: "مراجعة المسير",
      actionHref: "/dashboard/hr/payroll/pr-2026-09",
      resolved: false,
      date: "2026-09-22",
    },
    {
      id: "ins-3",
      type: "PENDING_LEAVE",
      severity: "WARNING",
      title: "طلب إجازة معلق بانتظار الاعتماد",
      message: "م. كريم علام تقدم بطلب إجازة عارضة ليومي 28 و 29 سبتمبر بانتظار موافقة الإدارة.",
      actionLabel: "عرض الطلبات",
      actionHref: "/dashboard/hr/leaves",
      resolved: false,
      date: "2026-09-21",
    },
    {
      id: "ins-4",
      type: "MISSING_DATA",
      severity: "INFO",
      title: "بيانات صرف نقدي",
      message: "يوجد 4 موظفين (سائقين وفنيين) يتم صرف رواتبهم نقداً، يمكنك تحويلهم لبطاقات بنكية أو InstaPay.",
      actionLabel: "دليل الموظفين",
      actionHref: "/dashboard/hr/employees",
      resolved: false,
      date: "2026-09-20",
    },
  ]);

  // Log helper
  const addAuditLog = (action: HrAuditLog["action"], entityType: HrAuditLog["entityType"], entityId: string, details: string, user: string, oldValue?: string, newValue?: string, employeeName?: string) => {
    const newLog: HrAuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      action,
      entityType,
      entityId,
      employeeName,
      details,
      oldValue,
      newValue,
      user,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // 1. Employee Management Methods
  const addEmployee = (
    employeeData: Partial<Employee>,
    contractData?: Partial<EmploymentContract>,
    user: string = "أحمد سمير"
  ): Employee => {
    const newId = `emp-${Date.now()}`;
    const nextCode = `EMP-${100 + employees.length + 1}`;

    const newEmployee: Employee = {
      id: newId,
      employeeCode: employeeData.employeeCode || nextCode,
      fullName: employeeData.fullName || "موظف جديد",
      fullNameEn: employeeData.fullNameEn || "",
      avatarUrl: employeeData.avatarUrl,
      nationalId: employeeData.nationalId || "",
      birthDate: employeeData.birthDate || "1995-01-01",
      gender: employeeData.gender || "MALE",
      maritalStatus: employeeData.maritalStatus || "SINGLE",
      phone: employeeData.phone || "",
      email: employeeData.email || "",
      address: employeeData.address || "",
      city: employeeData.city || "القاهرة",

      branchId: employeeData.branchId || "branch-cairo",
      branchName: employeeData.branchName || "فرع التجمع الرئيسي",
      departmentId: employeeData.departmentId || "dept-sales",
      departmentName: employeeData.departmentName || "إدارة مبيعات الصالات والمعارض",
      positionId: employeeData.positionId || "pos-se",
      positionTitle: employeeData.positionTitle || "مستشار مبيعات أثاث وصالة",
      directManagerId: employeeData.directManagerId,
      directManagerName: employeeData.directManagerName,
      hireDate: employeeData.hireDate || new Date().toISOString().split("T")[0],
      employmentType: employeeData.employmentType || "FULL_TIME",
      status: employeeData.status || "ACTIVE",
      workStartDate: employeeData.workStartDate || new Date().toISOString().split("T")[0],
      scheduleId: employeeData.scheduleId || "sch-fixed-main",
      scheduleName: employeeData.scheduleName || "دوام المعرض الرئيسي (التجمع والخامس)",

      basicSalary: employeeData.basicSalary || 8000,
      housingAllowance: employeeData.housingAllowance || 0,
      transportationAllowance: employeeData.transportationAllowance || 1000,
      otherAllowances: employeeData.otherAllowances || 0,
      commissionRate: employeeData.commissionRate || 0,
      hasSocialInsurance: employeeData.hasSocialInsurance ?? true,
      socialInsuranceNumber: employeeData.socialInsuranceNumber,
      insuranceSalaryBase: employeeData.insuranceSalaryBase || employeeData.basicSalary || 6000,
      isSubjectToIncomeTax: employeeData.isSubjectToIncomeTax ?? true,
      paymentMethod: employeeData.paymentMethod || "BANK_TRANSFER",
      bankName: employeeData.bankName,
      bankAccountNumber: employeeData.bankAccountNumber,
      iban: employeeData.iban,
      instapayHandle: employeeData.instapayHandle,
      costCenterId: employeeData.costCenterId || "cc-cairo",
      costCenterName: employeeData.costCenterName || "فرع التجمع الخامس (الرئيسي)",

      documents: employeeData.documents || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEmployees((prev) => [newEmployee, ...prev]);

    // Create automatic contract if specified or default
    const newContract: EmploymentContract = {
      id: `cnt-${newId}`,
      contractNumber: `CNT-${new Date().getFullYear()}-${nextCode}`,
      employeeId: newId,
      employeeName: newEmployee.fullName,
      contractType: newEmployee.employmentType,
      startDate: newEmployee.workStartDate,
      endDate: contractData?.endDate || "2027-12-31",
      basicSalary: newEmployee.basicSalary,
      allowancesTotal: newEmployee.housingAllowance + newEmployee.transportationAllowance + newEmployee.otherAllowances,
      probationMonths: contractData?.probationMonths ?? 3,
      workingHoursWeekly: contractData?.workingHoursWeekly ?? 48,
      annualLeaveDays: contractData?.annualLeaveDays ?? 21,
      noticePeriodDays: contractData?.noticePeriodDays ?? 30,
      status: "ACTIVE",
    };
    setContracts((prev) => [newContract, ...prev]);

    // Create default leave balance
    const newBalance: LeaveBalance = {
      id: `lb-${newId}-ann`,
      employeeId: newId,
      employeeName: newEmployee.fullName,
      leaveTypeId: "lt-annual",
      leaveTypeName: "إجازة سنوية اعتيادية",
      year: new Date().getFullYear(),
      entitledDays: 21,
      usedDays: 0,
      remainingDays: 21,
    };
    setLeaveBalances((prev) => [...prev, newBalance]);

    addAuditLog("EMPLOYEE_CREATED", "EMPLOYEE", newId, `إنشاء ملف الموظف الجديد: ${newEmployee.fullName} (${newEmployee.positionTitle})`, user, undefined, undefined, newEmployee.fullName);

    return newEmployee;
  };

  const updateEmployee = (id: string, updates: Partial<Employee>, user: string = "أحمد سمير") => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === id) {
          const updated = { ...emp, ...updates, updatedAt: new Date().toISOString() };
          addAuditLog("EMPLOYEE_CREATED", "EMPLOYEE", id, `تحديث بيانات الموظف: ${emp.fullName}`, user, undefined, undefined, emp.fullName);
          return updated;
        }
        return emp;
      })
    );
  };

  const changeEmployeeSalary = (
    employeeId: string,
    newSalary: number,
    reason: string,
    effectiveDate: string,
    user: string = "أحمد سمير"
  ) => {
    const target = employees.find((e) => e.id === employeeId);
    if (!target) return;

    const oldSalary = target.basicSalary;
    const historyEntry: EmployeeSalaryHistory = {
      id: `sh-${Date.now()}`,
      employeeId,
      oldSalary,
      newSalary,
      effectiveDate,
      reason,
      changedBy: user,
      createdAt: new Date().toISOString(),
    };

    setSalaryHistories((prev) => [historyEntry, ...prev]);
    updateEmployee(employeeId, { basicSalary: newSalary }, user);
    addAuditLog(
      "SALARY_CHANGED",
      "EMPLOYEE",
      employeeId,
      `تعديل راتب ${target.fullName} من ${formatEGP(oldSalary)} إلى ${formatEGP(newSalary)}. السبب: ${reason}`,
      user,
      formatEGP(oldSalary),
      formatEGP(newSalary),
      target.fullName
    );
  };

  const terminateEmployee = (employeeId: string, terminationDate: string, reason: string, user: string) => {
    const target = employees.find((e) => e.id === employeeId);
    if (!target) return;

    updateEmployee(employeeId, { status: "TERMINATED", workEndDate: terminationDate }, user);
    addAuditLog(
      "STATUS_CHANGED",
      "EMPLOYEE",
      employeeId,
      `إنهاء خدمة الموظف: ${target.fullName}. السبب: ${reason} (تاريخ الإنهاء: ${terminationDate})`,
      user,
      "ACTIVE",
      "TERMINATED",
      target.fullName
    );
  };

  // 2. Department & Position Methods
  const addDepartment = (dept: Omit<Department, "id">): Department => {
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      ...dept,
    };
    setDepartments((prev) => [...prev, newDept]);
    return newDept;
  };

  const updateDepartment = (id: string, updates: Partial<Department>) => {
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const addPosition = (pos: Omit<Position, "id">): Position => {
    const newPos: Position = {
      id: `pos-${Date.now()}`,
      ...pos,
    };
    setPositions((prev) => [...prev, newPos]);
    return newPos;
  };

  const updatePosition = (id: string, updates: Partial<Position>) => {
    setPositions((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  // 3. Contracts
  const addContract = (contract: Omit<EmploymentContract, "id" | "contractNumber">): EmploymentContract => {
    const newId = `cnt-${Date.now()}`;
    const nextNum = `CNT-${new Date().getFullYear()}-${contracts.length + 101}`;
    const newContract: EmploymentContract = {
      id: newId,
      contractNumber: nextNum,
      ...contract,
    };
    setContracts((prev) => [newContract, ...prev]);
    return newContract;
  };

  const updateContract = (id: string, updates: Partial<EmploymentContract>) => {
    setContracts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const renewContract = (id: string, newEndDate: string, newSalary?: number, user: string = "أحمد سمير") => {
    const contract = contracts.find((c) => c.id === id);
    if (!contract) return;

    updateContract(id, {
      endDate: newEndDate,
      basicSalary: newSalary || contract.basicSalary,
      status: "ACTIVE",
    });

    if (newSalary && newSalary !== contract.basicSalary) {
      changeEmployeeSalary(contract.employeeId, newSalary, "تعديل راتب عند تجديد العقد", new Date().toISOString().split("T")[0], user);
    }

    addAuditLog("STATUS_CHANGED", "CONTRACT" as any, id, `تجديد عقد الموظف ${contract.employeeName} حتى ${newEndDate}`, user, undefined, undefined, contract.employeeName);
  };

  // 4. Schedules
  const addSchedule = (sch: Omit<WorkSchedule, "id" | "code">): WorkSchedule => {
    const newSch: WorkSchedule = {
      id: `sch-${Date.now()}`,
      code: `SCH-${String(schedules.length + 1).padStart(2, "0")}`,
      ...sch,
    };
    setSchedules((prev) => [...prev, newSch]);
    return newSch;
  };

  const updateSchedule = (id: string, updates: Partial<WorkSchedule>) => {
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  // 5. Attendance
  const recordPunch = (employeeId: string, type: "CHECK_IN" | "CHECK_OUT", source: AttendanceRecord["source"] = "PORTAL"): AttendanceRecord => {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);
    const dateStr = now.toISOString().split("T")[0];
    const emp = employees.find((e) => e.id === employeeId);

    const existingIndex = attendanceRecords.findIndex((a) => a.employeeId === employeeId && a.date === dateStr);

    if (existingIndex >= 0) {
      const record = attendanceRecords[existingIndex];
      const updated: AttendanceRecord = {
        ...record,
        checkOut: type === "CHECK_OUT" ? timeStr : record.checkOut,
        workHours: type === "CHECK_OUT" && record.checkIn ? 8.0 : record.workHours,
      };
      setAttendanceRecords((prev) => prev.map((a, i) => (i === existingIndex ? updated : a)));
      return updated;
    } else {
      const isLate = timeStr > "10:15";
      const newRecord: AttendanceRecord = {
        id: `att-${employeeId}-${dateStr}`,
        employeeId,
        employeeCode: emp?.employeeCode || "",
        employeeName: emp?.fullName || "",
        branchId: emp?.branchId || "branch-cairo",
        branchName: emp?.branchName || "فرع التجمع الرئيسي",
        departmentName: emp?.departmentName || "المبيعات",
        date: dateStr,
        checkIn: timeStr,
        workHours: 0,
        lateMinutes: isLate ? 25 : 0,
        earlyLeaveMinutes: 0,
        overtimeHours: 0,
        status: isLate ? "LATE" : "PRESENT",
        source,
      };
      setAttendanceRecords((prev) => [newRecord, ...prev]);
      return newRecord;
    }
  };

  const addManualAttendance = (data: Omit<AttendanceRecord, "id">, user: string, reason: string): AttendanceRecord => {
    const newRecord: AttendanceRecord = {
      id: `att-manual-${Date.now()}`,
      ...data,
      modifiedBy: user,
      modificationReason: reason,
      modifiedAt: new Date().toISOString(),
      source: "MANUAL",
    };
    setAttendanceRecords((prev) => [newRecord, ...prev]);
    addAuditLog("ATTENDANCE_EDITED", "ATTENDANCE", newRecord.id, `تسجيل حضور يدوي للموظف ${data.employeeName} بتاريخ ${data.date}. السبب: ${reason}`, user, undefined, undefined, data.employeeName);
    return newRecord;
  };

  const updateAttendance = (id: string, updates: Partial<AttendanceRecord>, user: string, reason: string) => {
    setAttendanceRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === id) {
          const updated = {
            ...rec,
            ...updates,
            modifiedBy: user,
            modificationReason: reason,
            modifiedAt: new Date().toISOString(),
          };
          addAuditLog("ATTENDANCE_EDITED", "ATTENDANCE", id, `تعديل سجل حضور للموظف ${rec.employeeName} بتاريخ ${rec.date}. السبب: ${reason}`, user, rec.status, updates.status || rec.status, rec.employeeName);
          return updated;
        }
        return rec;
      })
    );
  };

  // 6. Leaves
  const createLeaveRequest = (data: Omit<LeaveRequest, "id" | "requestNumber" | "status" | "requestedAt">): LeaveRequest => {
    const newId = `lr-${Date.now()}`;
    const nextNum = `LR-${new Date().getFullYear()}-${String(leaveRequests.length + 1).padStart(4, "0")}`;

    const newRequest: LeaveRequest = {
      id: newId,
      requestNumber: nextNum,
      ...data,
      status: "PENDING_APPROVAL",
      requestedAt: new Date().toISOString(),
    };

    setLeaveRequests((prev) => [newRequest, ...prev]);
    return newRequest;
  };

  const approveLeaveRequest = (id: string, user: string = "أحمد سمير") => {
    const req = leaveRequests.find((l) => l.id === id);
    if (!req) return;

    setLeaveRequests((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "APPROVED", approverName: user, approvedAt: new Date().toISOString() } : l))
    );

    // Update leave balance
    setLeaveBalances((prev) =>
      prev.map((b) => {
        if (b.employeeId === req.employeeId && b.leaveTypeId === req.leaveTypeId) {
          const used = b.usedDays + req.daysCount;
          return { ...b, usedDays: used, remainingDays: Math.max(0, b.entitledDays - used) };
        }
        return b;
      })
    );

    // Update attendance record on start date
    const dateStr = req.startDate;
    setAttendanceRecords((prev) => {
      const exists = prev.find((a) => a.employeeId === req.employeeId && a.date === dateStr);
      if (exists) {
        return prev.map((a) => (a.id === exists.id ? { ...a, status: "LEAVE", notes: `إجازة معتمدة: ${req.leaveTypeName}` } : a));
      } else {
        const emp = employees.find((e) => e.id === req.employeeId);
        return [
          {
            id: `att-${req.employeeId}-${dateStr}`,
            employeeId: req.employeeId,
            employeeCode: emp?.employeeCode || "",
            employeeName: req.employeeName,
            branchId: emp?.branchId || "branch-cairo",
            branchName: emp?.branchName || "فرع التجمع الرئيسي",
            departmentName: req.departmentName,
            date: dateStr,
            workHours: 0,
            lateMinutes: 0,
            earlyLeaveMinutes: 0,
            overtimeHours: 0,
            status: "LEAVE",
            source: "SYSTEM",
            notes: `إجازة معتمدة: ${req.leaveTypeName}`,
          },
          ...prev,
        ];
      }
    });

    addAuditLog("LEAVE_APPROVED", "LEAVE", id, `اعتماد طلب إجازة ${req.leaveTypeName} (${req.daysCount} يوم) للموظف ${req.employeeName}`, user, "PENDING_APPROVAL", "APPROVED", req.employeeName);
  };

  const rejectLeaveRequest = (id: string, user: string, reason: string) => {
    setLeaveRequests((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "REJECTED", approverName: user, approvedAt: new Date().toISOString(), rejectionReason: reason } : l))
    );
  };

  const adjustLeaveBalance = (balanceId: string, adjustments: { entitled?: number; used?: number }, user: string) => {
    setLeaveBalances((prev) =>
      prev.map((b) => {
        if (b.id === balanceId) {
          const entitled = adjustments.entitled !== undefined ? adjustments.entitled : b.entitledDays;
          const used = adjustments.used !== undefined ? adjustments.used : b.usedDays;
          const remaining = Math.max(0, entitled - used);
          addAuditLog("LEAVE_APPROVED", "LEAVE", balanceId, `تعديل رصيد إجازات الموظف ${b.employeeName} إلى ${entitled} يوماً`, user, String(b.entitledDays), String(entitled), b.employeeName);
          return { ...b, entitledDays: entitled, usedDays: used, remainingDays: remaining };
        }
        return b;
      })
    );
  };

  // 7. Advances
  const createAdvance = (
    data: Omit<EmployeeAdvance, "id" | "advanceNumber" | "remainingBalance" | "status" | "repayments">,
    user: string
  ): EmployeeAdvance => {
    const newId = `adv-${Date.now()}`;
    const nextNum = `ADV-${new Date().getFullYear()}-${String(advances.length + 1).padStart(4, "0")}`;

    const repayments = Array.from({ length: data.installmentCount }).map((_, idx) => {
      const d = new Date();
      d.setMonth(d.getMonth() + idx);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return {
        month: mStr,
        amount: data.monthlyInstallment,
        status: "PENDING" as const,
      };
    });

    const newAdvance: EmployeeAdvance = {
      id: newId,
      advanceNumber: nextNum,
      ...data,
      remainingBalance: data.totalAmount,
      status: "ACTIVE",
      repayments,
      approvedBy: user,
      approvedAt: new Date().toISOString(),
    };

    setAdvances((prev) => [newAdvance, ...prev]);
    addAuditLog("ADVANCE_CREATED", "ADVANCE", newId, `إنشاء سلفة بقيمة ${formatEGP(data.totalAmount)} للموظف ${data.employeeName} على ${data.installmentCount} قسط`, user, undefined, undefined, data.employeeName);
    return newAdvance;
  };

  const approveAdvance = (id: string, user: string) => {
    setAdvances((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "ACTIVE", approvedBy: user, approvedAt: new Date().toISOString() } : a))
    );
  };

  const cancelAdvance = (id: string, user: string) => {
    setAdvances((prev) => prev.map((a) => (a.id === id ? { ...a, status: "CANCELLED" } : a)));
  };

  // 8. Payroll Engine
  const createPayrollRun = (month: number, year: number, branchId: string = "ALL", user: string): PayrollRun => {
    const periodLabelMonth = [
      "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
      "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ][month - 1];
    const periodLabel = `${periodLabelMonth} ${year}`;
    const branchName = branchId === "ALL" ? "كل الفروع مجمعة" : (employees.find((e) => e.branchId === branchId)?.branchName || branchId);

    const eligibleEmployees = employees.filter((e) => {
      if (e.status === "TERMINATED") return false;
      if (branchId !== "ALL" && e.branchId !== branchId) return false;
      return true;
    });

    const items: PayrollItem[] = eligibleEmployees.map((emp) => {
      const activeAdv = advances.find((a) => a.employeeId === emp.id && a.status === "ACTIVE" && a.remainingBalance > 0);
      const empAttendance = attendanceRecords.filter((a) => a.employeeId === emp.id);

      return computeEmployeePayrollItem({
        employee: emp,
        attendanceRecords: empAttendance,
        activeAdvance: activeAdv,
        settings,
      });
    });

    const totalBasic = items.reduce((acc, i) => acc + i.basicSalary, 0);
    const totalAllowances = items.reduce((acc, i) => acc + i.totalAllowances, 0);
    const totalOvertime = items.reduce((acc, i) => acc + i.overtimeAmount, 0);
    const totalBonuses = items.reduce((acc, i) => acc + i.bonusAmount, 0);
    const totalCommissions = items.reduce((acc, i) => acc + i.commissionsAmount, 0);
    const totalGross = items.reduce((acc, i) => acc + i.grossSalary, 0);

    const totalAbsenceDeductions = items.reduce((acc, i) => acc + i.absenceDeduction, 0);
    const totalLateDeductions = items.reduce((acc, i) => acc + i.lateDeduction, 0);
    const totalAdvanceDeductions = items.reduce((acc, i) => acc + i.advanceDeduction, 0);
    const totalOtherDeductions = items.reduce((acc, i) => acc + i.otherDeductions, 0);
    const totalPenalties = items.reduce((acc, i) => acc + i.penaltiesDeduction, 0);

    const totalIncomeTax = items.reduce((acc, i) => acc + i.incomeTax, 0);
    const totalEmployeeInsurance = items.reduce((acc, i) => acc + i.employeeSocialInsurance, 0);
    const totalEmployerInsurance = items.reduce((acc, i) => acc + i.employerSocialInsurance, 0);
    const totalStatutoryCost = totalIncomeTax + totalEmployeeInsurance + totalEmployerInsurance;

    const totalDeductions = items.reduce((acc, i) => acc + i.totalDeductions, 0);
    const totalNetSalary = items.reduce((acc, i) => acc + i.netSalary, 0);
    const totalEmployerCost = totalGross + totalEmployerInsurance;

    const newRun: PayrollRun = {
      id: `pr-${year}-${String(month).padStart(2, "0")}-${Date.now().toString().slice(-4)}`,
      runNumber: `PAY-${year}-${String(month).padStart(2, "0")}`,
      month,
      year,
      periodLabel,
      branchId,
      branchName,
      status: "CALCULATED",

      employeeCount: items.length,
      totalBasic,
      totalAllowances,
      totalOvertime,
      totalBonuses,
      totalCommissions,
      totalGross,

      totalAbsenceDeductions,
      totalLateDeductions,
      totalAdvanceDeductions,
      totalOtherDeductions,
      totalPenalties,

      totalIncomeTax,
      totalEmployeeInsurance,
      totalEmployerInsurance,
      totalStatutoryCost,

      totalDeductions,
      totalNetSalary,
      totalEmployerCost,

      items,
      createdAt: new Date().toISOString(),
      createdBy: user,
      calculatedAt: new Date().toISOString(),
    };

    setPayrollRuns((prev) => [newRun, ...prev]);
    addAuditLog("PAYROLL_CREATED", "PAYROLL", newRun.id, `إنشاء واحتساب مسير رواتب ${periodLabel} (${items.length} موظف - صافي: ${formatEGP(totalNetSalary)})`, user);
    return newRun;
  };

  const recalculatePayrollRun = (runId: string): PayrollRun | null => {
    const run = payrollRuns.find((r) => r.id === runId);
    if (!run || run.status === "CLOSED" || run.status === "PAID") return null;

    const items: PayrollItem[] = run.items.map((item) => {
      const emp = employees.find((e) => e.id === item.employeeId);
      if (!emp) return item;

      const activeAdv = advances.find((a) => a.employeeId === emp.id && a.status === "ACTIVE" && a.remainingBalance > 0);
      const empAttendance = attendanceRecords.filter((a) => a.employeeId === emp.id);

      return computeEmployeePayrollItem({
        employee: emp,
        attendanceRecords: empAttendance,
        activeAdvance: activeAdv,
        bonusAmount: item.bonusAmount,
        commissionsAmount: item.commissionsAmount,
        otherDeductionsAmount: item.otherDeductions,
        penaltiesAmount: item.penaltiesDeduction,
        settings,
      });
    });

    const totalBasic = items.reduce((acc, i) => acc + i.basicSalary, 0);
    const totalAllowances = items.reduce((acc, i) => acc + i.totalAllowances, 0);
    const totalOvertime = items.reduce((acc, i) => acc + i.overtimeAmount, 0);
    const totalBonuses = items.reduce((acc, i) => acc + i.bonusAmount, 0);
    const totalCommissions = items.reduce((acc, i) => acc + i.commissionsAmount, 0);
    const totalGross = items.reduce((acc, i) => acc + i.grossSalary, 0);

    const totalAbsenceDeductions = items.reduce((acc, i) => acc + i.absenceDeduction, 0);
    const totalLateDeductions = items.reduce((acc, i) => acc + i.lateDeduction, 0);
    const totalAdvanceDeductions = items.reduce((acc, i) => acc + i.advanceDeduction, 0);
    const totalOtherDeductions = items.reduce((acc, i) => acc + i.otherDeductions, 0);
    const totalPenalties = items.reduce((acc, i) => acc + i.penaltiesDeduction, 0);

    const totalIncomeTax = items.reduce((acc, i) => acc + i.incomeTax, 0);
    const totalEmployeeInsurance = items.reduce((acc, i) => acc + i.employeeSocialInsurance, 0);
    const totalEmployerInsurance = items.reduce((acc, i) => acc + i.employerSocialInsurance, 0);
    const totalStatutoryCost = totalIncomeTax + totalEmployeeInsurance + totalEmployerInsurance;

    const totalDeductions = items.reduce((acc, i) => acc + i.totalDeductions, 0);
    const totalNetSalary = items.reduce((acc, i) => acc + i.netSalary, 0);
    const totalEmployerCost = totalGross + totalEmployerInsurance;

    const updatedRun: PayrollRun = {
      ...run,
      totalBasic,
      totalAllowances,
      totalOvertime,
      totalBonuses,
      totalCommissions,
      totalGross,
      totalAbsenceDeductions,
      totalLateDeductions,
      totalAdvanceDeductions,
      totalOtherDeductions,
      totalPenalties,
      totalIncomeTax,
      totalEmployeeInsurance,
      totalEmployerInsurance,
      totalStatutoryCost,
      totalDeductions,
      totalNetSalary,
      totalEmployerCost,
      items,
      calculatedAt: new Date().toISOString(),
    };

    setPayrollRuns((prev) => prev.map((r) => (r.id === runId ? updatedRun : r)));
    return updatedRun;
  };

  const updatePayrollItem = (runId: string, itemId: string, updates: Partial<PayrollItem>, user: string) => {
    setPayrollRuns((prev) =>
      prev.map((run) => {
        if (run.id === runId) {
          const updatedItems = run.items.map((item) => {
            if (item.id === itemId) {
              const merged = { ...item, ...updates };
              // Recompute totals for this item
              const totalCompanyDeductions = merged.absenceDeduction + merged.lateDeduction + merged.penaltiesDeduction + merged.otherDeductions;
              const totalStatutoryDeductions = merged.incomeTax + merged.employeeSocialInsurance;
              const totalDeductions = totalCompanyDeductions + totalStatutoryDeductions + merged.advanceDeduction;
              const grossSalary = merged.basicSalary + merged.totalAllowances + merged.overtimeAmount + merged.bonusAmount + merged.commissionsAmount;
              const netSalary = Math.max(0, grossSalary - totalDeductions);
              return { ...merged, totalCompanyDeductions, totalStatutoryDeductions, totalDeductions, grossSalary, netSalary };
            }
            return item;
          });

          const totalGross = updatedItems.reduce((acc, i) => acc + i.grossSalary, 0);
          const totalNetSalary = updatedItems.reduce((acc, i) => acc + i.netSalary, 0);
          const totalDeductions = updatedItems.reduce((acc, i) => acc + i.totalDeductions, 0);
          return { ...run, items: updatedItems, totalGross, totalNetSalary, totalDeductions };
        }
        return run;
      })
    );
  };

  const reviewPayrollRun = (runId: string, user: string) => {
    setPayrollRuns((prev) =>
      prev.map((r) => (r.id === runId ? { ...r, status: "REVIEWED", reviewedBy: user, reviewedAt: new Date().toISOString() } : r))
    );
  };

  const approvePayrollRun = (runId: string, user: string): { success: boolean; journalEntryId?: string } => {
    const run = payrollRuns.find((r) => r.id === runId);
    if (!run) return { success: false };

    // 1. Generate Accounting Accrual Journal Entry and save in Finance Context!
    const accrualJournal = generatePayrollAccrualJournal({
      payrollRun: run,
      user,
      settings,
    });

    createJournalEntry(accrualJournal);

    // 2. Mark Payroll as APPROVED and link journal entry ID
    setPayrollRuns((prev) =>
      prev.map((r) =>
        r.id === runId
          ? {
              ...r,
              status: "APPROVED",
              approvedBy: user,
              approvedAt: new Date().toISOString(),
              accrualJournalEntryId: accrualJournal.id,
              accrualJournalEntryNumber: accrualJournal.entryNumber,
            }
          : r
      )
    );

    addAuditLog("PAYROLL_APPROVED", "PAYROLL", runId, `اعتماد مسير رواتب ${run.periodLabel} وتوليد قيد الاستحقاق اليومي رقم ${accrualJournal.entryNumber} بمبلغ ${formatEGP(run.totalGross)}`, user);

    return { success: true, journalEntryId: accrualJournal.id };
  };

  const payPayrollRun = (
    runId: string,
    treasuryId: string,
    paymentMethod: PaymentMethod,
    user: string
  ): { success: boolean; journalEntryId?: string } => {
    const run = payrollRuns.find((r) => r.id === runId);
    if (!run) return { success: false };

    // Find treasury or bank account name
    const tr = treasuries.find((t) => t.id === treasuryId);
    const bnk = bankAccounts.find((b) => b.id === treasuryId);
    const treasuryName = tr ? tr.nameAr : bnk ? bnk.bankName : "خزينة الفرع الرئيسي";
    const treasuryAccountCode = tr ? tr.accountCode : bnk ? bnk.accountCode : "1010";

    // 1. Generate Accounting Payment Journal Entry
    const paymentJournal = generatePayrollPaymentJournal({
      payrollRun: run,
      treasuryAccountCode,
      treasuryName,
      user,
    });

    createJournalEntry(paymentJournal);

    // 2. Deduct advance installments from active advances
    run.items.forEach((item) => {
      if (item.advanceDeduction > 0) {
        setAdvances((prev) =>
          prev.map((adv) => {
            if (adv.employeeId === item.employeeId && adv.status === "ACTIVE") {
              const remaining = Math.max(0, adv.remainingBalance - item.advanceDeduction);
              const status = remaining === 0 ? ("COMPLETED" as const) : ("ACTIVE" as const);
              return {
                ...adv,
                remainingBalance: remaining,
                status,
                repayments: adv.repayments.map((rp) =>
                  rp.month === `${run.year}-${String(run.month).padStart(2, "0")}`
                    ? { ...rp, status: "DEDUCTED" as const, deductedAt: new Date().toISOString() }
                    : rp
                ),
              };
            }
            return adv;
          })
        );
      }
    });

    // 3. Mark Payroll as PAID
    setPayrollRuns((prev) =>
      prev.map((r) =>
        r.id === runId
          ? {
              ...r,
              status: "PAID",
              paymentJournalEntryId: paymentJournal.id,
              paymentJournalEntryNumber: paymentJournal.entryNumber,
              paymentMethod,
              paidFromTreasuryId: treasuryId,
              paidFromTreasuryName: treasuryName,
              paidAt: new Date().toISOString(),
            }
          : r
      )
    );

    addAuditLog("PAYROLL_PAID", "PAYROLL", runId, `صرف مسير رواتب ${run.periodLabel} بقيمة ${formatEGP(run.totalNetSalary)} من ${treasuryName} وتوليد قيد الصرف رقم ${paymentJournal.entryNumber}`, user);

    return { success: true, journalEntryId: paymentJournal.id };
  };

  const closePayrollRun = (runId: string, user: string) => {
    setPayrollRuns((prev) =>
      prev.map((r) => (r.id === runId ? { ...r, status: "CLOSED", closedBy: user, closedAt: new Date().toISOString() } : r))
    );
  };

  // 9. Payslips query
  const getPayslipByEmployeeAndPeriod = (employeeId: string, month: number, year: number): Payslip | undefined => {
    return payslips.find((p) => p.employeeId === employeeId && p.payrollMonth === month && p.payrollYear === year);
  };

  // 10. Final Settlements
  const createFinalSettlement = (
    data: Omit<FinalSettlement, "id" | "settlementNumber" | "status" | "createdAt">,
    user: string
  ): FinalSettlement => {
    const newId = `set-${Date.now()}`;
    const nextNum = `SET-${new Date().getFullYear()}-${String(finalSettlements.length + 1).padStart(4, "0")}`;

    const newSettlement: FinalSettlement = {
      id: newId,
      settlementNumber: nextNum,
      ...data,
      status: "APPROVED",
      approvedBy: user,
      approvedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setFinalSettlements((prev) => [newSettlement, ...prev]);
    terminateEmployee(data.employeeId, data.terminationDate, `مخالصة نهائية رقم ${nextNum}`, user);
    addAuditLog("SETTLEMENT_CREATED", "SETTLEMENT", newId, `إنشاء واعتماد مخالصة نهاية خدمة للموظف ${data.employeeName} بصافي تسوية ${formatEGP(data.netSettlementAmount)}`, user, undefined, undefined, data.employeeName);
    return newSettlement;
  };

  const approveFinalSettlement = (id: string, user: string) => {
    setFinalSettlements((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "APPROVED", approvedBy: user, approvedAt: new Date().toISOString() } : s))
    );
  };

  const payFinalSettlement = (id: string, treasuryId: string, user: string) => {
    setFinalSettlements((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "PAID", paidFromTreasuryId: treasuryId } : s))
    );
  };

  // 11. Settings
  const updateSettings = (updates: Partial<EgyptianHrSettings>, user: string) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    addAuditLog("PAYROLL_APPROVED", "PAYROLL", "settings", "تحديث إعدادات الضرائب والتأمينات المصرية والقواعد العامة", user);
  };

  // 12. Dismiss Insight
  const dismissInsight = (id: string) => {
    setInsights((prev) => prev.map((ins) => (ins.id === id ? { ...ins, resolved: true } : ins)));
  };

  // 13. High-level KPIs & Metrics
  const hrMetrics = useMemo(() => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter((e) => e.status === "ACTIVE").length;
    const onLeaveEmployees = employees.filter((e) => e.status === "ON_LEAVE").length;
    const probationEmployees = employees.filter((e) => e.status === "PROBATION").length;
    const newHiresThisMonth = employees.filter((e) => e.hireDate.startsWith("2026-09") || e.hireDate.startsWith("2025-09")).length;

    const expiringContractsCount = contracts.filter((c) => c.status === "EXPIRING_SOON").length;

    const todayPresentCount = attendanceRecords.filter((a) => a.date === todayStr && a.status === "PRESENT").length;
    const todayLateCount = attendanceRecords.filter((a) => a.date === todayStr && a.status === "LATE").length;
    const todayAbsentCount = attendanceRecords.filter((a) => a.date === todayStr && a.status === "ABSENT").length;
    const todayLeaveCount = attendanceRecords.filter((a) => a.date === todayStr && a.status === "LEAVE").length;

    const pendingLeaveRequestsCount = leaveRequests.filter((l) => l.status === "PENDING_APPROVAL").length;
    const pendingAdvancesCount = advances.filter((a) => a.status === "PENDING").length;
    const totalActiveAdvancesBalance = advances.filter((a) => a.status === "ACTIVE").reduce((acc, a) => acc + a.remainingBalance, 0);

    const latestRun = payrollRuns[0];
    const latestPayrollTotalNet = latestRun ? latestRun.totalNetSalary : 0;
    const latestPayrollEmployerCost = latestRun ? latestRun.totalEmployerCost : 0;
    const latestPayrollStatus = latestRun ? latestRun.status : "NONE";

    return {
      totalEmployees,
      activeEmployees,
      onLeaveEmployees,
      probationEmployees,
      newHiresThisMonth,
      expiringContractsCount,
      todayPresentCount,
      todayLateCount,
      todayAbsentCount,
      todayLeaveCount,
      pendingLeaveRequestsCount,
      pendingAdvancesCount,
      totalActiveAdvancesBalance,
      latestPayrollTotalNet,
      latestPayrollEmployerCost,
      latestPayrollStatus,
    };
  }, [employees, contracts, attendanceRecords, leaveRequests, advances, payrollRuns]);

  const value: HRContextType = {
    activeRole,
    setActiveRole,
    currentEmployeeId,
    setCurrentEmployeeId,

    employees,
    salaryHistories,
    addEmployee,
    updateEmployee,
    changeEmployeeSalary,
    terminateEmployee,

    departments,
    positions,
    addDepartment,
    updateDepartment,
    addPosition,
    updatePosition,

    contracts,
    addContract,
    updateContract,
    renewContract,

    schedules,
    addSchedule,
    updateSchedule,

    attendanceRecords,
    recordPunch,
    addManualAttendance,
    updateAttendance,

    leaveTypes,
    leaveBalances,
    leaveRequests,
    createLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    adjustLeaveBalance,

    advances,
    createAdvance,
    approveAdvance,
    cancelAdvance,

    payrollRuns,
    createPayrollRun,
    recalculatePayrollRun,
    updatePayrollItem,
    reviewPayrollRun,
    approvePayrollRun,
    payPayrollRun,
    closePayrollRun,

    payslips,
    getPayslipByEmployeeAndPeriod,

    finalSettlements,
    createFinalSettlement,
    approveFinalSettlement,
    payFinalSettlement,

    settings,
    updateSettings,

    auditLogs,
    insights,
    dismissInsight,

    hrMetrics,
  };

  return <HRContext.Provider value={value}>{children}</HRContext.Provider>;
}

export function useHR() {
  const context = useContext(HRContext);
  if (!context) {
    throw new Error("useHR must be used within an HRProvider");
  }
  return context;
}
