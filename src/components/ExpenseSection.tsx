import React, { useState, useMemo } from "react";
import {
  Zap,
  Droplets,
  ShieldCheck,
  Briefcase,
  Wrench,
  Wifi,
  Package,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  Eye,
  Camera,
  Printer,
  Download,
  Filter,
  DollarSign,
  TrendingDown,
  ArrowDownRight,
  TrendingUp,
  AlertCircle,
  Receipt,
  Layers,
} from "lucide-react";
import { ExpenseRecord, ExpenseCategory, Property, Room } from "../types";
import { EXPENSE_CATEGORIES, formatRupiah } from "../data/mockData";
import { ExpenseModal } from "./ExpenseModal";
import { ExpenseProofModal } from "./ExpenseProofModal";

interface ExpenseSectionProps {
  expenses: ExpenseRecord[];
  properties: Property[];
  rooms?: Room[];
  selectedPropertyId: string;
  onAddExpense: (expense: ExpenseRecord) => void;
  onUpdateExpense?: (expense: ExpenseRecord) => void;
  onDeleteExpense?: (expenseId: string) => void;
  totalIncomePaid?: number;
}

export const ExpenseSection: React.FC<ExpenseSectionProps> = ({
  expenses,
  properties,
  rooms = [],
  selectedPropertyId,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  totalIncomePaid = 0,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [propertyFilter, setPropertyFilter] = useState<string>(selectedPropertyId);
  const [monthFilter, setMonthFilter] = useState<string>("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<ExpenseRecord | null>(null);
  const [viewingProofExpense, setViewingProofExpense] = useState<ExpenseRecord | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseRecord | null>(null);

  // Synchronize when selectedPropertyId prop updates
  React.useEffect(() => {
    setPropertyFilter(selectedPropertyId);
  }, [selectedPropertyId]);

  // Filtered by property
  const propertyExpenses = useMemo(() => {
    return expenses.filter((e) => {
      return propertyFilter === "all" || e.propertyId === propertyFilter;
    });
  }, [expenses, propertyFilter]);

  // Fully filtered expenses
  const filteredExpenses = useMemo(() => {
    return propertyExpenses.filter((e) => {
      const matchQuery =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.recipient && e.recipient.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.invoiceNumber && e.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        e.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.roomNumber && e.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = categoryFilter === "all" || e.category === categoryFilter;
      const matchStatus = statusFilter === "all" || e.status === statusFilter;
      const matchMonth = monthFilter === "all" || e.date.startsWith(monthFilter);

      return matchQuery && matchCategory && matchStatus && matchMonth;
    });
  }, [propertyExpenses, searchQuery, categoryFilter, statusFilter, monthFilter]);

  // Financial calculations
  const totalExpenses = useMemo(() => {
    return propertyExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [propertyExpenses]);

  const totalPaidExpenses = useMemo(() => {
    return propertyExpenses.filter((e) => e.status === "paid").reduce((sum, e) => sum + e.amount, 0);
  }, [propertyExpenses]);

  const totalPendingExpenses = useMemo(() => {
    return propertyExpenses.filter((e) => e.status === "pending").reduce((sum, e) => sum + e.amount, 0);
  }, [propertyExpenses]);

  // Expenses grouped by category
  const categoryTotals = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    EXPENSE_CATEGORIES.forEach((c) => {
      map[c.key] = { count: 0, total: 0 };
    });

    propertyExpenses.forEach((e) => {
      if (!map[e.category]) {
        map[e.category] = { count: 0, total: 0 };
      }
      map[e.category].count += 1;
      map[e.category].total += e.amount;
    });

    return map;
  }, [propertyExpenses]);

  // Identify highest expense category
  const topExpenseCategory = useMemo(() => {
    let topKey = "";
    let topAmount = -1;
    (Object.entries(categoryTotals) as [string, { count: number; total: number }][]).forEach(([key, val]) => {
      if (val.total > topAmount && val.total > 0) {
        topAmount = val.total;
        topKey = key;
      }
    });
    const found = EXPENSE_CATEGORIES.find((c) => c.key === topKey);
    return found ? { ...found, total: topAmount } : null;
  }, [categoryTotals]);

  // Net Cash Flow (Pemasukan Lunas - Pengeluaran Lunas)
  const netCashFlow = totalIncomePaid - totalPaidExpenses;

  // Quick mark paid
  const handleQuickMarkPaid = (exp: ExpenseRecord) => {
    if (!onUpdateExpense) return;
    const today = new Date().toISOString().split("T")[0];
    onUpdateExpense({
      ...exp,
      status: "paid",
      paidDate: today,
    });
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (expenseToDelete && onDeleteExpense) {
      onDeleteExpense(expenseToDelete.id);
      setExpenseToDelete(null);
    }
  };

  // Export CSV summary
  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) {
      alert("Tidak ada data pengeluaran untuk diekspor.");
      return;
    }

    const headers = ["No", "Tanggal", "No. Bukti", "Kategori", "Rincian Pengeluaran", "Properti", "Unit", "Nominal (Rp)", "Penerima", "Metode Bayar", "Status", "Catatan"];
    const rows = filteredExpenses.map((e, idx) => [
      idx + 1,
      `"${e.date}"`,
      `"${e.invoiceNumber || "-"}"`,
      `"${e.categoryLabel || e.category}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.propertyName}"`,
      `"${e.roomNumber || "Fasilitas Umum"}"`,
      e.amount,
      `"${e.recipient || "-"}"`,
      `"${e.paymentMethod || "-"}"`,
      `"${e.status === "paid" ? "Lunas" : "Pending"}"`,
      `"${(e.notes || "-").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Rekap_Pengeluaran_Kost_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryIcon = (catKey: string) => {
    switch (catKey) {
      case "electricity":
        return <Zap className="w-3.5 h-3.5 text-amber-500" />;
      case "security_cleaning":
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
      case "management":
        return <Briefcase className="w-3.5 h-3.5 text-indigo-600" />;
      case "water":
        return <Droplets className="w-3.5 h-3.5 text-cyan-600" />;
      case "maintenance_repair":
        return <Wrench className="w-3.5 h-3.5 text-rose-600" />;
      case "internet_wifi":
        return <Wifi className="w-3.5 h-3.5 text-blue-600" />;
      case "supplies":
        return <Package className="w-3.5 h-3.5 text-purple-600" />;
      case "taxes_permits":
        return <FileText className="w-3.5 h-3.5 text-orange-600" />;
      default:
        return <MoreHorizontal className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getCategoryBadgeClass = (catKey: string) => {
    switch (catKey) {
      case "electricity":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "security_cleaning":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "management":
        return "bg-indigo-50 text-indigo-800 border-indigo-200";
      case "water":
        return "bg-cyan-50 text-cyan-800 border-cyan-200";
      case "maintenance_repair":
        return "bg-rose-50 text-rose-800 border-rose-200";
      case "internet_wifi":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "supplies":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "taxes_permits":
        return "bg-orange-50 text-orange-800 border-orange-200";
      default:
        return "bg-slate-50 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 Main Operational Expense KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Pengeluaran */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-rose-200 shadow-xs relative overflow-hidden transition hover:shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              Total Beban Biaya
            </span>
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-700 tracking-tight">
            {formatRupiah(totalExpenses)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{propertyExpenses.length} transaksi pengeluaran</span>
            <strong className="text-rose-700 font-bold">100%</strong>
          </div>
        </div>

        {/* Card 2: Biaya Terbesar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-amber-200 shadow-xs relative overflow-hidden transition hover:shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Beban Terbesar
            </span>
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
            {topExpenseCategory ? topExpenseCategory.label : "Belum Ada"}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Nominal:</span>
            <strong className="text-amber-700 font-bold">
              {topExpenseCategory ? formatRupiah(topExpenseCategory.total) : "Rp 0"}
            </strong>
          </div>
        </div>

        {/* Card 3: Lunas vs Pending */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden transition hover:shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Status Pembayaran
            </span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {formatRupiah(totalPaidExpenses)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="text-emerald-700 font-bold">
              Lunas: {propertyExpenses.filter((e) => e.status === "paid").length}
            </span>
            <span className="text-amber-600 font-bold">
              Pending: {formatRupiah(totalPendingExpenses)}
            </span>
          </div>
        </div>

        {/* Card 4: Arus Kas Bersih (Net Profit) */}
        <div className={`p-4 sm:p-5 rounded-2xl bg-white border shadow-xs relative overflow-hidden transition hover:shadow-sm ${
          netCashFlow >= 0 ? "border-emerald-200" : "border-rose-200"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              netCashFlow >= 0 ? "text-emerald-900" : "text-rose-900"
            }`}>
              <span className={`w-2 h-2 rounded-full ${netCashFlow >= 0 ? "bg-emerald-500" : "bg-rose-500"}`} />
              Arus Kas Bersih (Net)
            </span>
            <div className={`p-1.5 rounded-lg ${netCashFlow >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
              {netCashFlow >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-black tracking-tight ${
            netCashFlow >= 0 ? "text-emerald-700" : "text-rose-700"
          }`}>
            {formatRupiah(netCashFlow)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Pemasukan - Pengeluaran</span>
            <strong className={`font-bold ${netCashFlow >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
              {netCashFlow >= 0 ? "Surplus Kas" : "Defisit Kas"}
            </strong>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-2 flex items-center justify-between">
          <span>Filter Kategori Beban:</span>
          <span>{filteredExpenses.length} dari {propertyExpenses.length} catatan</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
              categoryFilter === "all"
                ? "bg-[#800020] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Semua ({propertyExpenses.length})
          </button>

          {EXPENSE_CATEGORIES.map((cat) => {
            const isSelected = categoryFilter === cat.key;
            const count = categoryTotals[cat.key]?.count || 0;
            const total = categoryTotals[cat.key]?.total || 0;
            return (
              <button
                key={cat.key}
                onClick={() => setCategoryFilter(cat.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-rose-900 text-white shadow-xs font-bold"
                    : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {getCategoryIcon(cat.key)}
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-700"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search, Filter Controls & Action Buttons */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Cari pengeluaran, vendor, no struk, kamar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#800020] text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  statusFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setStatusFilter("paid")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  statusFilter === "paid" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Lunas
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  statusFilter === "pending" ? "bg-white text-amber-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Pending
              </button>
            </div>

            {/* Print & CSV Buttons */}
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition"
              title="Cetak Rekap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition"
              title="Ekspor CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ekspor CSV</span>
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => {
                setExpenseToEdit(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#800020] to-[#991b1b] hover:from-[#6b001b] hover:to-[#881337] text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              Catat Pengeluaran
            </button>
          </div>
        </div>

        {/* Secondary Property Filter */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Properti:</span>
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium cursor-pointer"
            >
              <option value="all">Semua Properti</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Expense Table */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#800020]" />
            Daftar Catatan Pengeluaran Operasional
          </h3>
          <span className="text-[11px] text-slate-400">
            Total Tampil: <strong>{formatRupiah(filteredExpenses.reduce((sum, e) => sum + e.amount, 0))}</strong>
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
              <th className="pb-3 px-3">Tanggal & No. Bukti</th>
              <th className="pb-3 px-3">Kategori</th>
              <th className="pb-3 px-3">Rincian Pengeluaran</th>
              <th className="pb-3 px-3">Properti / Unit</th>
              <th className="pb-3 px-3">Penerima / Vendor</th>
              <th className="pb-3 px-3">Nominal (Rp)</th>
              <th className="pb-3 px-3">Status</th>
              <th className="pb-3 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-400">
                  <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold">Belum ada catatan pengeluaran dengan filter ini.</p>
                  <p className="text-[11px] mt-0.5">
                    Klik tombol <strong>"Catat Pengeluaran"</strong> di atas untuk mencatat biaya listrik, air, kebersihan, keamanan, gaji, dll.
                  </p>
                </td>
              </tr>
            ) : (
              filteredExpenses.map((exp) => {
                return (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                    {/* Tanggal & No. Bukti */}
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900">{exp.date}</div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                        {exp.invoiceNumber || exp.id}
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${getCategoryBadgeClass(exp.category)}`}>
                        {getCategoryIcon(exp.category)}
                        {exp.categoryLabel || exp.category}
                      </span>
                    </td>

                    {/* Rincian Pengeluaran */}
                    <td className="py-3.5 px-3">
                      <div className="font-extrabold text-slate-900 text-sm">
                        {exp.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {exp.notes && (
                          <span className="text-[10px] text-slate-500 font-normal line-clamp-1 max-w-xs">
                            {exp.notes}
                          </span>
                        )}
                        {exp.proofUrl && (
                          <button
                            type="button"
                            onClick={() => setViewingProofExpense(exp)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded cursor-pointer transition shrink-0"
                            title="Lihat foto nota / bukti struk"
                          >
                            <Camera className="w-3 h-3 text-emerald-600" /> Struk Ada
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Properti & Unit */}
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-800">{exp.propertyName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {exp.roomNumber ? (
                          <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded font-mono font-medium">
                            {exp.roomNumber}
                          </span>
                        ) : (
                          "Fasilitas Bersama"
                        )}
                      </div>
                    </td>

                    {/* Penerima & Metode Bayar */}
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-800">{exp.recipient || "-"}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {exp.paymentMethod || "Tunai"}
                      </div>
                    </td>

                    {/* Nominal */}
                    <td className="py-3.5 px-3">
                      <div className="font-black text-rose-700 text-sm">
                        {formatRupiah(exp.amount)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      {exp.status === "paid" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Lunas 🟢
                        </span>
                      ) : (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            Pending 🟡
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuickMarkPaid(exp)}
                            className="block text-[10px] text-emerald-700 font-bold hover:underline cursor-pointer"
                          >
                            Tandai Lunas
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {exp.proofUrl && (
                          <button
                            type="button"
                            onClick={() => setViewingProofExpense(exp)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                            title="Lihat Bukti Struk"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setExpenseToEdit(exp);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                          title="Edit Catatan Pengeluaran"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpenseToDelete(exp)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                          title="Hapus Pengeluaran"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Expense Composition & Breakdown Card */}
      {propertyExpenses.length > 0 && (
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Komposisi Beban Biaya Operasional
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Rincian alokasi biaya untuk efisiensi pengeluaran properti
              </p>
            </div>
            <span className="text-xs font-black text-rose-700">
              Total {formatRupiah(totalExpenses)}
            </span>
          </div>

          {/* Breakdown progress bar */}
          <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden">
            {EXPENSE_CATEGORIES.map((cat) => {
              const total = categoryTotals[cat.key]?.total || 0;
              if (total <= 0 || totalExpenses <= 0) return null;
              const pct = (total / totalExpenses) * 100;
              let bg = "bg-slate-400";
              if (cat.key === "electricity") bg = "bg-amber-500";
              if (cat.key === "security_cleaning") bg = "bg-emerald-500";
              if (cat.key === "management") bg = "bg-indigo-500";
              if (cat.key === "water") bg = "bg-cyan-500";
              if (cat.key === "maintenance_repair") bg = "bg-rose-500";
              if (cat.key === "internet_wifi") bg = "bg-blue-500";
              if (cat.key === "supplies") bg = "bg-purple-500";
              if (cat.key === "taxes_permits") bg = "bg-orange-500";

              return (
                <div
                  key={cat.key}
                  style={{ width: `${pct}%` }}
                  className={`${bg} transition-all duration-300 hover:opacity-80`}
                  title={`${cat.label}: ${formatRupiah(total)} (${pct.toFixed(1)}%)`}
                />
              );
            })}
          </div>

          {/* Breakdown Pills List */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
            {EXPENSE_CATEGORIES.map((cat) => {
              const total = categoryTotals[cat.key]?.total || 0;
              const count = categoryTotals[cat.key]?.count || 0;
              if (total <= 0) return null;
              const pct = totalExpenses > 0 ? ((total / totalExpenses) * 100).toFixed(1) : "0";

              return (
                <div
                  key={cat.key}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {getCategoryIcon(cat.key)}
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-slate-800 truncate">{cat.label}</div>
                      <div className="text-[10px] text-slate-400">{count} transaksi ({pct}%)</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-900 shrink-0 ml-1">
                    {formatRupiah(total)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setExpenseToEdit(null);
        }}
        onSaveExpense={(savedExp) => {
          if (expenseToEdit && onUpdateExpense) {
            onUpdateExpense(savedExp);
          } else {
            onAddExpense(savedExp);
          }
        }}
        properties={properties}
        rooms={rooms}
        selectedPropertyId={selectedPropertyId}
        expenseToEdit={expenseToEdit}
      />

      <ExpenseProofModal
        expense={viewingProofExpense}
        onClose={() => setViewingProofExpense(null)}
      />

      {/* Delete Confirmation Modal */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h4 className="font-bold text-slate-900 text-sm">Hapus Catatan Pengeluaran?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Yakin ingin menghapus pengeluaran <strong>"{expenseToDelete.title}"</strong> ({formatRupiah(expenseToDelete.amount)})? Data yang dihapus tidak dapat dikembalikan.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setExpenseToDelete(null)}
                className="py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
