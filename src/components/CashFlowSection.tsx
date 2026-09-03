import React, { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  Calendar,
  Zap,
  ShieldCheck,
  Briefcase,
  Printer,
  Download,
  AlertCircle,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Layers,
} from "lucide-react";
import { PaymentRecord, ExpenseRecord, Property } from "../types";
import { formatRupiah, EXPENSE_CATEGORIES } from "../data/mockData";

interface CashFlowSectionProps {
  payments: PaymentRecord[];
  expenses: ExpenseRecord[];
  properties: Property[];
  selectedPropertyId: string;
}

export const CashFlowSection: React.FC<CashFlowSectionProps> = ({
  payments,
  expenses,
  properties,
  selectedPropertyId,
}) => {
  // Filter by property
  const relevantPayments = useMemo(() => {
    return payments.filter(
      (p) => selectedPropertyId === "all" || p.propertyId === selectedPropertyId
    );
  }, [payments, selectedPropertyId]);

  const relevantExpenses = useMemo(() => {
    return expenses.filter(
      (e) => selectedPropertyId === "all" || e.propertyId === selectedPropertyId
    );
  }, [expenses, selectedPropertyId]);

  // Calculations
  const totalRevenue = useMemo(() => {
    return relevantPayments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0);
  }, [relevantPayments]);

  const totalExpenseAmount = useMemo(() => {
    return relevantExpenses
      .filter((e) => e.status === "paid")
      .reduce((sum, e) => sum + e.amount, 0);
  }, [relevantExpenses]);

  const netIncome = totalRevenue - totalExpenseAmount;
  const profitMargin = totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : "0";
  const oer = totalRevenue > 0 ? ((totalExpenseAmount / totalRevenue) * 100).toFixed(1) : "0";

  // Breakdown per property
  const propertyPnl = useMemo(() => {
    return properties.map((prop) => {
      const propPayments = payments.filter((p) => p.propertyId === prop.id && p.status === "paid");
      const propExpenses = expenses.filter((e) => e.propertyId === prop.id && e.status === "paid");

      const rev = propPayments.reduce((sum, p) => sum + p.amount, 0);
      const exp = propExpenses.reduce((sum, e) => sum + e.amount, 0);

      // Category breakdown for this property
      const electricity = propExpenses.filter((e) => e.category === "electricity").reduce((sum, e) => sum + e.amount, 0);
      const securityCleaning = propExpenses.filter((e) => e.category === "security_cleaning").reduce((sum, e) => sum + e.amount, 0);
      const management = propExpenses.filter((e) => e.category === "management").reduce((sum, e) => sum + e.amount, 0);
      const other = exp - (electricity + securityCleaning + management);

      const net = rev - exp;
      const margin = rev > 0 ? ((net / rev) * 100).toFixed(1) : "0";

      return {
        property: prop,
        revenue: rev,
        expense: exp,
        electricity,
        securityCleaning,
        management,
        other,
        net,
        margin,
      };
    });
  }, [properties, payments, expenses]);

  return (
    <div className="space-y-6">
      {/* 4 Financial Health KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pemasukan Sewa */}
        <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs relative overflow-hidden transition hover:shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Pemasukan Sewa (Paid)
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
            {formatRupiah(totalRevenue)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{relevantPayments.filter((p) => p.status === "paid").length} transaksi sewa</span>
            <span className="text-emerald-700 font-bold">100% Inflow</span>
          </div>
        </div>

        {/* Total Pengeluaran Operasional */}
        <div className="p-5 rounded-2xl bg-white border border-rose-200 shadow-xs relative overflow-hidden transition hover:shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Pengeluaran Operasional
            </span>
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700 tracking-tight">
            {formatRupiah(totalExpenseAmount)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Rasio Beban (OER):</span>
            <strong className="text-rose-700 font-bold">{oer}%</strong>
          </div>
        </div>

        {/* Laba Operasional Bersih (Net Income) */}
        <div className={`p-5 rounded-2xl bg-white border shadow-xs relative overflow-hidden transition hover:shadow-sm ${
          netIncome >= 0 ? "border-indigo-200" : "border-rose-300"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              netIncome >= 0 ? "text-indigo-900" : "text-rose-900"
            }`}>
              <span className={`w-2 h-2 rounded-full ${netIncome >= 0 ? "bg-indigo-500" : "bg-rose-500"}`} />
              Laba Bersih (Net Profit)
            </span>
            <div className={`p-1.5 rounded-lg ${netIncome >= 0 ? "bg-indigo-100 text-indigo-700" : "bg-rose-100 text-rose-700"}`}>
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black tracking-tight ${
            netIncome >= 0 ? "text-indigo-700" : "text-rose-700"
          }`}>
            {formatRupiah(netIncome)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Pemasukan - Beban</span>
            <strong className={`font-bold ${netIncome >= 0 ? "text-indigo-700" : "text-rose-600"}`}>
              {netIncome >= 0 ? "Profit Surplus" : "Defisit"}
            </strong>
          </div>
        </div>

        {/* Profit Margin */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden transition hover:shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Margin Keuntungan
            </span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <PieChart className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {profitMargin}%
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Kesehatan Finansial:</span>
            <strong className="text-emerald-700 font-bold">
              {Number(profitMargin) > 50 ? "Sangat Sehat 🌟" : Number(profitMargin) > 20 ? "Sehat ✅" : "Perlu Evaluasi ⚠️"}
            </strong>
          </div>
        </div>
      </div>

      {/* Property Profit & Loss Table */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#800020]" />
              Laporan Laba Rugi per Properti (P&L Summary)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Perbandingan pendapatan sewa dengan realisasi biaya listrik, kebersihan, keamanan, dan pengelolaan
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Laporan
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Nama Properti</th>
                <th className="pb-3 px-3 text-emerald-700">Pemasukan Sewa</th>
                <th className="pb-3 px-3 text-amber-700">Beban Listrik</th>
                <th className="pb-3 px-3 text-emerald-800">Kebersihan & Keamanan</th>
                <th className="pb-3 px-3 text-indigo-700">Pengelolaan / Gaji</th>
                <th className="pb-3 px-3 text-slate-600">Beban Lainnya</th>
                <th className="pb-3 px-3 text-rose-700">Total Beban</th>
                <th className="pb-3 px-3 text-right">Laba Bersih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {propertyPnl.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Belum ada data properti yang tercatat.
                  </td>
                </tr>
              ) : (
                propertyPnl.map((row) => (
                  <tr key={row.property.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-bold text-slate-900">
                      <div>{row.property.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{row.property.address}</div>
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-700">
                      {formatRupiah(row.revenue)}
                    </td>
                    <td className="py-3 px-3 text-amber-800 font-medium">
                      {formatRupiah(row.electricity)}
                    </td>
                    <td className="py-3 px-3 text-emerald-900 font-medium">
                      {formatRupiah(row.securityCleaning)}
                    </td>
                    <td className="py-3 px-3 text-indigo-800 font-medium">
                      {formatRupiah(row.management)}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {formatRupiah(row.other)}
                    </td>
                    <td className="py-3 px-3 font-bold text-rose-700">
                      {formatRupiah(row.expense)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className={`font-black text-sm ${row.net >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        {formatRupiah(row.net)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Margin {row.margin}%
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {propertyPnl.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-300 font-black bg-slate-50 text-slate-900">
                  <td className="py-3 px-3">TOTAL KONSOLIDASI</td>
                  <td className="py-3 px-3 text-emerald-700">{formatRupiah(totalRevenue)}</td>
                  <td className="py-3 px-3 text-amber-800">
                    {formatRupiah(propertyPnl.reduce((sum, r) => sum + r.electricity, 0))}
                  </td>
                  <td className="py-3 px-3 text-emerald-900">
                    {formatRupiah(propertyPnl.reduce((sum, r) => sum + r.securityCleaning, 0))}
                  </td>
                  <td className="py-3 px-3 text-indigo-800">
                    {formatRupiah(propertyPnl.reduce((sum, r) => sum + r.management, 0))}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {formatRupiah(propertyPnl.reduce((sum, r) => sum + r.other, 0))}
                  </td>
                  <td className="py-3 px-3 text-rose-700">{formatRupiah(totalExpenseAmount)}</td>
                  <td className={`py-3 px-3 text-right text-sm ${netIncome >= 0 ? "text-indigo-700" : "text-rose-700"}`}>
                    {formatRupiah(netIncome)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
