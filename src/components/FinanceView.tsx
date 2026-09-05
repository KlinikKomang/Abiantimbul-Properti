import React from "react";
import {
  WalletCards,
  Search,
  Plus,
  Send,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  CreditCard,
  Building2,
  FileText,
  X,
  Sparkles,
  ArrowUpRight,
  Edit2,
  Trash2,
  Check,
  RefreshCw,
  Camera,
  Eye,
  FileCheck,
  TrendingDown,
  TrendingUp,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  CalendarRange,
  Tag,
} from "lucide-react";
import { PaymentRecord, Property, Tenant, Room, PaymentStatus, ExpenseRecord } from "../types";
import { formatRupiah } from "../data/mockData";
import { ProofUploader } from "./ProofUploader";
import { ExpenseSection } from "./ExpenseSection";
import { CashFlowSection } from "./CashFlowSection";

interface FinanceViewProps {
  payments: PaymentRecord[];
  expenses?: ExpenseRecord[];
  properties: Property[];
  tenants: Tenant[];
  rooms?: Room[];
  selectedPropertyId: string;
  onRecordPayment: (payment: PaymentRecord) => void;
  onUpdatePayment?: (payment: PaymentRecord) => void;
  onDeletePayment?: (paymentId: string) => void;
  onOpenReceipt: (payment: PaymentRecord) => void;
  onAddExpense?: (expense: ExpenseRecord) => void;
  onUpdateExpense?: (expense: ExpenseRecord) => void;
  onDeleteExpense?: (expenseId: string) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  payments,
  expenses = [],
  properties,
  tenants,
  rooms = [],
  selectedPropertyId,
  onRecordPayment,
  onUpdatePayment,
  onDeletePayment,
  onOpenReceipt,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
}) => {
  const [activeSubTab, setActiveSubTab] = React.useState<"income" | "expenses" | "cashflow">("income");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [propertyFilter, setPropertyFilter] = React.useState<string>(selectedPropertyId);
  const [monthFilter, setMonthFilter] = React.useState<string>("all");
  const [methodFilter, setMethodFilter] = React.useState<string>("all");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [startDate, setStartDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");
  const [sortBy, setSortBy] = React.useState<string>("due_asc");
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = React.useState(false);

  const [isRecordModalOpen, setIsRecordModalOpen] = React.useState(false);
  const [selectedPaymentForEdit, setSelectedPaymentForEdit] = React.useState<PaymentRecord | null>(null);
  const [paymentToDelete, setPaymentToDelete] = React.useState<PaymentRecord | null>(null);
  const [viewingProofPayment, setViewingProofPayment] = React.useState<PaymentRecord | null>(null);

  // Record payment form states
  const [payTenantId, setPayTenantId] = React.useState(tenants[0]?.id || "");
  const [payAmount, setPayAmount] = React.useState(2500000);
  const [payPeriod, setPayPeriod] = React.useState<"Bulanan" | "6 Bulanan" | "Tahunan">("Bulanan");
  const [payMethod, setPayMethod] = React.useState("Transfer BCA");
  const [payDueDate, setPayDueDate] = React.useState("2026-09-05");
  const [payDate, setPayDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [payStatus, setPayStatus] = React.useState<PaymentStatus>("paid");
  const [payCategory, setPayCategory] = React.useState("Sewa Kamar");
  const [payNotes, setPayNotes] = React.useState("");
  const [payProofUrl, setPayProofUrl] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    setPropertyFilter(selectedPropertyId);
  }, [selectedPropertyId]);

  // Extract distinct available months, categories, and methods from payments
  const availableMonths = React.useMemo(() => {
    const months = new Set<string>();
    payments.forEach((p) => {
      if (p.dueDate && p.dueDate.length >= 7) months.add(p.dueDate.substring(0, 7));
      if (p.paidDate && p.paidDate.length >= 7) months.add(p.paidDate.substring(0, 7));
      if (p.paymentDate && p.paymentDate.length >= 7) months.add(p.paymentDate.substring(0, 7));
    });
    return Array.from(months).sort().reverse();
  }, [payments]);

  const availableCategories = React.useMemo(() => {
    const cats = new Set<string>();
    payments.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [payments]);

  const availableMethods = React.useMemo(() => {
    const methods = new Set<string>();
    payments.forEach((p) => {
      if (p.paymentMethod) methods.add(p.paymentMethod);
    });
    return Array.from(methods);
  }, [payments]);

  // Relevant payments according to property filter
  const relevantPayments = React.useMemo(() => {
    return payments.filter((p) => {
      return propertyFilter === "all" || p.propertyId === propertyFilter;
    });
  }, [payments, propertyFilter]);

  // Filter and sort payments
  const filteredPayments = React.useMemo(() => {
    return relevantPayments
      .filter((p) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          p.tenantName.toLowerCase().includes(query) ||
          p.roomNumber.toLowerCase().includes(query) ||
          p.propertyName.toLowerCase().includes(query) ||
          p.invoiceNumber.toLowerCase().includes(query) ||
          (p.notes && p.notes.toLowerCase().includes(query)) ||
          (p.paymentMethod && p.paymentMethod.toLowerCase().includes(query));

        const matchesStatus = statusFilter === "all" || p.status === statusFilter;

        const matchesMonth =
          monthFilter === "all" ||
          p.dueDate.startsWith(monthFilter) ||
          (p.paidDate && p.paidDate.startsWith(monthFilter)) ||
          (p.paymentDate && p.paymentDate.startsWith(monthFilter));

        const matchesMethod =
          methodFilter === "all" ||
          (p.paymentMethod && p.paymentMethod.toLowerCase() === methodFilter.toLowerCase());

        const matchesCategory =
          categoryFilter === "all" ||
          (p.category && p.category.toLowerCase() === categoryFilter.toLowerCase());

        let matchesDateRange = true;
        const targetDate = p.paidDate || p.paymentDate || p.dueDate;
        if (startDate) {
          matchesDateRange = matchesDateRange && targetDate >= startDate;
        }
        if (endDate) {
          matchesDateRange = matchesDateRange && targetDate <= endDate;
        }

        return (
          matchesSearch &&
          matchesStatus &&
          matchesMonth &&
          matchesMethod &&
          matchesCategory &&
          matchesDateRange
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "due_asc":
            return a.dueDate.localeCompare(b.dueDate);
          case "due_desc":
            return b.dueDate.localeCompare(a.dueDate);
          case "amount_desc":
            return b.amount - a.amount;
          case "amount_asc":
            return a.amount - b.amount;
          case "paid_desc": {
            const dateA = a.paidDate || a.paymentDate || a.dueDate;
            const dateB = b.paidDate || b.paymentDate || b.dueDate;
            return dateB.localeCompare(dateA);
          }
          case "tenant_asc":
            return a.tenantName.localeCompare(b.tenantName);
          default:
            return a.dueDate.localeCompare(b.dueDate);
        }
      });
  }, [
    relevantPayments,
    searchQuery,
    statusFilter,
    monthFilter,
    methodFilter,
    categoryFilter,
    startDate,
    endDate,
    sortBy,
  ]);

  // Check if any filter is active
  const hasActiveFilters =
    searchQuery !== "" ||
    statusFilter !== "all" ||
    propertyFilter !== "all" ||
    monthFilter !== "all" ||
    methodFilter !== "all" ||
    categoryFilter !== "all" ||
    startDate !== "" ||
    endDate !== "" ||
    sortBy !== "due_asc";

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPropertyFilter("all");
    setMonthFilter("all");
    setMethodFilter("all");
    setCategoryFilter("all");
    setStartDate("");
    setEndDate("");
    setSortBy("due_asc");
  };

  // Filtered totals
  const filteredTotalAmount = React.useMemo(() => {
    return filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  }, [filteredPayments]);

  const filteredPaidAmount = React.useMemo(() => {
    return filteredPayments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  }, [filteredPayments]);

  const filteredPendingAmount = React.useMemo(() => {
    return filteredPayments.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);
  }, [filteredPayments]);

  const filteredOverdueAmount = React.useMemo(() => {
    return filteredPayments.filter((p) => p.status === "overdue").reduce((sum, p) => sum + p.amount, 0);
  }, [filteredPayments]);

  // Calculate dynamic real totals from filtered/relevant payments data
  const totalPaid = relevantPayments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = relevantPayments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOverdue = relevantPayments
    .filter((p) => p.status === "overdue")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalAll = totalPaid + totalPending + totalOverdue;
  const paidCount = relevantPayments.filter((p) => p.status === "paid").length;
  const pendingCount = relevantPayments.filter((p) => p.status === "pending").length;
  const overdueCount = relevantPayments.filter((p) => p.status === "overdue").length;

  const paidPct = totalAll > 0 ? ((totalPaid / totalAll) * 100).toFixed(1) + "%" : "0%";
  const pendingPct = totalAll > 0 ? ((totalPending / totalAll) * 100).toFixed(1) + "%" : "0%";
  const overduePct = totalAll > 0 ? ((totalOverdue / totalAll) * 100).toFixed(1) + "%" : "0%";

  const handleSaveNewPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = tenants.find((t) => t.id === payTenantId) || tenants[0];
    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      invoiceNumber: `INV-2026-08-${Math.floor(1000 + Math.random() * 9000)}`,
      tenantId: tenant?.id || "ten-custom",
      tenantName: tenant?.name || "Penyewa",
      propertyId: tenant?.propertyId || properties[0]?.id || "",
      propertyName: tenant?.propertyName || properties[0]?.name || "Properti",
      roomNumber: tenant?.roomNumber || "-",
      amount: Number(payAmount),
      dueDate: payDueDate,
      paidDate: payStatus === "paid" ? payDate : undefined,
      paymentDate: payStatus === "paid" ? payDate : undefined,
      status: payStatus,
      paymentMethod: payStatus === "paid" ? (payMethod as any) : undefined,
      category: payCategory,
      billingPeriod: payPeriod,
      notes: payNotes.trim() ? payNotes.trim() : undefined,
      proofUrl: payProofUrl,
    };

    onRecordPayment(newPayment);
    setIsRecordModalOpen(false);
    setPayNotes("");
    setPayPeriod("Bulanan");
    setPayProofUrl(undefined);
  };

  const handleSaveEditPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentForEdit || !onUpdatePayment) return;

    onUpdatePayment(selectedPaymentForEdit);
    setSelectedPaymentForEdit(null);
  };

  const handleQuickMarkPaid = (p: PaymentRecord) => {
    if (!onUpdatePayment) return;
    const today = new Date().toISOString().split("T")[0];
    const updated: PaymentRecord = {
      ...p,
      status: "paid",
      paidDate: today,
      paymentDate: today,
      paymentMethod: p.paymentMethod || ("Transfer BCA" as any),
      notes: p.notes ? `${p.notes} (Ditandai lunas pada ${today})` : `Lunas pada ${today}`,
    };
    onUpdatePayment(updated);
  };

  const handleConfirmDelete = () => {
    if (paymentToDelete && onDeletePayment) {
      onDeletePayment(paymentToDelete.id);
      setPaymentToDelete(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#800020]" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Penagihan Sewa & Pengeluaran
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitoring arus kas keluar & masuk, tagihan jatuh tempo, riwayat pembayaran, dan kwitansi digital.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activeSubTab === "income" && (
            <button
              onClick={() => {
                if (tenants.length > 0) {
                  setPayTenantId(tenants[0].id);
                  setPayAmount(tenants[0].monthlyPrice);
                }
                setPayPeriod("Bulanan");
                setPayNotes("");
                setPayProofUrl(undefined);
                setIsRecordModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#800020] to-[#991b1b] hover:from-[#6b001b] hover:to-[#881337] text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-amber-300" />
              Catat Pembayaran Baru
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tabs Switcher */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 w-fit">
        <button
          type="button"
          onClick={() => setActiveSubTab("income")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === "income"
              ? "bg-[#800020] text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Pemasukan Sewa ({payments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("expenses")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === "expenses"
              ? "bg-[#800020] text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>Pengeluaran Operasional ({expenses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("cashflow")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === "cashflow"
              ? "bg-[#800020] text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Arus Kas & Laba Rugi (P&L)</span>
        </button>
      </div>

      {/* SUBTAB 1: PEMASUKAN SEWA & TAGIHAN */}
      {activeSubTab === "income" && (
        <div className="space-y-6">
      {/* 3 Main Billing KPI Cards (Paid, Pending, Overdue) - Dihitung Akurat & Dinamis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Paid */}
        <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs relative overflow-hidden transition hover:shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Paid (Lunas)
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
            {formatRupiah(totalPaid)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{paidCount} transaksi lunas</span>
            <strong className="text-emerald-700 font-bold">{paidPct}</strong>
          </div>
        </div>

        {/* Pending */}
        <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-xs relative overflow-hidden transition hover:shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Pending (Menunggu)
            </span>
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
            {formatRupiah(totalPending)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{pendingCount} tagihan pending</span>
            <strong className="text-amber-700 font-bold">{pendingPct}</strong>
          </div>
        </div>

        {/* Overdue */}
        <div className="p-5 rounded-2xl bg-white border border-rose-200 shadow-xs relative overflow-hidden transition hover:shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Overdue (Jatuh Tempo)
            </span>
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
            {formatRupiah(totalOverdue)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{overdueCount} tagihan overdue</span>
            <strong className="text-rose-700 font-bold">{overduePct}</strong>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        {/* Row 1: Search & Status Filter */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 min-w-[260px] max-w-lg">
            <input
              type="text"
              placeholder="Cari invoice / penyewa / nomor kamar / catatan / metode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#800020] text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Quick Pills */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === "all"
                  ? "bg-[#800020] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Semua ({relevantPayments.length})
            </button>
            <button
              onClick={() => setStatusFilter("paid")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "paid"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Paid ({paidCount})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "pending"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter("overdue")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "overdue"
                  ? "bg-rose-700 text-white shadow-xs"
                  : "bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Overdue ({overdueCount})
            </button>
          </div>
        </div>

        {/* Row 2: Dropdown Filters (Properti, Bulan/Periode, Metode Bayar, Kategori, Urutkan) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Properti Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-[#800020]" />
              Properti:
            </label>
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold cursor-pointer focus:ring-2 focus:ring-[#800020] focus:outline-none"
            >
              <option value="all">Semua Properti</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bulan / Periode Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#800020]" />
              Bulan / Periode:
            </label>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold cursor-pointer focus:ring-2 focus:ring-[#800020] focus:outline-none"
            >
              <option value="all">Semua Bulan</option>
              {availableMonths.map((m) => {
                const [y, mm] = m.split("-");
                const monthName = new Date(Number(y), Number(mm) - 1, 1).toLocaleString("id-ID", {
                  month: "long",
                  year: "numeric",
                });
                return (
                  <option key={m} value={m}>
                    {monthName}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Metode Pembayaran */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-[#800020]" />
              Metode Bayar:
            </label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold cursor-pointer focus:ring-2 focus:ring-[#800020] focus:outline-none"
            >
              <option value="all">Semua Metode</option>
              {availableMethods.map((met) => (
                <option key={met} value={met}>
                  {met}
                </option>
              ))}
            </select>
          </div>

          {/* Kategori Sewa Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-[#800020]" />
              Kategori Tagihan:
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold cursor-pointer focus:ring-2 focus:ring-[#800020] focus:outline-none"
            >
              <option value="all">Semua Kategori</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Urutkan / Sort By */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-[#800020]" />
              Urutkan Data:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold cursor-pointer focus:ring-2 focus:ring-[#800020] focus:outline-none"
            >
              <option value="due_asc">Jatuh Tempo: Terdekat</option>
              <option value="due_desc">Jatuh Tempo: Terlama</option>
              <option value="amount_desc">Nominal: Terbesar</option>
              <option value="amount_asc">Nominal: Terkecil</option>
              <option value="paid_desc">Waktu Bayar: Terbaru</option>
              <option value="tenant_asc">Nama Penyewa: A - Z</option>
            </select>
          </div>
        </div>

        {/* Row 3: Custom Date Range Toggle & Reset Filter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                isAdvancedFilterOpen || startDate || endDate
                  ? "bg-rose-50 text-[#800020] border border-rose-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5" />
              <span>Filter Rentang Tanggal</span>
              {(startDate || endDate) && (
                <span className="w-2 h-2 rounded-full bg-[#800020]" />
              )}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 font-bold flex items-center gap-1 transition cursor-pointer"
                title="Kembalikan semua filter ke awal"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filter</span>
              </button>
            )}
          </div>

          {/* Quick Summary of Filtered Result */}
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
            <span>
              Menampilkan <strong className="text-slate-900 font-bold">{filteredPayments.length}</strong> dari {relevantPayments.length} transaksi
            </span>
            <span className="text-slate-300">•</span>
            <span>
              Total Nilai: <strong className="text-[#800020] font-black text-xs">{formatRupiah(filteredTotalAmount)}</strong>
            </span>
          </div>
        </div>

        {/* Optional Collapsible Custom Date Range Picker */}
        {isAdvancedFilterOpen && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-3 text-xs animate-in fade-in duration-100">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">Dari Tanggal:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#800020]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">Sampai Tanggal:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#800020]"
              />
            </div>
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-[11px] text-rose-600 hover:text-rose-800 font-bold underline cursor-pointer"
              >
                Hapus Tanggal
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Payment Table with Interactive Column Header Sorting */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <th
                className="pb-3 px-3 cursor-pointer select-none hover:text-slate-800 transition"
                onClick={() => setSortBy(sortBy === "tenant_asc" ? "due_asc" : "tenant_asc")}
                title="Klik untuk mengurutkan nama penyewa"
              >
                <div className="flex items-center gap-1">
                  <span>Invoice & Tenant</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="pb-3 px-3">Kost / Kamar</th>
              <th
                className="pb-3 px-3 cursor-pointer select-none hover:text-slate-800 transition"
                onClick={() => setSortBy(sortBy === "due_asc" ? "due_desc" : "due_asc")}
                title="Klik untuk mengurutkan tanggal jatuh tempo"
              >
                <div className="flex items-center gap-1">
                  <span>Jatuh Tempo</span>
                  {sortBy === "due_asc" ? (
                    <ArrowUp className="w-3 h-3 text-[#800020]" />
                  ) : sortBy === "due_desc" ? (
                    <ArrowDown className="w-3 h-3 text-[#800020]" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  )}
                </div>
              </th>
              <th
                className="pb-3 px-3 cursor-pointer select-none hover:text-slate-800 transition"
                onClick={() => setSortBy(sortBy === "amount_desc" ? "amount_asc" : "amount_desc")}
                title="Klik untuk mengurutkan nominal transaksi"
              >
                <div className="flex items-center gap-1">
                  <span>Nominal (Amount)</span>
                  {sortBy === "amount_desc" ? (
                    <ArrowDown className="w-3 h-3 text-[#800020]" />
                  ) : sortBy === "amount_asc" ? (
                    <ArrowUp className="w-3 h-3 text-[#800020]" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  )}
                </div>
              </th>
              <th
                className="pb-3 px-3 cursor-pointer select-none hover:text-slate-800 transition"
                onClick={() => {
                  const nextStatus = statusFilter === "all" ? "paid" : statusFilter === "paid" ? "pending" : statusFilter === "pending" ? "overdue" : "all";
                  setStatusFilter(nextStatus);
                }}
                title="Klik untuk memfilter status secara cepat"
              >
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <Filter className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="pb-3 px-3 cursor-pointer select-none hover:text-slate-800 transition"
                onClick={() => setSortBy(sortBy === "paid_desc" ? "due_asc" : "paid_desc")}
                title="Klik untuk mengurutkan waktu bayar"
              >
                <div className="flex items-center gap-1">
                  <span>Metode & Waktu Bayar</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="pb-3 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  Tidak ada data transaksi pembayaran dengan filter ini.
                </td>
              </tr>
            ) : (
              filteredPayments.map((p) => {
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    {/* Invoice & Tenant */}
                    <td className="py-3.5 px-3">
                      <div className="font-mono text-[11px] font-bold text-[#800020]">
                        {p.invoiceNumber}
                      </div>
                      <div className="font-extrabold text-slate-900 text-sm mt-0.5">{p.tenantName}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {p.category && (
                          <span className="text-[10px] text-slate-400 font-medium">{p.category}</span>
                        )}
                        {p.proofUrl && (
                          <button
                            type="button"
                            onClick={() => setViewingProofPayment(p)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded cursor-pointer transition"
                            title="Klik untuk melihat bukti transfer / struk"
                          >
                            <Camera className="w-3 h-3 text-emerald-600" /> Bukti Bayar
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Kost / Room */}
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-[#800020] font-mono font-bold border border-rose-200">
                        {p.roomNumber}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-1">{p.propertyName}</div>
                    </td>

                    {/* Due date */}
                    <td className="py-3.5 px-3">
                      <div className="text-slate-800 font-medium">{p.dueDate}</div>
                      <div className="text-[10px] text-slate-400">{p.periodMonth || "Periode Aktif"}</div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-3 font-black text-slate-900 text-sm">
                      {formatRupiah(p.amount)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      {p.status === "paid" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Paid 🟢
                        </span>
                      ) : p.status === "pending" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          Pending 🟡
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                          Overdue 🔴
                        </span>
                      )}
                    </td>

                    {/* Payment method & date */}
                    <td className="py-3.5 px-3">
                      {p.status === "paid" ? (
                        <div>
                          <div className="font-semibold text-slate-800">{p.paymentMethod || "Transfer BCA"}</div>
                          <div className="text-[10px] text-slate-400">
                            Dibayar: {p.paymentDate || p.paidDate || "-"}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 italic">Belum dibayar</span>
                          {onUpdatePayment && (
                            <button
                              onClick={() => handleQuickMarkPaid(p)}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                              title="Tandai Sudah Lunas"
                            >
                              + Lunas
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Payment Button */}
                        <button
                          onClick={() => setSelectedPaymentForEdit(p)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1 cursor-pointer border border-slate-200"
                          title="Edit Data Pembayaran"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#800020]" />
                        </button>

                        {/* Direct Delete Button */}
                        {onDeletePayment && (
                          <button
                            onClick={() => setPaymentToDelete(p)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition flex items-center gap-1 cursor-pointer border border-rose-200"
                            title="Hapus Transaksi Pembayaran"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {p.status === "paid" ? (
                          <button
                            onClick={() => onOpenReceipt(p)}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-[#800020] text-white font-bold text-xs transition flex items-center gap-1 shadow-xs cursor-pointer"
                            title="Buka Kwitansi Digital"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-300" /> Kwitansi
                          </button>
                        ) : (
                          <a
                            href={`https://wa.me/6281234567890?text=Halo%20${encodeURIComponent(
                              p.tenantName
                            )},%20kami%20mengingatkan%20tagihan%20sewa%20kamar%20${p.roomNumber}%20(${p.propertyName})%20sebesar%20${formatRupiah(
                              p.amount
                            )}%20jatuh%20tempo%20pada%20${p.dueDate}.%20Pembayaran%20dapat%20ditransfer%20ke%20BCA%208830-9988-11%20a.n%20GDE%20ASBAWA%20PUTRA.%20Terima%20kasih.`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-[#800020] hover:bg-[#66001a] text-white font-bold text-xs transition flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5 text-amber-300" /> WhatsApp
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      </div>
      )}

      {/* SUBTAB 2: PENGELUARAN OPERASIONAL */}
      {activeSubTab === "expenses" && (
        <ExpenseSection
          expenses={expenses}
          properties={properties}
          rooms={rooms}
          selectedPropertyId={propertyFilter}
          onAddExpense={onAddExpense || (() => {})}
          onUpdateExpense={onUpdateExpense}
          onDeleteExpense={onDeleteExpense}
          totalIncomePaid={totalPaid}
        />
      )}

      {/* SUBTAB 3: ARUS KAS & LABA RUGI */}
      {activeSubTab === "cashflow" && (
        <CashFlowSection
          payments={payments}
          expenses={expenses}
          properties={properties}
          selectedPropertyId={propertyFilter}
        />
      )}

      {/* MODAL: EDIT DATA PEMBAYARAN */}
      {selectedPaymentForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#800020]" />
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Edit Data Pembayaran</h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {selectedPaymentForEdit.invoiceNumber} • {selectedPaymentForEdit.tenantName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPaymentForEdit(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPayment} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor Invoice *</label>
                  <input
                    type="text"
                    required
                    value={selectedPaymentForEdit.invoiceNumber}
                    onChange={(e) =>
                      setSelectedPaymentForEdit({
                        ...selectedPaymentForEdit,
                        invoiceNumber: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#800020] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Pembayaran *</label>
                  <select
                    value={selectedPaymentForEdit.status}
                    onChange={(e) =>
                      setSelectedPaymentForEdit({
                        ...selectedPaymentForEdit,
                        status: e.target.value as PaymentStatus,
                        paymentDate:
                          e.target.value === "paid" && !selectedPaymentForEdit.paymentDate
                            ? new Date().toISOString().split("T")[0]
                            : selectedPaymentForEdit.paymentDate,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#800020] focus:outline-none cursor-pointer"
                  >
                    <option value="paid">🟢 Paid (Lunas)</option>
                    <option value="pending">🟡 Pending (Menunggu)</option>
                    <option value="overdue">🔴 Overdue (Jatuh Tempo)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Penyewa & Properti *</label>
                <select
                  value={selectedPaymentForEdit.tenantId}
                  onChange={(e) => {
                    const t = tenants.find((item) => item.id === e.target.value);
                    if (t) {
                      setSelectedPaymentForEdit({
                        ...selectedPaymentForEdit,
                        tenantId: t.id,
                        tenantName: t.name,
                        propertyId: t.propertyId,
                        propertyName: t.propertyName,
                        roomNumber: t.roomNumber,
                      });
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none cursor-pointer"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} - Kamar {t.roomNumber} ({t.propertyName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nominal Tagihan (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={selectedPaymentForEdit.amount}
                    onChange={(e) =>
                      setSelectedPaymentForEdit({
                        ...selectedPaymentForEdit,
                        amount: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#800020] focus:ring-2 focus:ring-[#800020] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Periode Tagihan *</label>
                  <select
                    value={selectedPaymentForEdit.billingPeriod || "Bulanan"}
                    onChange={(e) =>
                      setSelectedPaymentForEdit({
                        ...selectedPaymentForEdit,
                        billingPeriod: e.target.value as any,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none cursor-pointer font-medium"
                  >
                    <option value="Bulanan">Bulanan</option>
                    <option value="6 Bulanan">6 Bulanan</option>
                    <option value="Tahunan">Tahunan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Jatuh Tempo *</label>
                  <input
                    type="date"
                    required
                    value={selectedPaymentForEdit.dueDate}
                    onChange={(e) =>
                      setSelectedPaymentForEdit({
                        ...selectedPaymentForEdit,
                        dueDate: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tanggal Bayar {selectedPaymentForEdit.status === "paid" ? "(Lunas)" : "(Opsional)"}
                  </label>
                  <input
                    type="date"
                    value={selectedPaymentForEdit.paymentDate || selectedPaymentForEdit.paidDate || ""}
                    onChange={(e) =>
                      setSelectedPaymentForEdit({
                        ...selectedPaymentForEdit,
                        paymentDate: e.target.value,
                        paidDate: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Metode Pembayaran</label>
                  <select
                    value={selectedPaymentForEdit.paymentMethod || "Transfer BCA"}
                    onChange={(e) =>
                      setSelectedPaymentForEdit({
                        ...selectedPaymentForEdit,
                        paymentMethod: e.target.value as any,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none cursor-pointer"
                  >
                    <option value="Transfer BCA">Transfer BCA (8830-9988-11)</option>
                    <option value="Transfer Mandiri">Transfer Mandiri (137-00-9988-11)</option>
                    <option value="Transfer Bank (BRI)">Transfer BRI</option>
                    <option value="Transfer Bank (BNI)">Transfer BNI</option>
                    <option value="QRIS Gopay/OVO">QRIS / GoPay / OVO</option>
                    <option value="Tunai">Tunai / Cash (Diterima Pengelola)</option>
                    <option value="Virtual Account">Virtual Account</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori Tagihan</label>
                  <select
                    value={selectedPaymentForEdit.category || "Sewa Kamar"}
                    onChange={(e) =>
                      setSelectedPaymentForEdit({
                        ...selectedPaymentForEdit,
                        category: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none cursor-pointer"
                  >
                    <option value="Sewa Kamar">Sewa Kamar / Unit</option>
                    <option value="Uang Deposit">Uang Deposit / Jaminan</option>
                    <option value="Listrik & Token">Biaya Listrik / Token</option>
                    <option value="Kebersihan & Air">Kebersihan & Air</option>
                    <option value="Denda Keterlambatan">Denda Keterlambatan</option>
                    <option value="Lainnya">Biaya Lainnya</option>
                  </select>
                </div>
              </div>

              {/* UPLOAD / AMBIL FOTO BUKTI PEMBAYARAN */}
              <div className="pt-1">
                <ProofUploader
                  value={selectedPaymentForEdit.proofUrl}
                  onChange={(url) =>
                    setSelectedPaymentForEdit({
                      ...selectedPaymentForEdit,
                      proofUrl: url,
                    })
                  }
                  label="Lampiran Bukti Pembayaran / Struk Transfer"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Keterangan transaksi..."
                  value={selectedPaymentForEdit.notes || ""}
                  onChange={(e) =>
                    setSelectedPaymentForEdit({
                      ...selectedPaymentForEdit,
                      notes: e.target.value,
                    })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {onDeletePayment ? (
                  <button
                    type="button"
                    onClick={() => {
                      const toDelete = selectedPaymentForEdit;
                      setSelectedPaymentForEdit(null);
                      setPaymentToDelete(toDelete);
                    }}
                    className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus Transaksi
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentForEdit(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white font-bold shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CATAT PEMBAYARAN BARU */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#800020]" />
                <h3 className="font-extrabold text-base text-slate-900">Catat Pembayaran Masuk</h3>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewPayment} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Penyewa (Tenant) *</label>
                <select
                  value={payTenantId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setPayTenantId(selectedId);
                    const t = tenants.find((item) => item.id === selectedId);
                    if (t && t.monthlyPrice) {
                      const multiplier = payPeriod === "Tahunan" ? 12 : payPeriod === "6 Bulanan" ? 6 : 1;
                      setPayAmount(t.monthlyPrice * multiplier);
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none cursor-pointer"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} - Kamar {t.roomNumber} ({t.propertyName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nominal Pembayaran (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none font-bold text-[#800020]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Tagihan *</label>
                  <select
                    value={payStatus}
                    onChange={(e) => setPayStatus(e.target.value as PaymentStatus)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none font-bold cursor-pointer"
                  >
                    <option value="paid">🟢 Paid (Lunas)</option>
                    <option value="pending">🟡 Pending (Menunggu)</option>
                    <option value="overdue">🔴 Overdue (Jatuh Tempo)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jatuh Tempo *</label>
                  <input
                    type="date"
                    required
                    value={payDueDate}
                    onChange={(e) => setPayDueDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Bayar</label>
                  <input
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Periode Tagihan *</label>
                  <select
                    value={payPeriod}
                    onChange={(e) => {
                      const newP = e.target.value as "Bulanan" | "6 Bulanan" | "Tahunan";
                      setPayPeriod(newP);
                      const t = tenants.find((item) => item.id === payTenantId);
                      if (t && t.monthlyPrice) {
                        const multiplier = newP === "Tahunan" ? 12 : newP === "6 Bulanan" ? 6 : 1;
                        setPayAmount(t.monthlyPrice * multiplier);
                      }
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none cursor-pointer font-medium"
                  >
                    <option value="Bulanan">Bulanan</option>
                    <option value="6 Bulanan">6 Bulanan</option>
                    <option value="Tahunan">Tahunan</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori Tagihan</label>
                  <select
                    value={payCategory}
                    onChange={(e) => setPayCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none cursor-pointer"
                  >
                    <option value="Sewa Kamar">Sewa Kamar / Unit</option>
                    <option value="Uang Deposit">Uang Deposit / Jaminan</option>
                    <option value="Listrik & Token">Biaya Listrik / Token</option>
                    <option value="Kebersihan & Air">Kebersihan & Air</option>
                    <option value="Denda Keterlambatan">Denda Keterlambatan</option>
                    <option value="Lainnya">Biaya Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Metode Pembayaran</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none cursor-pointer"
                >
                  <option value="Transfer BCA">Transfer BCA (8830-9988-11)</option>
                  <option value="Transfer Mandiri">Transfer Mandiri (137-00-9988-11)</option>
                  <option value="Transfer Bank (BRI)">Transfer BRI</option>
                  <option value="Transfer Bank (BNI)">Transfer BNI</option>
                  <option value="QRIS / GoPay / OVO">QRIS / E-Wallet</option>
                  <option value="Tunai / Cash">Tunai / Cash (Diterima Pengelola)</option>
                </select>
              </div>

              {/* UPLOAD / AMBIL FOTO BUKTI PEMBAYARAN */}
              <div className="pt-1">
                <ProofUploader
                  value={payProofUrl}
                  onChange={setPayProofUrl}
                  label="Upload / Ambil Foto Bukti Pembayaran (Kamera HP / File)"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Keterangan transaksi..."
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white font-bold shadow-sm cursor-pointer"
                >
                  Simpan Pembayaran & Terbitkan Kwitansi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL FOR DELETION (NO WINDOW.CONFIRM) */}
      {paymentToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-center font-extrabold text-lg text-slate-900">
              Hapus Data Pembayaran?
            </h3>
            <p className="text-center text-xs text-slate-500 mt-1">
              Tindakan ini akan menghapus riwayat invoice dan transaksi ini dari sistem pembukuan kost.
            </p>

            <div className="my-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Invoice:</span>
                <strong className="font-mono text-slate-900 font-bold">
                  {paymentToDelete.invoiceNumber}
                </strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Penyewa:</span>
                <strong className="text-slate-900 font-bold">
                  {paymentToDelete.tenantName} (Kamar {paymentToDelete.roomNumber})
                </strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Nominal:</span>
                <strong className="text-[#800020] font-black text-sm">
                  {formatRupiah(paymentToDelete.amount)}
                </strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold capitalize text-slate-700">
                  {paymentToDelete.status === "paid"
                    ? "🟢 Paid (Lunas)"
                    : paymentToDelete.status === "pending"
                    ? "🟡 Pending"
                    : "🔴 Overdue"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPaymentToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer transition flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL VIEW PROOF PHOTO MODAL */}
      {viewingProofPayment && viewingProofPayment.proofUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col max-h-[92vh]">
            <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-xs font-bold block">Bukti Pembayaran / Struk Transfer</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {viewingProofPayment.invoiceNumber} • {viewingProofPayment.tenantName} • {formatRupiah(viewingProofPayment.amount)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingProofPayment(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center overflow-auto bg-slate-950/60 max-h-[75vh]">
              <img
                src={viewingProofPayment.proofUrl}
                alt="Bukti Transfer"
                className="max-h-full max-w-full object-contain rounded-lg shadow-md"
              />
            </div>
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Metode: {viewingProofPayment.paymentMethod || "Transfer Bank"}</span>
              <button
                type="button"
                onClick={() => setViewingProofPayment(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
