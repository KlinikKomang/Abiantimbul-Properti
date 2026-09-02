import React, { useState } from "react";
import {
  Building2,
  DoorOpen,
  Users,
  Wrench,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Plus,
  Send,
  CreditCard,
  CheckCircle2,
  Clock,
  ChevronRight,
  Flame,
  PieChart as PieChartIcon,
  Search,
  Filter,
  Eye,
  Phone,
  MessageCircle,
  FileText,
  MapPin,
  Home,
  Car,
  Layers,
  Store,
  Trees
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Property, Room, Tenant, PaymentRecord, MaintenanceTicket, AIInsight, ActiveTab, PropertyCategory, UserProfile } from "../types";
import { formatRupiah } from "../data/mockData";

interface DashboardViewProps {
  user?: UserProfile;
  properties: Property[];
  rooms: Room[];
  tenants: Tenant[];
  payments: PaymentRecord[];
  maintenanceTickets: MaintenanceTicket[];
  insights: AIInsight[];
  selectedPropertyId: string;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddRoom: () => void;
  onOpenRecordPayment: () => void;
  onOpenCreateTicket: () => void;
  onOpenAiAssistant?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  properties,
  rooms,
  tenants,
  payments,
  maintenanceTickets,
  insights,
  selectedPropertyId,
  setActiveTab,
  onOpenAddRoom,
  onOpenRecordPayment,
  onOpenCreateTicket,
}) => {
  // Helper for greeting based on current local time
  const getTimeGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) {
      return "Selamat Pagi";
    } else if (hour >= 11 && hour < 15) {
      return "Selamat Siang";
    } else if (hour >= 15 && hour < 19) {
      return "Selamat Sore";
    } else {
      return "Selamat Malam";
    }
  };

  const currentDateFormatted = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  // 1. Filter dataset by active property selection
  const isFiltered = selectedPropertyId !== "all";
  const currentProperty = properties.find((p) => p.id === selectedPropertyId);

  const displayRooms = isFiltered ? rooms.filter((r) => r.propertyId === selectedPropertyId) : rooms;
  const displayTenants = isFiltered ? tenants.filter((t) => t.propertyId === selectedPropertyId) : tenants;
  const displayPayments = isFiltered ? payments.filter((p) => p.propertyId === selectedPropertyId) : payments;
  const displayTickets = isFiltered ? maintenanceTickets.filter((t) => t.propertyId === selectedPropertyId) : maintenanceTickets;

  // 2. Compute dynamic KPIs strictly from state
  const totalProperties = isFiltered ? 1 : properties.length;
  const totalRooms = displayRooms.length > 0 ? displayRooms.length : (isFiltered ? (currentProperty?.totalRooms || 0) : properties.reduce((acc, p) => acc + (p.totalRooms || 0), 0));
  const occupiedRooms = displayRooms.filter((r) => r.status === "occupied").length;
  const vacantRooms = displayRooms.filter((r) => r.status === "available").length;
  const maintenanceCount = displayRooms.filter((r) => r.status === "maintenance").length;
  const occupancyRate = totalRooms > 0 ? Number(((occupiedRooms / totalRooms) * 100).toFixed(1)) : 0;

  // Financial calculations
  const monthlyRevenue = displayRooms
    .filter((r) => r.status === "occupied")
    .reduce((acc, r) => acc + (r.price || 0), 0) || (isFiltered ? (currentProperty?.monthlyRevenue || 0) : properties.reduce((acc, p) => acc + (p.monthlyRevenue || 0), 0));

  const outstandingBills = displayPayments
    .filter((p) => p.status === "pending" || p.status === "overdue")
    .reduce((acc, p) => acc + p.amount, 0) || (displayTenants.filter(t => t.paymentStatus !== "active").length * 2000000);

  const overdueCount = displayTenants.filter((t) => t.paymentStatus === "overdue" || t.paymentStatus === "due").length;

  // Table interactive filter states
  const [tableStatusFilter, setTableStatusFilter] = useState<"all" | "occupied" | "available" | "maintenance">("all");
  const [tablePropertyFilter, setTablePropertyFilter] = useState<string>("all");
  const [tableCategoryFilter, setTableCategoryFilter] = useState<"all" | PropertyCategory>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const getPropertyCategory = (propertyId: string): PropertyCategory => {
    const p = properties.find((item) => item.id === propertyId);
    return p?.category || "kost";
  };

  // Filtered rooms for the live table
  const tableRooms = displayRooms.filter((room) => {
    if (tableStatusFilter !== "all" && room.status !== tableStatusFilter) return false;
    if (!isFiltered && tablePropertyFilter !== "all" && room.propertyId !== tablePropertyFilter) return false;
    if (tableCategoryFilter !== "all" && getPropertyCategory(room.propertyId) !== tableCategoryFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchRoom = room.roomNumber.toLowerCase().includes(q);
      const matchType = room.type.toLowerCase().includes(q);
      const matchProp = room.propertyName.toLowerCase().includes(q);
      const matchTenant = room.tenantName ? room.tenantName.toLowerCase().includes(q) : false;
      return matchRoom || matchType || matchProp || matchTenant;
    }
    return true;
  });

  // Dynamic Monthly Revenue Chart Data
  const monthlyRevenueData = [
    { month: "Mar 2026", revenue: Math.round(monthlyRevenue * 0.88), target: Math.round(monthlyRevenue * 0.95) },
    { month: "Apr 2026", revenue: Math.round(monthlyRevenue * 0.91), target: Math.round(monthlyRevenue * 0.98) },
    { month: "Mei 2026", revenue: Math.round(monthlyRevenue * 0.94), target: Math.round(monthlyRevenue * 1.0) },
    { month: "Jun 2026", revenue: Math.round(monthlyRevenue * 0.97), target: Math.round(monthlyRevenue * 1.02) },
    { month: "Jul 2026", revenue: Math.round(monthlyRevenue * 0.95), target: Math.round(monthlyRevenue * 1.05) },
    { month: "Ags 2026 (Ini)", revenue: monthlyRevenue, target: Math.round(monthlyRevenue * 1.1) },
  ];

  // Best performing property
  const topProperty = properties.length > 0 ? [...properties].sort((a, b) => b.occupancyRate - a.occupancyRate)[0] : null;

  const getCategoryBadge = (cat?: PropertyCategory) => {
    switch (cat) {
      case "rumah":
        return {
          label: "Rumah",
          icon: <Home className="w-3 h-3 text-indigo-700" />,
          color: "bg-indigo-50 text-indigo-800 border-indigo-200",
          unitTerm: "Unit",
        };
      case "parkir":
        return {
          label: "Parkir",
          icon: <Car className="w-3 h-3 text-emerald-700" />,
          color: "bg-emerald-50 text-emerald-800 border-emerald-200",
          unitTerm: "Slot",
        };
      case "ruko":
        return {
          label: "Ruko",
          icon: <Store className="w-3 h-3 text-amber-700" />,
          color: "bg-amber-50 text-amber-900 border-amber-200",
          unitTerm: "Unit",
        };
      case "tanah":
        return {
          label: "Sewa Tanah",
          icon: <Trees className="w-3 h-3 text-teal-700" />,
          color: "bg-teal-50 text-teal-900 border-teal-200",
          unitTerm: "Kavling",
        };
      case "kost":
      default:
        return {
          label: "Kost",
          icon: <Building2 className="w-3 h-3 text-[#7b1113]" />,
          color: "bg-rose-50 text-[#7b1113] border-rose-200",
          unitTerm: "Kamar",
        };
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. TOP HEADER BANNER */}
      <div className="rounded-2xl bg-[#7b1113] text-white p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Subtle Glow Circle */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#facc15] opacity-10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ffffff20] text-[#facc15] border border-amber-400/30">
                <Flame className="w-3.5 h-3.5 text-[#facc15]" />
                {isFiltered ? `Unit: ${currentProperty?.name}` : "Sistem Manajemen Multi-Properti (Kost, Rumah, Parkir, Ruko & Sewa Tanah)"}
              </span>
              <span className="text-xs text-rose-200/90">Per {currentDateFormatted}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {getTimeGreeting()} {user?.name || "Gde AP"} 👋
            </h1>
            <p className="text-rose-100/90 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {properties.length === 0 ? (
                <span>
                  Database properti Anda masih kosong. Silakan buka menu <strong>Properti</strong> untuk mendaftarkan kost, rumah kontrakan, atau lot parkir sewa Anda.
                </span>
              ) : (
                <span>
                  Ringkasan portofolio sewa Anda mencakup {properties.length} properti terdaftar ({displayTenants.length} penyewa aktif). Okupansi {isFiltered ? `unit ${currentProperty?.name}` : "keseluruhan"} mencapai{" "}
                  <strong className="text-[#facc15] font-bold">{occupancyRate}%</strong> ({occupiedRooms} dari {totalRooms} unit/slot/kamar terisi) dengan estimasi pendapatan bulan ini{" "}
                  <strong className="text-[#facc15] font-bold">{formatRupiah(monthlyRevenue)}</strong>.
                </span>
              )}
            </p>
          </div>

          {/* Action buttons inside header */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onOpenRecordPayment}
              className="px-3.5 py-2 rounded-lg bg-[#facc15] hover:bg-amber-300 text-[#7b1113] font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <CreditCard className="w-4 h-4 text-[#7b1113]" />
              Catat Pembayaran
            </button>
            <button
              onClick={onOpenAddRoom}
              className="px-3.5 py-2 rounded-lg bg-[#ffffff15] hover:bg-[#ffffff25] text-white font-semibold text-xs border border-white/20 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#facc15]" />
              Tambah Unit / Kamar
            </button>
          </div>
        </div>

        {/* Selected Property Notice if filtered */}
        {isFiltered && (
          <div className="mt-4 pt-3 border-t border-[#ffffff15] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="text-amber-200 font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#facc15]" />
              Menampilkan data terfilter untuk: <strong>{currentProperty?.name}</strong> ({currentProperty?.location})
            </div>
            <button
              onClick={() => setActiveTab("properties")}
              className="text-[#facc15] hover:underline text-[11px] font-bold cursor-pointer"
            >
              Kelola Properti Lainnya →
            </button>
          </div>
        )}
      </div>

      {/* 2. DYNAMIC BUSINESS OVERVIEW (KPI 6-GRID CARDS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Properti */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total Properti</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">{totalProperties}</h3>
          <div className="text-[10px] text-gray-400 mt-1">
            {isFiltered ? "1 Lokasi Terpilih" : `${properties.length} Lokasi Aktif`}
          </div>
        </div>

        {/* Total Unit/Kamar/Slot */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total Unit / Slot</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">{totalRooms}</h3>
          <div className="text-[10px] text-gray-400 mt-1">Kapasitas Portofolio</div>
        </div>

        {/* Terisi */}
        <div className="bg-green-50 p-4 rounded-xl shadow-xs border border-green-100 flex flex-col justify-between">
          <p className="text-[10px] text-green-700 uppercase font-bold tracking-wider">Terisi (Occupied)</p>
          <h3 className="text-2xl font-bold text-green-700 mt-2">{occupiedRooms}</h3>
          <div className="text-[10px] text-green-600 font-semibold mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
            {displayTenants.length} Penyewa Aktif
          </div>
        </div>

        {/* Kosong */}
        <div className="bg-gray-50 p-4 rounded-xl shadow-xs border border-gray-200 flex flex-col justify-between">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Kosong (Available)</p>
          <h3 className="text-2xl font-bold text-gray-500 mt-2">{vacantRooms}</h3>
          <div className="text-[10px] text-amber-600 font-semibold mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Siap Disewa
          </div>
        </div>

        {/* Maintenance */}
        <div className="bg-orange-50 p-4 rounded-xl shadow-xs border border-orange-100 flex flex-col justify-between">
          <p className="text-[10px] text-orange-700 uppercase font-bold tracking-wider">Maintenance</p>
          <h3 className="text-2xl font-bold text-orange-700 mt-2">{maintenanceCount}</h3>
          <div className="text-[10px] text-orange-600 font-semibold mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            {displayTickets.filter(t => t.status !== "completed").length} Tiket Aktif
          </div>
        </div>

        {/* Occupancy */}
        <div className="bg-[#7b1113] p-4 rounded-xl shadow-xs border border-[#7b1113] flex flex-col justify-between text-white">
          <p className="text-[10px] text-white opacity-80 uppercase font-bold tracking-wider">Occupancy</p>
          <h3 className="text-2xl font-bold text-[#facc15] mt-2">{occupancyRate}%</h3>
          <div className="text-[10px] text-emerald-300 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> Target 80%
          </div>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT: 2/3 COLUMN (Finances, Table, Charts) + 1/3 COLUMN (AI Assistant, Recent Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Financial Cards, Room Status Table, Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dual Financial Hero Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pendapatan Bulan Ini */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border-l-4 border-[#7b1113] border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-gray-600">Pendapatan Bulan Ini</p>
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                  Aktif
                </span>
              </div>
              <p className="text-2xl font-black text-gray-900 tracking-tight">{formatRupiah(monthlyRevenue)}</p>
              <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#facc15]"
                  style={{ width: `${Math.min(100, Math.round((monthlyRevenue / (monthlyRevenue * 1.15 || 1)) * 100))}%` }}
                />
              </div>
              <div className="mt-2 text-[11px] text-gray-400 flex items-center justify-between">
                <span>Realisasi: {occupiedRooms}/{totalRooms} Unit/Slot/Kamar</span>
                <span className="font-semibold text-gray-600">Potensi: {formatRupiah(displayRooms.reduce((a, r) => a + r.price, 0) || monthlyRevenue * 1.2)}</span>
              </div>
            </div>

            {/* Tagihan Belum Dibayar */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border-l-4 border-red-500 border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-gray-600">Tagihan Belum Dibayar</p>
                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                  {overdueCount > 0 ? `${overdueCount} Perlu Follow-up` : "Semua Lunas"}
                </span>
              </div>
              <p className="text-2xl font-black text-red-600 tracking-tight">{formatRupiah(outstandingBills)}</p>
              <p className="text-[10px] text-gray-400 mt-2">
                *{overdueCount} penyewa memiliki tagihan sewa mendekati / melewati batas tempo
              </p>
              <button
                onClick={() => setActiveTab("reminders")}
                className="mt-3 text-[11px] font-bold text-[#7b1113] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Kirim Pengingat WhatsApp Otomatis →
              </button>
            </div>
          </div>

          {/* DYNAMIC STATUS UNIT / KAMAR TERKINI TABLE ACROSS ALL PROPERTIES */}
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#7b1113]" />
                    Status Unit Sewa Terkini {isFiltered ? `(${currentProperty?.name})` : `(Seluruh ${properties.length} Properti: Kost, Rumah & Parkir)`}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Menampilkan data {displayRooms.length} unit/slot/kamar dan {displayTenants.length} penyewa aktif
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("rooms")}
                  className="text-[11px] text-[#7b1113] font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  Kelola di Tab Unit / Kamar →
                </button>
              </div>

              {/* Table Filters & Search */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                {/* Status Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                  <button
                    onClick={() => setTableStatusFilter("all")}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                      tableStatusFilter === "all"
                        ? "bg-[#7b1113] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Semua ({displayRooms.length})
                  </button>
                  <button
                    onClick={() => setTableStatusFilter("occupied")}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 ${
                      tableStatusFilter === "occupied"
                        ? "bg-green-600 text-white"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Terisi ({occupiedRooms})
                  </button>
                  <button
                    onClick={() => setTableStatusFilter("available")}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 ${
                      tableStatusFilter === "available"
                        ? "bg-blue-600 text-white"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    Kosong ({vacantRooms})
                  </button>
                  <button
                    onClick={() => setTableStatusFilter("maintenance")}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 ${
                      tableStatusFilter === "maintenance"
                        ? "bg-orange-600 text-white"
                        : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    Perbaikan ({maintenanceCount})
                  </button>
                </div>

                {/* Search & Property selector */}
                <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                  <select
                    value={tableCategoryFilter}
                    onChange={(e) => setTableCategoryFilter(e.target.value as any)}
                    aria-label="Filter berdasarkan Jenis"
                    className="px-2 py-1 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium focus:ring-1 focus:ring-[#7b1113] outline-hidden cursor-pointer"
                  >
                    <option value="all">Semua Jenis</option>
                    <option value="kost">Kost</option>
                    <option value="rumah">Sewa Rumah</option>
                    <option value="parkir">Lot Parkir</option>
                    <option value="ruko">Ruko</option>
                    <option value="tanah">Sewa Tanah</option>
                  </select>

                  {!isFiltered && (
                    <select
                      value={tablePropertyFilter}
                      onChange={(e) => setTablePropertyFilter(e.target.value)}
                      aria-label="Filter berdasarkan Properti"
                      className="px-2.5 py-1 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium focus:ring-1 focus:ring-[#7b1113] outline-hidden cursor-pointer"
                    >
                      <option value="all">Semua Properti ({properties.length})</option>
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  )}

                  <div className="relative flex-1 sm:w-44">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari unit / nama..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#7b1113] outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-2.5 font-bold">Unit / Slot / Kamar</th>
                    <th className="px-4 py-2.5 font-bold">Properti & Jenis</th>
                    <th className="px-4 py-2.5 font-bold">Status</th>
                    <th className="px-4 py-2.5 font-bold">Penyewa</th>
                    <th className="px-4 py-2.5 font-bold">Tipe & Ukuran</th>
                    <th className="px-4 py-2.5 font-bold text-right">Tarif Sewa</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-gray-100">
                  {tableRooms.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                        Tidak ada data unit yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    tableRooms.slice(0, 10).map((room) => {
                      const cat = getPropertyCategory(room.propertyId);
                      const badge = getCategoryBadge(cat);
                      return (
                        <tr key={room.id} className="hover:bg-gray-50/80 transition">
                          {/* Unit Number & Property */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 text-sm font-mono">{room.roomNumber}</span>
                            </div>
                            <span className="text-[10px] text-gray-400">
                              {cat === "parkir" ? "Area Terpadu" : `Lantai ${room.floor}`}
                            </span>
                          </td>

                          {/* Property & Category Badge */}
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-800 truncate max-w-[170px]">
                              {room.propertyName}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border flex items-center gap-1 ${badge.color}`}>
                                {badge.icon}
                                {badge.label}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            {room.status === "occupied" ? (
                              <span className="inline-flex items-center gap-1.5 text-green-700 font-semibold px-2 py-0.5 rounded-full bg-green-50 text-[11px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Terisi
                              </span>
                            ) : room.status === "available" ? (
                              <span className="inline-flex items-center gap-1.5 text-blue-700 font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[11px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Kosong
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-orange-700 font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-[11px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Perbaikan
                              </span>
                            )}
                          </td>

                          {/* Tenant */}
                          <td className="px-4 py-3">
                            {room.tenantName ? (
                              <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-[#7b1113]/10 text-[#7b1113] flex items-center justify-center text-[10px]">
                                  {room.tenantName[0]}
                                </span>
                                <span className="truncate max-w-[130px]">{room.tenantName}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">- Siap Disewa -</span>
                            )}
                          </td>

                          {/* Type & Size */}
                          <td className="px-4 py-3">
                            <span className="font-medium text-gray-700">{room.type}</span>
                            <div className="text-[10px] text-gray-400">{room.size}</div>
                          </td>

                          {/* Price */}
                          <td className="px-4 py-3 text-right font-bold text-[#7b1113]">
                            {formatRupiah(room.price)}
                            <span className="text-[10px] text-gray-400 font-normal"> /bln</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {tableRooms.length > 10 && (
              <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                <button
                  onClick={() => setActiveTab("rooms")}
                  className="text-xs text-[#7b1113] font-bold hover:underline cursor-pointer"
                >
                  Lihat Seluruh {tableRooms.length} Unit / Kamar di Tab Manajemen →
                </button>
              </div>
            )}
          </div>

          {/* Monthly Revenue Chart */}
          <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Tren Pendapatan Bulanan (6 Bulan Terakhir)</h3>
                <p className="text-xs text-gray-400">Pertumbuhan pendapatan sewa portofolio vs target bulanan</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                  <span className="w-3 h-3 rounded-xs bg-[#7b1113]" /> Realisasi
                </span>
                <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                  <span className="w-3 h-3 rounded-xs bg-[#facc15]" /> Target
                </span>
              </div>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                  <Bar dataKey="revenue" name="Pendapatan" fill="#7b1113" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="target" name="Target" fill="#facc15" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Portofolio Insight Summary + Recent Activity */}
        <div className="space-y-4">
          {/* PORTOFOLIO INSIGHT BOX */}
          <div className="bg-gradient-to-br from-[#7b1113] to-[#4b0a0b] p-5 rounded-2xl shadow-lg text-white relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#facc15] opacity-20 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <span className="text-xl">📊</span>
              <div>
                <h3 className="text-sm font-bold tracking-wide">RINGKASAN PORTOFOLIO</h3>
                <p className="text-[10px] text-rose-200/80">Kalkulasi Okupansi & Keuangan Terkini</p>
              </div>
            </div>

            <div className="space-y-3 relative z-10">
              <div className="bg-[#ffffff15] p-3 rounded-lg border border-[#ffffff20]">
                <p className="text-[10px] font-bold text-[#facc15] uppercase tracking-wider">Occupancy Insight</p>
                <p className="text-xs leading-relaxed opacity-90 mt-0.5">
                  Okupansi saat ini <strong>{occupancyRate}%</strong> ({occupiedRooms}/{totalRooms} unit). {topProperty ? `Kinerja terbaik di ${topProperty.name} (${topProperty.occupancyRate}%).` : ""}
                </p>
              </div>

              <div className="bg-[#ffffff15] p-3 rounded-lg border border-[#ffffff20]">
                <p className="text-[10px] font-bold text-[#facc15] uppercase tracking-wider">Vacancy Prediction</p>
                <p className="text-xs leading-relaxed opacity-90 mt-0.5">
                  Tersedia <strong>{vacantRooms} unit kosong</strong> siap sewa dan <strong>{maintenanceCount} unit dalam pemeliharaan</strong>.
                </p>
              </div>

              <div className="bg-[#facc15] p-3 rounded-lg text-[#7b1113]">
                <p className="text-[10px] font-black uppercase tracking-wider">Revenue Forecast</p>
                <p className="text-xs font-bold leading-relaxed mt-0.5">
                  Estimasi pendapatan sewa: <strong>{formatRupiah(monthlyRevenue)}</strong> per bulan.
                </p>
              </div>
            </div>
          </div>

          {/* Aktivitas Terakhir (Recent Activity Card) with diverse real events */}
          <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-gray-900">Aktivitas Terakhir Portofolio</h4>
              <span className="text-[10px] text-gray-400">Terbaru</span>
            </div>
            <div className="space-y-3">
              {displayPayments.slice(0, 2).map((p) => (
                <div key={p.id} className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold shrink-0">
                    💰
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-gray-800 truncate">{p.tenantName} - Pembayaran Sewa</p>
                    <p className="text-[10px] text-gray-400">{p.roomNumber} ({p.propertyName}) • {formatRupiah(p.amount)}</p>
                  </div>
                </div>
              ))}

              {displayTickets.slice(0, 2).map((t) => (
                <div key={t.id} className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-700 text-xs font-bold shrink-0">
                    🔧
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-gray-800 truncate">{t.issue} ({t.roomNumber})</p>
                    <p className="text-[10px] text-gray-400">{t.propertyName} • Status: {t.status}</p>
                  </div>
                </div>
              ))}

              {displayTenants.slice(0, 2).map((t) => (
                <div key={t.id} className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                    📝
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-gray-800 truncate">Penyewa: {t.name}</p>
                    <p className="text-[10px] text-gray-400">{t.propertyName} ({t.roomNumber}) • {t.durationMonths} bln</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100">
            <h4 className="text-xs font-bold text-gray-900 mb-2">Aksi Cepat Manajemen</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTab("reminders")}
                className="p-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#7b1113] text-left text-xs font-bold transition cursor-pointer"
              >
                📲 WhatsApp Reminder
              </button>
              <button
                onClick={() => setActiveTab("contracts")}
                className="p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-800 text-left text-xs font-bold transition cursor-pointer"
              >
                📄 Kontrak Digital
              </button>
              <button
                onClick={() => setActiveTab("properties")}
                className="p-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-left text-xs font-bold transition cursor-pointer"
              >
                🏢 Kelola Properti
              </button>
              <button
                onClick={() => setActiveTab("finance")}
                className="p-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-left text-xs font-bold transition cursor-pointer"
              >
                💳 Laporan Keuangan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
