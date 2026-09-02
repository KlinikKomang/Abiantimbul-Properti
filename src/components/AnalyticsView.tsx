import React from "react";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Building2,
  PieChart as PieChartIcon,
  Layers,
  ArrowUpRight,
  Sparkles,
  FileSpreadsheet
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Property, PaymentRecord } from "../types";
import { formatRupiah } from "../data/mockData";

interface AnalyticsViewProps {
  properties: Property[];
  payments: PaymentRecord[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ properties, payments }) => {
  const [timeRange, setTimeRange] = React.useState<"6m" | "1y">("6m");

  const revenueTrendData = [
    { month: "Mar", revenue: 205000000, expenses: 32000000, profit: 173000000, occupancy: 78 },
    { month: "Apr", revenue: 212000000, expenses: 34000000, profit: 178000000, occupancy: 80 },
    { month: "Mei", revenue: 220000000, expenses: 35000000, profit: 185000000, occupancy: 81 },
    { month: "Jun", revenue: 228000000, expenses: 36000000, profit: 192000000, occupancy: 83 },
    { month: "Jul", revenue: 218750000, expenses: 33000000, profit: 185750000, occupancy: 79 },
    { month: "Ags", revenue: 245000000, expenses: 38000000, profit: 207000000, occupancy: 81.7 },
  ];

  const propertyRevenueData = properties.map((p) => ({
    name: p.name.replace("Kost ", ""),
    revenue: p.monthlyRevenue,
    occupancy: p.occupancyRate,
  }));

  const roomTypeDistribution = [
    { name: "Standard (Rp 2.5jt)", value: 45, color: "#800020" },
    { name: "Deluxe (Rp 2.1jt)", value: 30, color: "#b91c1c" },
    { name: "VIP Suite (Rp 3.5jt)", value: 25, color: "#d97706" },
    { name: "Executive Studio (Rp 3.2jt)", value: 20, color: "#10b981" },
  ];

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Bulan,Pendapatan,Biaya Operasional,Laba Bersih,Okupansi (%)\n" +
      revenueTrendData.map((r) => `${r.month},${r.revenue},${r.expenses},${r.profit},${r.occupancy}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Laporan_Keuangan_KOSTMANAGER_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header & Export button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#800020]" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Laporan & Analitik Bisnis Kost
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Analisis tren pendapatan, laba bersih operasional, tingkat hunian (occupancy), dan perbandingan properti.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-[#800020] text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-300" />
            Ekspor Laporan (CSV / Excel)
          </button>
        </div>
      </div>

      {/* 4 Quick Analytics Summary Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Rata-rata Okupansi</span>
          <div className="text-2xl font-black text-[#800020] mt-1">81.7%</div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
            <ArrowUpRight className="w-3 h-3" /> ↑ 2.7% vs bulan lalu
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Laba Bersih Bulan Ini</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{formatRupiah(207000000)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Net Profit Margin: 84.5%</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Biaya Operasional</span>
          <div className="text-2xl font-black text-slate-800 mt-1">{formatRupiah(38000000)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Listrik, Air, Wifi, Gaji Staff</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Unit Aktif</span>
          <div className="text-2xl font-black text-slate-900 mt-1">120 Kamar</div>
          <div className="text-[11px] text-slate-500 mt-0.5">5 Cabang Properti Kost</div>
        </div>
      </div>

      {/* Chart 1: Revenue vs Net Profit Trend (Area Chart) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">
              Tren Pendapatan & Laba Bersih (6 Bulan Terakhir)
            </h3>
            <p className="text-xs text-slate-400">Pertumbuhan pendapatan sewa bulanan dan margin keuntungan bersih</p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-3 h-3 rounded-xs bg-[#800020]" /> Omset (Revenue)
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-3 h-3 rounded-xs bg-emerald-500" /> Laba Bersih (Net Profit)
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#800020" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#800020" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickFormatter={(val) => `${(val / 1000000).toFixed(0)} jt`}
              />
              <Tooltip
                formatter={(val: any) => [formatRupiah(Number(val)), ""]}
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Pendapatan"
                stroke="#800020"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRev)"
              />
              <Area
                type="monotone"
                dataKey="profit"
                name="Laba Bersih"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorProfit)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dual Charts: Revenue by Property & Room Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Revenue per Property (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <h3 className="font-extrabold text-sm text-slate-900 mb-1">
            Kontribusi Pendapatan per Cabang Kost
          </h3>
          <p className="text-xs text-slate-400 mb-4">Omset bulanan masing-masing properti</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={propertyRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(0)} jt`}
                />
                <Tooltip
                  formatter={(val: any) => [formatRupiah(Number(val)), "Omset"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Bar dataKey="revenue" name="Omset" fill="#800020" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Room Type Distribution (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 mb-1">
              Distribusi Tipe Kamar
            </h3>
            <p className="text-xs text-slate-400 mb-2">Komposisi 120 kamar di seluruh cabang</p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roomTypeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {roomTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`${val} Kamar`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            {roomTypeDistribution.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <strong className="text-slate-800">{item.value} Kamar</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
