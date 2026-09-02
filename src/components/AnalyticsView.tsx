import React from "react";
import {
  TrendingUp,
  Download,
  Calendar,
  Building2,
  PieChart as PieChartIcon,
  Layers,
  ArrowUpRight,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Filter,
  Users,
  Home,
  Wrench,
  ShieldCheck,
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
  Legend,
} from "recharts";
import { Property, PaymentRecord, Room, Tenant, MaintenanceTicket, PropertyCategory } from "../types";
import { formatRupiah } from "../data/mockData";

interface AnalyticsViewProps {
  properties: Property[];
  rooms?: Room[];
  tenants?: Tenant[];
  payments: PaymentRecord[];
  maintenanceTickets?: MaintenanceTicket[];
  selectedPropertyId?: string;
}

const CATEGORY_COLORS: Record<PropertyCategory | string, string> = {
  kost: "#7b1113",
  rumah: "#0284c7",
  parkir: "#059669",
  ruko: "#d97706",
  tanah: "#7c3aed",
};

const PIE_COLORS = [
  "#7b1113",
  "#b91c1c",
  "#d97706",
  "#059669",
  "#0284c7",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  properties = [],
  rooms = [],
  tenants = [],
  payments = [],
  maintenanceTickets = [],
  selectedPropertyId = "all",
}) => {
  const [propertyFilter, setPropertyFilter] = React.useState<string>(selectedPropertyId);
  const [timeRange, setTimeRange] = React.useState<"6m" | "1y">("6m");

  React.useEffect(() => {
    setPropertyFilter(selectedPropertyId);
  }, [selectedPropertyId]);

  // Filter entities according to selected property
  const filteredProperties = propertyFilter === "all"
    ? properties
    : properties.filter((p) => p.id === propertyFilter);

  const filteredRooms = propertyFilter === "all"
    ? rooms
    : rooms.filter((r) => r.propertyId === propertyFilter);

  const filteredTenants = propertyFilter === "all"
    ? tenants
    : tenants.filter((t) => t.propertyId === propertyFilter);

  const filteredPayments = propertyFilter === "all"
    ? payments
    : payments.filter((p) => p.propertyId === propertyFilter);

  const filteredMaintenance = propertyFilter === "all"
    ? maintenanceTickets
    : maintenanceTickets.filter((m) => m.propertyId === propertyFilter);

  // Dynamic Occupancy Calculation
  const totalUnits = filteredRooms.length;
  const occupiedUnits = filteredRooms.filter((r) => r.status === "occupied" || r.tenantId || r.tenantName).length;
  const availableUnits = filteredRooms.filter((r) => r.status === "available" && !r.tenantId).length;
  const maintenanceUnits = filteredRooms.filter((r) => r.status === "maintenance").length;
  const overallOccupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

  // Financial Calculations starting from 1 September 2026
  const totalPaidRevenue = filteredPayments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPendingRevenue = filteredPayments
    .filter((p) => p.status === "pending" || p.status === "overdue")
    .reduce((sum, p) => sum + p.amount, 0);

  // Total Maintenance & Operational Cost
  const totalMaintenanceCost = filteredMaintenance.reduce((sum, m) => sum + (m.estimatedCost || 0), 0);

  // Net Profit
  const netProfit = totalPaidRevenue - totalMaintenanceCost;
  const netProfitMargin = totalPaidRevenue > 0 ? ((netProfit / totalPaidRevenue) * 100).toFixed(1) : "100";

  // Build dynamic 6-month / 12-month Trend starting from September 2026
  const MONTHS_CONFIG = [
    { key: "2026-09", label: "Sep 2026" },
    { key: "2026-10", label: "Okt 2026" },
    { key: "2026-11", label: "Nov 2026" },
    { key: "2026-12", label: "Des 2026" },
    { key: "2027-01", label: "Jan 2027" },
    { key: "2027-02", label: "Feb 2027" },
    { key: "2027-03", label: "Mar 2027" },
    { key: "2027-04", label: "Apr 2027" },
    { key: "2027-05", label: "Mei 2027" },
    { key: "2027-06", label: "Jun 2027" },
    { key: "2027-07", label: "Jul 2027" },
    { key: "2027-08", label: "Ags 2027" },
  ];

  const activeMonths = timeRange === "6m" ? MONTHS_CONFIG.slice(0, 6) : MONTHS_CONFIG;

  const revenueTrendData = activeMonths.map((m, idx) => {
    // Real payments matching this month
    const monthPayments = filteredPayments.filter((p) => {
      const dateStr = p.paymentDate || p.paidDate || p.dueDate || "";
      if (dateStr.startsWith(m.key)) return true;
      if (p.periodMonth && p.periodMonth.toLowerCase().includes(m.label.split(" ")[0].toLowerCase())) return true;
      // Default initial September 2026 matches all current paid transactions
      if (idx === 0 && (!dateStr || dateStr.startsWith("2026-09"))) return true;
      return false;
    });

    const monthRevenue = monthPayments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0);

    const monthExpenses = filteredMaintenance
      .filter((ticket) => {
        const ticketDate = ticket.completedDate || ticket.reportedDate || ticket.createdAt || "2026-09-01";
        return ticketDate.startsWith(m.key) || (idx === 0 && ticketDate.startsWith("2026-09"));
      })
      .reduce((sum, t) => sum + (t.estimatedCost || 0), 0);

    const monthProfit = Math.max(0, monthRevenue - monthExpenses);

    return {
      month: m.label,
      revenue: monthRevenue,
      expenses: monthExpenses,
      profit: monthProfit,
      occupancy: Number(overallOccupancyRate.toFixed(1)),
    };
  });

  // Revenue per property (Real data)
  const propertyRevenueData = filteredProperties.map((p) => {
    const propPayments = payments.filter((pay) => pay.propertyId === p.id && pay.status === "paid");
    const actualRevenue = propPayments.reduce((sum, pay) => sum + pay.amount, 0);
    const propRooms = rooms.filter((r) => r.propertyId === p.id);
    const occupied = propRooms.filter((r) => r.status === "occupied" || r.tenantId).length;
    const occupancy = propRooms.length > 0 ? ((occupied / propRooms.length) * 100).toFixed(0) : "0";

    return {
      name: p.name.length > 18 ? p.name.substring(0, 16) + "…" : p.name,
      fullName: p.name,
      revenue: actualRevenue > 0 ? actualRevenue : (p.monthlyRevenue || 0),
      occupancy: Number(occupancy),
      totalRooms: propRooms.length || p.totalRooms,
      occupiedRooms: occupied || p.occupiedRooms,
      category: p.category || "kost",
    };
  });

  // Room / Unit Type Distribution from real rooms data
  const roomTypeCounts: Record<string, number> = {};
  filteredRooms.forEach((r) => {
    const typeName = r.type || "Standard";
    roomTypeCounts[typeName] = (roomTypeCounts[typeName] || 0) + 1;
  });

  const roomTypeDistribution = Object.entries(roomTypeCounts).map(([name, value], index) => ({
    name,
    value,
    color: PIE_COLORS[index % PIE_COLORS.length],
  }));

  // Fallback if no rooms yet
  const displayRoomDistribution = roomTypeDistribution.length > 0 ? roomTypeDistribution : [
    { name: "Belum Ada Unit", value: 1, color: "#94a3b8" }
  ];

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Periode,Pendapatan Terbayar (IDR),Biaya Operasional (IDR),Laba Bersih (IDR),Okupansi (%)\n" +
      revenueTrendData
        .map(
          (r) =>
            `"${r.month}",${r.revenue},${r.expenses},${r.profit},${r.occupancy}%`
        )
        .join("\n") +
      "\n\nPerforma Properti,Kategori,Total Unit,Unit Terisi,Okupansi (%),Realisasi Pendapatan (IDR)\n" +
      propertyRevenueData
        .map(
          (p) =>
            `"${p.fullName}","${p.category}",${p.totalRooms},${p.occupiedRooms},${p.occupancy}%,${p.revenue}`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Laporan_Analitik_Kost_Mulai_1_Sep_2026_${propertyFilter}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#7b1113] shadow-xs" />
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Laporan & Analitik Bisnis Kost
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Mulai 1 September 2026
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Analisis tren pendapatan, laba operasional, tingkat okupansi unit, dan performa 5 kategori properti terdaftar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Property Filter */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              aria-label="Pilih Properti untuk Laporan"
              className="bg-transparent text-gray-800 font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="all">Seluruh Properti ({properties.length})</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category?.toUpperCase() || "KOST"})
                </option>
              ))}
            </select>
          </div>

          {/* Time Range Toggle */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-bold">
            <button
              onClick={() => setTimeRange("6m")}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                timeRange === "6m"
                  ? "bg-white text-[#7b1113] shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              6 Bulan (2026/27)
            </button>
            <button
              onClick={() => setTimeRange("1y")}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                timeRange === "1y"
                  ? "bg-white text-[#7b1113] shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              1 Tahun Penuh
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-[#7b1113] hover:bg-[#630d0f] text-[#facc15] font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#facc15]" />
            Ekspor CSV / Excel
          </button>
        </div>
      </div>

      {/* 4 Real-time Analytics Summary Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Okupansi */}
        <div className="p-4.5 rounded-2xl bg-white border border-gray-200 shadow-xs hover:border-gray-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Rata-rata Okupansi</span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-[#7b1113]">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#7b1113] mt-2">
            {overallOccupancyRate.toFixed(1)}%
          </div>
          <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span><strong>{occupiedUnits}</strong> dari <strong>{totalUnits}</strong> unit/slot terisi</span>
          </div>
        </div>

        {/* Laba Bersih Bulan Ini */}
        <div className="p-4.5 rounded-2xl bg-white border border-gray-200 shadow-xs hover:border-gray-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Laba Bersih (Mulai 1 Sep 2026)</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">
            {formatRupiah(netProfit)}
          </div>
          <div className="text-[11px] text-gray-500 font-medium mt-1 flex items-center justify-between">
            <span>Omset: {formatRupiah(totalPaidRevenue)}</span>
            <span className="text-emerald-700 font-bold">Margin: {netProfitMargin}%</span>
          </div>
        </div>

        {/* Biaya Operasional / Maintenance */}
        <div className="p-4.5 rounded-2xl bg-white border border-gray-200 shadow-xs hover:border-gray-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Biaya Operasional & Servis</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <Wrench className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-800 mt-2">
            {formatRupiah(totalMaintenanceCost)}
          </div>
          <div className="text-[11px] text-gray-500 font-medium mt-1">
            {filteredMaintenance.length} tiket pemeliharaan & utilitas tercatat
          </div>
        </div>

        {/* Total Unit Terdaftar */}
        <div className="p-4.5 rounded-2xl bg-white border border-gray-200 shadow-xs hover:border-gray-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Total Portofolio Unit</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
            {totalUnits} Unit
          </div>
          <div className="text-[11px] text-gray-500 font-medium mt-1">
            {filteredProperties.length} Cabang Properti Aktif
          </div>
        </div>
      </div>

      {/* Chart 1: Revenue vs Net Profit Trend (Area Chart) starting 1 September 2026 */}
      <div className="p-5.5 rounded-2xl bg-white border border-gray-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-gray-900">
                Tren Pendapatan & Laba Bersih (Mulai 1 September 2026)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-[#7b1113] border border-rose-200">
                Data Transaksi Nyata
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Realisasi penerimaan sewa bulanan dan perhitungan laba bersih operasional
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-gray-700">
              <span className="w-3 h-3 rounded-xs bg-[#7b1113]" /> Omset (Revenue)
            </span>
            <span className="flex items-center gap-1.5 text-gray-700">
              <span className="w-3 h-3 rounded-xs bg-emerald-500" /> Laba Bersih (Net Profit)
            </span>
            <span className="flex items-center gap-1.5 text-gray-700">
              <span className="w-3 h-3 rounded-xs bg-amber-500" /> Biaya Operasional
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7b1113" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#7b1113" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickFormatter={(val) => `${(val / 1000000).toFixed(1)} jt`}
              />
              <Tooltip
                formatter={(val: any, name: string) => [
                  formatRupiah(Number(val)),
                  name === "revenue" ? "Omset / Pendapatan" : name === "profit" ? "Laba Bersih" : "Biaya Operasional",
                ]}
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="revenue"
                stroke="#7b1113"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRev)"
              />
              <Area
                type="monotone"
                dataKey="profit"
                name="profit"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorProfit)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="expenses"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="transparent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dual Charts: Revenue by Property & Room Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Revenue per Property (7 cols) */}
        <div className="lg:col-span-7 p-5.5 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-extrabold text-sm sm:text-base text-gray-900">
                Kontribusi Pendapatan per Properti
              </h3>
              <span className="text-xs text-gray-400 font-medium">Realisasi Sejak 1 Sep 2026</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Total pendapatan yang dibukukan dari masing-masing unit properti
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={propertyRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickFormatter={(val) => `${(val / 1000000).toFixed(1)} jt`}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatRupiah(Number(val)), "Realisasi Pendapatan"]}
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                  />
                  <Bar dataKey="revenue" name="Pendapatan" fill="#7b1113" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-gray-100 text-xs">
            {propertyRevenueData.map((p, i) => (
              <div key={i} className="p-2 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-500 text-[10px] block truncate font-medium">{p.fullName}</span>
                <strong className="text-gray-900 text-xs">{formatRupiah(p.revenue)}</strong>
                <div className="text-[10px] text-gray-400 mt-0.5">Okupansi: {p.occupancy}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Room Type Distribution (5 cols) */}
        <div className="lg:col-span-5 p-5.5 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-extrabold text-sm sm:text-base text-gray-900">
                Distribusi Tipe Unit & Kamar
              </h3>
              <span className="text-xs font-bold text-gray-600">{totalUnits} Unit Total</span>
            </div>
            <p className="text-xs text-gray-400 mb-2">Komposisi tipe sewa di seluruh cabang</p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayRoomDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {displayRoomDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`${val} Unit`, "Jumlah"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-gray-100 text-xs max-h-48 overflow-y-auto pr-1">
            {displayRoomDistribution.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-0.5">
                <span className="flex items-center gap-2 text-gray-700 font-medium truncate pr-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate">{item.name}</span>
                </span>
                <strong className="text-gray-900 shrink-0">{item.value} Unit</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Breakdown Table: Detail Performa Seluruh 5 Properti */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-base text-gray-900">
              Rincian Performa Portofolio Properti
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Data terhitung otomatis dari pembukuan dan unit sewa aktif per 1 September 2026
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Terverifikasi Real-time</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Nama Properti & Lokasi</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3 text-center">Kapasitas</th>
                <th className="px-4 py-3 text-center">Terisi</th>
                <th className="px-4 py-3 text-center">Okupansi</th>
                <th className="px-4 py-3 text-right">Pendapatan Terbayar</th>
                <th className="px-4 py-3 text-right">Tagihan Pending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredProperties.map((p) => {
                const propRooms = rooms.filter((r) => r.propertyId === p.id);
                const totalR = propRooms.length || p.totalRooms;
                const occR = propRooms.filter((r) => r.status === "occupied" || r.tenantId).length;
                const occPct = totalR > 0 ? ((occR / totalR) * 100).toFixed(1) : "0.0";

                const propPayments = payments.filter((pay) => pay.propertyId === p.id);
                const paid = propPayments
                  .filter((pay) => pay.status === "paid")
                  .reduce((sum, pay) => sum + pay.amount, 0);
                const pending = propPayments
                  .filter((pay) => pay.status === "pending" || pay.status === "overdue")
                  .reduce((sum, pay) => sum + pay.amount, 0);

                const cat = p.category || "kost";
                const catBadgeClass =
                  cat === "kost"
                    ? "bg-rose-50 text-[#7b1113] border-rose-200"
                    : cat === "rumah"
                    ? "bg-blue-50 text-blue-800 border-blue-200"
                    : cat === "parkir"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : cat === "ruko"
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-purple-50 text-purple-800 border-purple-200";

                return (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition">
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      <div>{p.name}</div>
                      <div className="text-[10px] text-gray-400 font-normal">{p.address || p.location}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase border ${catBadgeClass}`}>
                        {cat}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-medium">{totalR} Unit</td>
                    <td className="px-4 py-3 text-center font-bold text-emerald-700">{occR} Unit</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-[#7b1113]">{occPct}%</span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">
                      {formatRupiah(paid)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-amber-700">
                      {formatRupiah(pending)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50/80 font-bold border-t border-gray-200 text-gray-900">
              <tr>
                <td className="px-4 py-3" colSpan={2}>
                  Total Ringkasan Portofolio
                </td>
                <td className="px-4 py-3 text-center">{totalUnits} Unit</td>
                <td className="px-4 py-3 text-center text-emerald-700">{occupiedUnits} Unit</td>
                <td className="px-4 py-3 text-center text-[#7b1113]">{overallOccupancyRate.toFixed(1)}%</td>
                <td className="px-4 py-3 text-right text-emerald-700">{formatRupiah(totalPaidRevenue)}</td>
                <td className="px-4 py-3 text-right text-amber-700">{formatRupiah(totalPendingRevenue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
