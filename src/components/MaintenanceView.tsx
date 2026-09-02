import React from "react";
import {
  Wrench,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Building2,
  X,
  Droplet,
  Zap,
  Wind,
  Armchair,
  Sparkles,
  DollarSign
} from "lucide-react";
import { MaintenanceTicket, MaintenanceCategory, MaintenancePriority, MaintenanceStatus, Property, Room } from "../types";
import { formatRupiah } from "../data/mockData";
import { RoomComboBox } from "./RoomComboBox";

interface MaintenanceViewProps {
  tickets: MaintenanceTicket[];
  properties: Property[];
  rooms: Room[];
  selectedPropertyId: string;
  onAddTicket: (ticket: MaintenanceTicket) => void;
  onUpdateTicket: (ticket: MaintenanceTicket) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  tickets,
  properties,
  rooms,
  selectedPropertyId,
  onAddTicket,
  onUpdateTicket,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [selectedTicketDetail, setSelectedTicketDetail] = React.useState<MaintenanceTicket | null>(null);

  // New ticket state
  const [newPropId, setNewPropId] = React.useState(properties[0]?.id || "");
  const [newRoomNumber, setNewRoomNumber] = React.useState("");
  const [newCategory, setNewCategory] = React.useState<MaintenanceCategory>("AC");
  const [newPriority, setNewPriority] = React.useState<MaintenancePriority>("Normal");
  const [newDesc, setNewDesc] = React.useState("");
  const [newTenantName, setNewTenantName] = React.useState("");
  const [newTechnician, setNewTechnician] = React.useState("");
  const [newCost, setNewCost] = React.useState(0);
  const [newEstDate, setNewEstDate] = React.useState(new Date().toISOString().split("T")[0]);

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignedTechnician.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getCategoryIcon = (category: MaintenanceCategory) => {
    switch (category) {
      case "AC":
        return <Wind className="w-3.5 h-3.5 text-cyan-600" />;
      case "Plumbing":
        return <Droplet className="w-3.5 h-3.5 text-blue-600" />;
      case "Electrical":
        return <Zap className="w-3.5 h-3.5 text-amber-600" />;
      case "Furniture":
        return <Armchair className="w-3.5 h-3.5 text-orange-600" />;
      default:
        return <Wrench className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const prop = properties.find((p) => p.id === newPropId);
    const newTicket: MaintenanceTicket = {
      id: `maint-${Date.now()}`,
      propertyId: newPropId,
      propertyName: prop?.name || "Kost Harmoni Residence",
      roomNumber: newRoomNumber,
      tenantName: newTenantName,
      category: newCategory,
      priority: newPriority,
      description: newDesc,
      status: "new",
      reportedDate: new Date().toISOString().split("T")[0],
      assignedTechnician: newTechnician,
      estimatedCompletionDate: newEstDate,
      estimatedCost: Number(newCost),
      photos: [
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80",
      ],
    };

    onAddTicket(newTicket);
    setIsAddModalOpen(false);
    setNewDesc("");
  };

  const handleUpdateStatus = (ticket: MaintenanceTicket, newStatus: MaintenanceStatus) => {
    const updated = {
      ...ticket,
      status: newStatus,
      completedDate: newStatus === "completed" ? new Date().toISOString().split("T")[0] : undefined,
    };
    onUpdateTicket(updated);
    if (selectedTicketDetail && selectedTicketDetail.id === ticket.id) {
      setSelectedTicketDetail(updated);
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
              Manajemen Pemeliharaan & Tiket (Maintenance)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola laporan kerusakan kamar, penugasan teknisi, tracking status pengerjaan, dan estimasi biaya.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#800020] to-[#991b1b] hover:from-[#6b001b] hover:to-[#881337] text-white font-bold text-xs shadow-md transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          Buat Tiket Perbaikan Baru
        </button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase">Tiket Baru (New)</span>
            <div className="text-2xl font-black text-blue-700 mt-1">
              {tickets.filter((t) => t.status === "new").length} Tiket
            </div>
          </div>
          <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase">Dalam Pengerjaan</span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {tickets.filter((t) => t.status === "in_progress").length} Tiket
            </div>
          </div>
          <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase">Selesai Diperbaiki</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {tickets.filter((t) => t.status === "completed").length} Tiket
            </div>
          </div>
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Cari deskripsi / kamar / teknisi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#800020] text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === "all" ? "bg-[#800020] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Semua ({tickets.length})
            </button>
            <button
              onClick={() => setStatusFilter("new")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === "new" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-800 border border-blue-200"
              }`}
            >
              🔵 Baru
            </button>
            <button
              onClick={() => setStatusFilter("in_progress")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === "in_progress" ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-900 border border-amber-200"
              }`}
            >
              🟠 In Progress
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === "completed" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
              }`}
            >
              🟢 Selesai
            </button>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-semibold">Kategori:</span>
          {["all", "AC", "Plumbing", "Electrical", "Furniture", "General"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                categoryFilter === cat
                  ? "bg-[#800020] text-white font-bold"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat === "all" ? "Semua Kategori" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTickets.map((ticket) => {
          return (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicketDetail(ticket)}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#800020]/40 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Top badges */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-[#800020] font-mono font-bold text-xs border border-rose-200">
                      Kamar {ticket.roomNumber}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                      {getCategoryIcon(ticket.category)}
                      {ticket.category}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ticket.priority === "Urgent"
                        ? "bg-rose-100 text-rose-800"
                        : ticket.priority === "High"
                        ? "bg-amber-100 text-amber-900"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {ticket.priority}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 line-clamp-2 leading-snug">
                  {ticket.description}
                </h3>
                <div className="text-[11px] text-slate-500 mt-1">{ticket.propertyName}</div>

                {/* Detail info */}
                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Pelapor:</span>
                    <strong className="text-slate-800">{ticket.tenantName}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Teknisi:</span>
                    <strong className="text-slate-800">{ticket.assignedTechnician}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Est. Biaya:</span>
                    <strong className="text-[#800020]">{formatRupiah(ticket.estimatedCost)}</strong>
                  </div>
                </div>
              </div>

              {/* Bottom status & Action */}
              <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
                <div>
                  {ticket.status === "completed" ? (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                    </span>
                  ) : ticket.status === "in_progress" ? (
                    <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                      <Wrench className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "4s" }} /> In Progress
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-blue-600">
                      <Clock className="w-3.5 h-3.5" /> Tiket Baru
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-bold text-[#800020] hover:underline">
                  Kelola Tiket →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: DETAIL & UPDATE STATUS TIKET */}
      {selectedTicketDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#800020]" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Tiket #{selectedTicketDetail.id} (Kamar {selectedTicketDetail.roomNumber})
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicketDetail(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Masalah / Keluhan:</span>
                  <span className="font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                    {selectedTicketDetail.priority}
                  </span>
                </div>
                <p className="text-slate-800 text-sm font-semibold">{selectedTicketDetail.description}</p>
                <div className="text-slate-500 text-[11px]">
                  Dilaporkan pada: {selectedTicketDetail.reportedDate} oleh {selectedTicketDetail.tenantName}
                </div>
              </div>

              {selectedTicketDetail.photos && selectedTicketDetail.photos.length > 0 && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Foto Lampiran Kerusakan:</label>
                  <img
                    src={selectedTicketDetail.photos[0]}
                    alt="Lampiran"
                    className="w-full h-44 object-cover rounded-xl border border-slate-200"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[11px] block">Teknisi Ditugaskan</span>
                  <strong className="text-slate-800">{selectedTicketDetail.assignedTechnician}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[11px] block">Biaya Perbaikan</span>
                  <strong className="text-[#800020] text-sm">
                    {formatRupiah(selectedTicketDetail.estimatedCost)}
                  </strong>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-2">Update Status Pengerjaan:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedTicketDetail, "new")}
                    className={`py-2 rounded-xl font-bold text-xs transition border ${
                      selectedTicketDetail.status === "new"
                        ? "bg-blue-600 text-white border-blue-700"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    🔵 Baru (New)
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedTicketDetail, "in_progress")}
                    className={`py-2 rounded-xl font-bold text-xs transition border ${
                      selectedTicketDetail.status === "in_progress"
                        ? "bg-amber-600 text-white border-amber-700"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    🟠 In Progress
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedTicketDetail, "completed")}
                    className={`py-2 rounded-xl font-bold text-xs transition border ${
                      selectedTicketDetail.status === "completed"
                        ? "bg-emerald-600 text-white border-emerald-700"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    🟢 Selesai
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => setSelectedTicketDetail(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BUAT TIKET BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#800020]" />
                <h3 className="font-extrabold text-base text-slate-900">Buat Tiket Perbaikan Baru</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pilih Properti Kost *</label>
                  <select
                    value={newPropId}
                    onChange={(e) => setNewPropId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none"
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor / Kode Unit (Combo Box) *</label>
                  <RoomComboBox
                    rooms={rooms}
                    propertyId={newPropId}
                    value={newRoomNumber}
                    onChange={(val) => setNewRoomNumber(val)}
                    onSelectRoom={(room) => {
                      if (room.tenantName) {
                        setNewTenantName(room.tenantName);
                      }
                    }}
                    required={true}
                    category={properties.find((p) => p.id === newPropId)?.category}
                    placeholder="Pilih atau cari kode unit..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori Masalah</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as MaintenanceCategory)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none"
                  >
                    <option value="AC">AC (Air Conditioner)</option>
                    <option value="Plumbing">Air & Pipa (Plumbing)</option>
                    <option value="Electrical">Kelistrikan & Lampu</option>
                    <option value="Furniture">Perabot & Kasur</option>
                    <option value="General">Kebersihan & Umum</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prioritas</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as MaintenancePriority)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none"
                  >
                    <option value="Low">Low (Rendah)</option>
                    <option value="Medium">Medium (Sedang)</option>
                    <option value="High">High (Tinggi)</option>
                    <option value="Urgent">Urgent (Darurat)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Deskripsi Kerusakan *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Jelaskan detail kendala (misal: AC bocor menetes ke lantai atau kran wastafel patah)..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Teknisi Ditugaskan</label>
                  <input
                    type="text"
                    value={newTechnician}
                    onChange={(e) => setNewTechnician(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estimasi Biaya (Rp)</label>
                  <input
                    type="number"
                    value={newCost}
                    onChange={(e) => setNewCost(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white font-bold shadow-sm"
                >
                  Simpan Tiket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
