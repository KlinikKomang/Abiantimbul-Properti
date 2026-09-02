import React from "react";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  ArrowRightLeft,
  LogOut,
  Sparkles,
  Send,
  X,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  Home,
  Car,
  Layers,
  Store,
  Trees
} from "lucide-react";
import { Tenant, TenantStatus, Property, Room, PropertyCategory } from "../types";
import { formatRupiah } from "../data/mockData";
import { RoomComboBox } from "./RoomComboBox";

interface TenantViewProps {
  tenants: Tenant[];
  properties: Property[];
  rooms: Room[];
  selectedPropertyId: string;
  onAddTenant: (tenant: Tenant) => void;
  onUpdateTenant: (tenant: Tenant) => void;
}

export const TenantView: React.FC<TenantViewProps> = ({
  tenants,
  properties,
  rooms,
  selectedPropertyId,
  onAddTenant,
  onUpdateTenant,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [propertyFilter, setPropertyFilter] = React.useState<string>(selectedPropertyId);
  const [categoryFilter, setCategoryFilter] = React.useState<"all" | PropertyCategory>("all");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [selectedTenantForEdit, setSelectedTenantForEdit] = React.useState<Tenant | null>(null);
  const [selectedTenantForMove, setSelectedTenantForMove] = React.useState<Tenant | null>(null);
  const [selectedTenantForExtend, setSelectedTenantForExtend] = React.useState<Tenant | null>(null);
  const [selectedTenantDetail, setSelectedTenantDetail] = React.useState<Tenant | null>(null);

  // Form states for adding tenant
  const [newName, setNewName] = React.useState("");
  const [newPropId, setNewPropId] = React.useState(properties[0]?.id || "");
  const [newRoomNumber, setNewRoomNumber] = React.useState("");
  const [newPhone, setNewPhone] = React.useState("");
  const [newEmail, setNewEmail] = React.useState("");
  const [newIdCard, setNewIdCard] = React.useState("");
  const [newMonthlyPrice, setNewMonthlyPrice] = React.useState(0);
  const [newDeposit, setNewDeposit] = React.useState(0);
  const [newOccupation, setNewOccupation] = React.useState("");
  const [newCheckInDate, setNewCheckInDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [newContractEndDate, setNewContractEndDate] = React.useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  // Move room states
  const [targetRoomNumber, setTargetRoomNumber] = React.useState("");

  // Extend contract states
  const [extendMonths, setExtendMonths] = React.useState(12);

  React.useEffect(() => {
    setPropertyFilter(selectedPropertyId);
  }, [selectedPropertyId]);

  const getPropertyCategory = (propertyId: string): PropertyCategory => {
    const p = properties.find((item) => item.id === propertyId);
    return p?.category || "kost";
  };

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery);

    const matchesStatus = statusFilter === "all" || t.paymentStatus === statusFilter;
    const matchesProperty = propertyFilter === "all" || t.propertyId === propertyFilter;

    const propCat = getPropertyCategory(t.propertyId);
    const matchesCategory = categoryFilter === "all" || propCat === categoryFilter;

    return matchesSearch && matchesStatus && matchesProperty && matchesCategory;
  });

  const handlePropSelectionForAdd = (propId: string) => {
    setNewPropId(propId);
    const availableRooms = rooms.filter((r) => r.propertyId === propId && r.status === "available");
    if (availableRooms.length > 0) {
      setNewRoomNumber(availableRooms[0].roomNumber);
      setNewMonthlyPrice(availableRooms[0].price);
      setNewDeposit(availableRooms[0].price);
    }
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    const prop = properties.find((p) => p.id === newPropId);
    const newTenant: Tenant = {
      id: `ten-${Date.now()}`,
      name: newName,
      propertyId: newPropId,
      propertyName: prop?.name || "Properti Sewa",
      roomNumber: newRoomNumber,
      phone: newPhone,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
      idCardNumber: newIdCard,
      emergencyContact: {
        name: "Keluarga Terdekat",
        relation: "Orang Tua / Pasangan",
        phone: "+62 813-9988-1122",
      },
      checkInDate: newCheckInDate,
      contractEndDate: newContractEndDate,
      monthlyPrice: Number(newMonthlyPrice),
      depositAmount: Number(newDeposit),
      paymentStatus: "active",
      occupation: newOccupation,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 99999)}?w=150&auto=format&fit=crop&q=80`,
    };

    onAddTenant(newTenant);
    setIsAddModalOpen(false);
    setNewName("");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTenantForEdit) {
      onUpdateTenant(selectedTenantForEdit);
      setSelectedTenantForEdit(null);
    }
  };

  const handleMoveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTenantForMove && targetRoomNumber) {
      const updated = {
        ...selectedTenantForMove,
        roomNumber: targetRoomNumber,
      };
      onUpdateTenant(updated);
      setSelectedTenantForMove(null);
    }
  };

  const handleExtendContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTenantForExtend) {
      const currentEnd = new Date(selectedTenantForExtend.contractEndDate);
      currentEnd.setMonth(currentEnd.getMonth() + extendMonths);
      const newEndDate = currentEnd.toISOString().split("T")[0];

      const updated = {
        ...selectedTenantForExtend,
        contractEndDate: newEndDate,
      };
      onUpdateTenant(updated);
      setSelectedTenantForExtend(null);
    }
  };

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
          unitTerm: "Ruko",
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#7b1113]" />
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Daftar Penyewa (Tenants)
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-[#7b1113] border border-rose-200">
              {tenants.length} Penyewa Aktif
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Database penyewa aktif seluruh cabang kost, rumah kontrakan, slot parkir, unit ruko, dan sewa tanah.
          </p>
        </div>

        <button
          onClick={() => {
            handlePropSelectionForAdd(properties[0]?.id || "");
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#7b1113] hover:bg-[#630d0f] text-[#facc15] font-bold text-xs shadow-md transition flex items-center gap-2 self-start sm:self-auto cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 text-[#facc15]" />
          Tambah Penyewa Baru
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Cari nama penyewa, unit, kontak, properti..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7b1113] text-gray-800"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === "all"
                  ? "bg-[#7b1113] text-[#facc15] shadow-xs"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
            >
              Semua ({tenants.length})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "active"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Lunas / Aktif
            </button>
            <button
              onClick={() => setStatusFilter("due")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "due"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Jatuh Tempo
            </button>
            <button
              onClick={() => setStatusFilter("overdue")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "overdue"
                  ? "bg-rose-700 text-white shadow-xs"
                  : "bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Menunggak
            </button>
          </div>
        </div>

        {/* Sub filter property & category */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
          <span className="text-gray-400 font-semibold">Filter:</span>
          
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                categoryFilter === "all" ? "bg-[#7b1113] text-[#facc15]" : "text-gray-600"
              }`}
            >
              Semua Jenis
            </button>
            <button
              onClick={() => setCategoryFilter("kost")}
              className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                categoryFilter === "kost" ? "bg-[#7b1113] text-[#facc15]" : "text-gray-600"
              }`}
            >
              Kost
            </button>
            <button
              onClick={() => setCategoryFilter("rumah")}
              className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                categoryFilter === "rumah" ? "bg-indigo-900 text-white" : "text-gray-600"
              }`}
            >
              Rumah
            </button>
            <button
              onClick={() => setCategoryFilter("parkir")}
              className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                categoryFilter === "parkir" ? "bg-emerald-800 text-white" : "text-gray-600"
              }`}
            >
              Lot Parkir
            </button>
            <button
              onClick={() => setCategoryFilter("ruko")}
              className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                categoryFilter === "ruko" ? "bg-amber-900 text-amber-200" : "text-gray-600"
              }`}
            >
              Ruko
            </button>
            <button
              onClick={() => setCategoryFilter("tanah")}
              className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                categoryFilter === "tanah" ? "bg-teal-900 text-teal-200" : "text-gray-600"
              }`}
            >
              Sewa Tanah
            </button>
          </div>

          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium cursor-pointer"
          >
            <option value="all">Semua Lokasi Properti</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
              <th className="pb-3 px-3">Penyewa</th>
              <th className="pb-3 px-3">Unit / Slot / Kamar</th>
              <th className="pb-3 px-3">Status Tagihan</th>
              <th className="pb-3 px-3">Tarif Sewa</th>
              <th className="pb-3 px-3">Periode Kontrak</th>
              <th className="pb-3 px-3">Kontak WhatsApp</th>
              <th className="pb-3 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {filteredTenants.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  Tidak ditemukan data penyewa dengan filter ini.
                </td>
              </tr>
            ) : (
              filteredTenants.map((t) => {
                const cat = getPropertyCategory(t.propertyId);
                const badge = getCategoryBadge(cat);
                return (
                  <tr key={t.id} className="hover:bg-gray-50/80 transition">
                    {/* Tenant Info */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={t.avatar}
                          alt={t.name}
                          className="w-9 h-9 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                          <div className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5">
                            {t.name}
                          </div>
                          <div className="text-[11px] text-gray-400">{t.occupation}</div>
                        </div>
                      </div>
                    </td>

                    {/* Unit / Room & Property */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[#7b1113] bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-xs">
                          {t.roomNumber}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5 truncate max-w-[160px]">
                        {t.propertyName}
                      </div>
                    </td>

                    {/* Payment Status */}
                    <td className="py-3 px-3">
                      {t.paymentStatus === "active" ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Lunas
                        </span>
                      ) : t.paymentStatus === "due" ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" /> Jatuh Tempo
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" /> Menunggak
                        </span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-3 font-bold text-[#7b1113]">
                      {formatRupiah(t.monthlyPrice)}
                      <span className="text-[10px] text-gray-400 font-normal"> /bln</span>
                    </td>

                    {/* Contract Dates */}
                    <td className="py-3 px-3">
                      <div className="text-gray-800 font-medium">s/d {t.contractEndDate}</div>
                      <div className="text-[10px] text-gray-400">Masuk: {t.checkInDate}</div>
                    </td>

                    {/* Phone WhatsApp */}
                    <td className="py-3 px-3">
                      <a
                        href={`https://wa.me/${t.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `Halo Kak ${t.name}, salam dari pengelola ${t.propertyName}. Terkait unit sewa ${t.roomNumber}...`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                      >
                        <Phone className="w-3 h-3" />
                        {t.phone}
                      </a>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedTenantDetail(t)}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                          title="Lihat Detail Profil"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedTenantForEdit(t)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#7b1113] border border-rose-200 cursor-pointer"
                          title="Edit Data Penyewa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTenantForMove(t);
                            setTargetRoomNumber("");
                          }}
                          className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer"
                          title="Pindah Kamar / Unit"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedTenantForExtend(t)}
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 cursor-pointer"
                          title="Perpanjang Kontrak"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
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

      {/* MODAL: DETAIL PROFIL PENYEWA */}
      {selectedTenantDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#7b1113]" />
                <h3 className="font-extrabold text-base text-gray-900">Profil Penyewa</h3>
              </div>
              <button
                onClick={() => setSelectedTenantDetail(null)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <img
                  src={selectedTenantDetail.avatar}
                  alt={selectedTenantDetail.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#7b1113]"
                />
                <div>
                  <h4 className="font-black text-gray-900 text-base">{selectedTenantDetail.name}</h4>
                  <p className="text-gray-500">{selectedTenantDetail.occupation}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#7b1113] text-[#facc15]">
                    Unit {selectedTenantDetail.roomNumber} • {selectedTenantDetail.propertyName}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 block text-[10px]">Nomor KTP (NIK)</span>
                  <strong className="text-gray-800 font-mono">{selectedTenantDetail.idCardNumber}</strong>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 block text-[10px]">WhatsApp</span>
                  <strong className="text-gray-800">{selectedTenantDetail.phone}</strong>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 block text-[10px]">Tarif Sewa Bulanan</span>
                  <strong className="text-[#7b1113] font-bold">
                    {formatRupiah(selectedTenantDetail.monthlyPrice)}
                  </strong>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 block text-[10px]">Uang Jaminan (Deposit)</span>
                  <strong className="text-gray-800">
                    {formatRupiah(selectedTenantDetail.depositAmount)}
                  </strong>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 block text-[10px]">Tanggal Check-In</span>
                  <strong className="text-gray-800">{selectedTenantDetail.checkInDate}</strong>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 block text-[10px]">Akhir Kontrak</span>
                  <strong className="text-gray-800">{selectedTenantDetail.contractEndDate}</strong>
                </div>
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                <h5 className="font-bold text-[#7b1113] mb-1">Kontak Darurat (Emergency Contact)</h5>
                <p className="text-gray-700">
                  {selectedTenantDetail.emergencyContact.name} ({selectedTenantDetail.emergencyContact.relation}) -{" "}
                  <strong>{selectedTenantDetail.emergencyContact.phone}</strong>
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTenantDetail(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 cursor-pointer text-xs"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const t = selectedTenantDetail;
                    setSelectedTenantDetail(null);
                    setSelectedTenantForEdit(t);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#7b1113] hover:bg-[#630d0f] text-[#facc15] font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Data Penyewa Ini
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT DATA PENYEWA */}
      {selectedTenantForEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#7b1113]" />
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">Edit Data Penyewa</h3>
                  <p className="text-[11px] text-gray-500">
                    ID: {selectedTenantForEdit.id} • Unit {selectedTenantForEdit.roomNumber} ({selectedTenantForEdit.propertyName})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTenantForEdit(null)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4 text-xs">
              {/* Profil Utama */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                <h4 className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#7b1113]" />
                  Informasi Identitas & Pribadi
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Nama Lengkap Penyewa *</label>
                    <input
                      type="text"
                      required
                      value={selectedTenantForEdit.name}
                      onChange={(e) =>
                        setSelectedTenantForEdit({
                          ...selectedTenantForEdit,
                          name: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none font-bold text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Pekerjaan / Mahasiswa / Profesi</label>
                    <input
                      type="text"
                      value={selectedTenantForEdit.occupation}
                      onChange={(e) =>
                        setSelectedTenantForEdit({
                          ...selectedTenantForEdit,
                          occupation: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                      placeholder="Contoh: Software Engineer, Mahasiswa UI..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">No. WhatsApp *</label>
                    <input
                      type="text"
                      required
                      value={selectedTenantForEdit.phone}
                      onChange={(e) =>
                        setSelectedTenantForEdit({
                          ...selectedTenantForEdit,
                          phone: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Nomor KTP (NIK) *</label>
                    <input
                      type="text"
                      required
                      value={selectedTenantForEdit.idCardNumber}
                      onChange={(e) =>
                        setSelectedTenantForEdit({
                          ...selectedTenantForEdit,
                          idCardNumber: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Email</label>
                    <input
                      type="email"
                      value={selectedTenantForEdit.email}
                      onChange={(e) =>
                        setSelectedTenantForEdit({
                          ...selectedTenantForEdit,
                          email: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Penempatan Properti & Unit Sewa */}
              <div className="p-3 bg-rose-50/40 rounded-xl border border-rose-200/70 space-y-3">
                <h4 className="font-bold text-[#7b1113] text-xs flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#7b1113]" />
                  Alokasi Properti & Unit Sewa
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Properti Sewa *</label>
                    <select
                      value={selectedTenantForEdit.propertyId}
                      onChange={(e) => {
                        const newPId = e.target.value;
                        const pObj = properties.find((p) => p.id === newPId);
                        setSelectedTenantForEdit({
                          ...selectedTenantForEdit,
                          propertyId: newPId,
                          propertyName: pObj?.name || selectedTenantForEdit.propertyName,
                        });
                      }}
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none cursor-pointer"
                    >
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.category === "rumah" ? "Sewa Rumah" : p.category === "parkir" ? "Sewa Parkir" : "Kost"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">
                      Pilih {getCategoryBadge(getPropertyCategory(selectedTenantForEdit.propertyId)).unitTerm} (Combo Box) *
                    </label>
                    <RoomComboBox
                      rooms={rooms}
                      propertyId={selectedTenantForEdit.propertyId}
                      value={selectedTenantForEdit.roomNumber}
                      onChange={(val) =>
                        setSelectedTenantForEdit({
                          ...selectedTenantForEdit,
                          roomNumber: val,
                        })
                      }
                      onSelectRoom={(r) => {
                        setSelectedTenantForEdit({
                          ...selectedTenantForEdit,
                          roomNumber: r.roomNumber,
                          monthlyPrice: r.price,
                        });
                      }}
                      required={true}
                      category={getPropertyCategory(selectedTenantForEdit.propertyId)}
                      placeholder="Pilih atau cari kode unit..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Status Pembayaran / Tenant *</label>
                    <select
                      value={selectedTenantForEdit.paymentStatus}
                      onChange={(e) =>
                        setSelectedTenantForEdit({
                          ...selectedTenantForEdit,
                          paymentStatus: e.target.value as TenantStatus,
                        })
                      }
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none cursor-pointer font-bold"
                    >
                      <option value="active">🟢 Lunas / Aktif</option>
                      <option value="due">🟡 Jatuh Tempo (Due)</option>
                      <option value="overdue">🔴 Menunggak (Overdue)</option>
                      <option value="checkout">⚪ Selesai / Check-Out</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Tarif Sewa Bulanan (Rp) *</label>
                    <input
                      type="number"
                      required
                      value={selectedTenantForEdit.monthlyPrice}
                      onChange={(e) =>
                        setSelectedTenantForEdit({
                          ...selectedTenantForEdit,
                          monthlyPrice: Number(e.target.value),
                        })
                      }
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none font-bold text-[#7b1113]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Uang Deposit / Jaminan (Rp)</label>
                    <input
                      type="number"
                      value={selectedTenantForEdit.depositAmount}
                      onChange={(e) =>
                        setSelectedTenantForEdit({
                          ...selectedTenantForEdit,
                          depositAmount: Number(e.target.value),
                        })
                      }
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Tanggal Check-In (Masuk)</label>
                    <input
                      type="date"
                      value={selectedTenantForEdit.checkInDate}
                      onChange={(e) =>
                        setSelectedTenantForEdit({
                          ...selectedTenantForEdit,
                          checkInDate: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Tanggal Akhir Kontrak</label>
                    <input
                      type="date"
                      value={selectedTenantForEdit.contractEndDate}
                      onChange={(e) =>
                        setSelectedTenantForEdit({
                          ...selectedTenantForEdit,
                          contractEndDate: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Kontak Darurat */}
              <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/70 space-y-3">
                <h4 className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-700" />
                  Kontak Darurat (Emergency Contact)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Nama Kontak Darurat</label>
                    <input
                      type="text"
                      value={selectedTenantForEdit.emergencyContact.name}
                      onChange={(e) =>
                        setSelectedTenantForEdit({
                          ...selectedTenantForEdit,
                          emergencyContact: {
                            ...selectedTenantForEdit.emergencyContact,
                            name: e.target.value,
                          },
                        })
                      }
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Hubungan / Relasi</label>
                    <input
                      type="text"
                      value={selectedTenantForEdit.emergencyContact.relation}
                      onChange={(e) =>
                        setSelectedTenantForEdit({
                          ...selectedTenantForEdit,
                          emergencyContact: {
                            ...selectedTenantForEdit.emergencyContact,
                            relation: e.target.value,
                          },
                        })
                      }
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                      placeholder="Orang Tua / Pasangan / Saudara"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">No. HP Darurat</label>
                    <input
                      type="text"
                      value={selectedTenantForEdit.emergencyContact.phone}
                      onChange={(e) =>
                        setSelectedTenantForEdit({
                          ...selectedTenantForEdit,
                          emergencyContact: {
                            ...selectedTenantForEdit.emergencyContact,
                            phone: e.target.value,
                          },
                        })
                      }
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Catatan Tambahan */}
              <div>
                <label className="font-bold text-gray-700 block mb-1">Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  value={selectedTenantForEdit.notes || ""}
                  onChange={(e) =>
                    setSelectedTenantForEdit({
                      ...selectedTenantForEdit,
                      notes: e.target.value,
                    })
                  }
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  placeholder="Catatan khusus, preferensi parkir, pembayaran split, dll..."
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTenantForEdit(null)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#7b1113] hover:bg-[#630d0f] text-[#facc15] font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Simpan Perubahan Data Penyewa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PINDAH UNIT / KAMAR */}
      {selectedTenantForMove && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-[#7b1113]" />
                <h3 className="font-extrabold text-base text-gray-900">Pindah Unit / Kamar Sewa</h3>
              </div>
              <button
                onClick={() => setSelectedTenantForMove(null)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMoveRoom} className="mt-4 space-y-3.5 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-gray-400 block text-[11px]">Penyewa:</span>
                <strong className="text-gray-800 text-sm">{selectedTenantForMove.name}</strong>
                <div className="text-gray-500 mt-1">
                  Unit Saat Ini: <span className="font-bold text-[#7b1113]">{selectedTenantForMove.roomNumber}</span> ({selectedTenantForMove.propertyName})
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Pilih {getCategoryBadge(getPropertyCategory(selectedTenantForMove.propertyId)).unitTerm} Tujuan (Combo Box) *
                </label>
                <RoomComboBox
                  rooms={rooms}
                  propertyId={selectedTenantForMove.propertyId}
                  value={targetRoomNumber}
                  onChange={(val) => setTargetRoomNumber(val)}
                  filterAvailableOnly={true}
                  required={true}
                  category={getPropertyCategory(selectedTenantForMove.propertyId)}
                  placeholder="Pilih Unit / Kamar Kosong..."
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTenantForMove(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#7b1113] hover:bg-[#630d0f] text-[#facc15] font-bold shadow-sm cursor-pointer"
                >
                  Konfirmasi Pindah Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PERPANJANG KONTRAK */}
      {selectedTenantForExtend && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-base text-gray-900">Perpanjang Kontrak Sewa</h3>
              </div>
              <button
                onClick={() => setSelectedTenantForExtend(null)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExtendContract} className="mt-4 space-y-3.5 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-gray-400 block text-[11px]">Penyewa:</span>
                <strong className="text-gray-800 text-sm">{selectedTenantForExtend.name}</strong>
                <div className="text-gray-500 mt-1">
                  Unit {selectedTenantForExtend.roomNumber} • Kontrak saat ini berakhir:{" "}
                  <strong className="text-[#7b1113]">{selectedTenantForExtend.contractEndDate}</strong>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Durasi Perpanjangan *</label>
                <select
                  value={extendMonths}
                  onChange={(e) => setExtendMonths(Number(e.target.value))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                >
                  <option value={3}>3 Bulan (Triwulan)</option>
                  <option value={6}>6 Bulan (Semester)</option>
                  <option value={12}>12 Bulan (1 Tahun Penuh)</option>
                  <option value={24}>24 Bulan (2 Tahun)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTenantForExtend(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#7b1113] hover:bg-[#630d0f] text-[#facc15] font-bold shadow-sm cursor-pointer"
                >
                  Perpanjang Kontrak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH PENYEWA BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#7b1113]" />
                <h3 className="font-extrabold text-base text-gray-900">Registrasi Penyewa Baru</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Nama Lengkap Penyewa *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Raden Surya Atmaja"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Pilih Properti Sewa *</label>
                  <select
                    value={newPropId}
                    onChange={(e) => handlePropSelectionForAdd(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.category === "rumah" ? "Sewa Rumah" : p.category === "parkir" ? "Sewa Parkir" : "Kost"})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Pilih {getCategoryBadge(getPropertyCategory(newPropId)).unitTerm} (Combo Box) *
                  </label>
                  <RoomComboBox
                    rooms={rooms}
                    propertyId={newPropId}
                    value={newRoomNumber}
                    onChange={(val) => setNewRoomNumber(val)}
                    onSelectRoom={(room) => {
                      setNewMonthlyPrice(room.price);
                      setNewDeposit(room.price);
                    }}
                    required={true}
                    category={getPropertyCategory(newPropId)}
                    placeholder="Pilih atau cari kode unit..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">No. WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Nomor KTP (NIK) *</label>
                  <input
                    type="text"
                    required
                    value={newIdCard}
                    onChange={(e) => setNewIdCard(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Tarif Sewa Bulanan (Rp)</label>
                  <input
                    type="number"
                    value={newMonthlyPrice}
                    onChange={(e) => setNewMonthlyPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Uang Deposit (Rp)</label>
                  <input
                    type="number"
                    value={newDeposit}
                    onChange={(e) => setNewDeposit(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Tanggal Masuk (Check-in)</label>
                  <input
                    type="date"
                    value={newCheckInDate}
                    onChange={(e) => setNewCheckInDate(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Akhir Kontrak</label>
                  <input
                    type="date"
                    value={newContractEndDate}
                    onChange={(e) => setNewContractEndDate(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#7b1113] hover:bg-[#630d0f] text-[#facc15] font-bold shadow-sm cursor-pointer"
                >
                  Simpan Data Penyewa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
