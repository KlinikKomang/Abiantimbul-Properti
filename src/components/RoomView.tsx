import React from "react";
import {
  DoorOpen,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Wrench,
  User,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Zap,
  Sparkles,
  X,
  Building2,
  Home,
  Car,
  Layers,
  Store,
  Trees,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowUpAZ,
  ArrowDownAZ,
  ArrowUp10,
  ArrowDown10,
  AlertTriangle,
} from "lucide-react";
import { Room, RoomStatus, RoomType, Property, Tenant, PropertyCategory } from "../types";
import { formatRupiah } from "../data/mockData";

export type RoomSortField = "roomNumber" | "propertyName" | "price" | "status" | "floor" | "type";
export type SortDirection = "asc" | "desc";

interface RoomViewProps {
  rooms: Room[];
  properties: Property[];
  tenants?: Tenant[];
  selectedPropertyId: string;
  onUpdateRoom: (room: Room) => void;
  onAddRoom: (room: Room) => void;
  onDeleteRoom?: (roomId: string) => void;
  onSelectTenant?: (tenantId: string) => void;
}

export const RoomView: React.FC<RoomViewProps> = ({
  rooms,
  properties,
  tenants = [],
  selectedPropertyId,
  onUpdateRoom,
  onAddRoom,
  onDeleteRoom,
  onSelectTenant,
}) => {
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [propertyFilter, setPropertyFilter] = React.useState<string>(selectedPropertyId);
  const [categoryFilter, setCategoryFilter] = React.useState<"all" | PropertyCategory>("all");
  const [floorFilter, setFloorFilter] = React.useState<string>("all");

  // Sorting State
  const [sortField, setSortField] = React.useState<RoomSortField>("roomNumber");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc");

  const [selectedRoomForEdit, setSelectedRoomForEdit] = React.useState<Room | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [selectedRoomForDetail, setSelectedRoomForDetail] = React.useState<Room | null>(null);
  const [roomToDelete, setRoomToDelete] = React.useState<Room | null>(null);

  const handleConfirmDelete = () => {
    if (roomToDelete && onDeleteRoom) {
      onDeleteRoom(roomToDelete.id);
      setRoomToDelete(null);
      if (selectedRoomForEdit?.id === roomToDelete.id) {
        setSelectedRoomForEdit(null);
      }
      if (selectedRoomForDetail?.id === roomToDelete.id) {
        setSelectedRoomForDetail(null);
      }
    }
  };

  // New room state
  const [newPropId, setNewPropId] = React.useState(properties[0]?.id || "");
  const [newRoomNumber, setNewRoomNumber] = React.useState("");
  const [newFloor, setNewFloor] = React.useState(1);
  const [newType, setNewType] = React.useState<string>("Standard");
  const [newStatus, setNewStatus] = React.useState<RoomStatus>("available");
  const [newPrice, setNewPrice] = React.useState(0);
  const [newSize, setNewSize] = React.useState("4 x 4 m");

  // Keep property filter in sync if changed from top header
  React.useEffect(() => {
    setPropertyFilter(selectedPropertyId);
  }, [selectedPropertyId]);

  // When selected property in Add Modal changes, adapt the defaults
  const handleAddPropSelectChange = (propId: string) => {
    setNewPropId(propId);
    const prop = properties.find((p) => p.id === propId);
    const cat = prop?.category || "kost";

    if (cat === "rumah") {
      setNewRoomNumber(`Unit Rumah 0${(rooms.filter(r => r.propertyId === propId).length + 1)}`);
      setNewType("Rumah 2 Lantai");
      setNewPrice(4500000);
      setNewSize("70 / 120 m²");
      setNewFloor(1);
    } else if (cat === "parkir") {
      setNewRoomNumber(`Slot Mobil P-0${(rooms.filter(r => r.propertyId === propId).length + 1)}`);
      setNewType("Slot Mobil");
      setNewPrice(1500000);
      setNewSize("2.5 x 5.0 m");
      setNewFloor(1);
    } else if (cat === "ruko") {
      setNewRoomNumber(`Ruko Blok A-0${(rooms.filter(r => r.propertyId === propId).length + 1)}`);
      setNewType("Ruko 2 Lantai");
      setNewPrice(5500000);
      setNewSize("5 x 15 m (2 Lt)");
      setNewFloor(1);
    } else if (cat === "tanah") {
      setNewRoomNumber(`Kavling T-0${(rooms.filter(r => r.propertyId === propId).length + 1)}`);
      setNewType("Lahan Komersial / Usaha");
      setNewPrice(3000000);
      setNewSize("10 x 25 m (250 m²)");
      setNewFloor(1);
    } else {
      setNewRoomNumber(`B-${Math.floor(Math.random() * 3 + 1)}0${(rooms.filter(r => r.propertyId === propId).length + 1)}`);
      setNewType("Standard");
      setNewPrice(2500000);
      setNewSize("4 x 4 m");
      setNewFloor(1);
    }
  };

  const getPropertyCategory = (propertyId: string): PropertyCategory => {
    const p = properties.find((item) => item.id === propertyId);
    return p?.category || "kost";
  };

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.tenantName && r.tenantName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesProperty = propertyFilter === "all" || r.propertyId === propertyFilter;
    const matchesFloor = floorFilter === "all" || r.floor.toString() === floorFilter;

    const propCategory = getPropertyCategory(r.propertyId);
    const matchesCategory = categoryFilter === "all" || propCategory === categoryFilter;

    return matchesSearch && matchesStatus && matchesProperty && matchesFloor && matchesCategory;
  });

  // Natural alphanumeric & multi-field sorting
  const sortedRooms = React.useMemo(() => {
    const list = [...filteredRooms];
    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === "roomNumber") {
        // Natural alphanumeric sort (e.g. A-1, A-2, A-10, Unit 1, Slot P-01)
        comparison = a.roomNumber.localeCompare(b.roomNumber, undefined, {
          numeric: true,
          sensitivity: "base",
        });
      } else if (sortField === "propertyName") {
        comparison = a.propertyName.localeCompare(b.propertyName);
      } else if (sortField === "price") {
        comparison = a.price - b.price;
      } else if (sortField === "floor") {
        comparison = a.floor - b.floor;
      } else if (sortField === "status") {
        comparison = a.status.localeCompare(b.status);
      } else if (sortField === "type") {
        comparison = a.type.localeCompare(b.type);
      }

      // Secondary sort by room number if primary sort values are equal
      if (comparison === 0 && sortField !== "roomNumber") {
        comparison = a.roomNumber.localeCompare(b.roomNumber, undefined, {
          numeric: true,
          sensitivity: "base",
        });
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
    return list;
  }, [filteredRooms, sortField, sortDirection]);

  const handleToggleSort = (field: RoomSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const targetProp = properties.find((p) => p.id === newPropId);
    const cat = targetProp?.category || "kost";

    const facilities =
      cat === "rumah"
        ? ["2-3 Kamar Tidur", "Carport Mobil", "Dapur Pribadi", "Taman Belakang", "Listrik PLN", "Air PDAM"]
        : cat === "parkir"
        ? ["Kanopi Atap Baja", "Akses Barrier Gate RFID", "CCTV Depan Slot", "Penerangan LED"]
        : cat === "ruko"
        ? ["Daya Listrik 3500W", "Rolling Door Besi", "Toilet di Setiap Lantai", "Area Parkir Depan", "Air PDAM"]
        : cat === "tanah"
        ? ["Akses Jalan Truk/Tronton", "Pagar Keliling Lahan", "Dekat Jalur Listrik PLN", "Tanah Padat/Keras", "Bebas Banjir"]
        : ["AC", "WiFi", "Kamar Mandi Dalam", "Springbed", "Lemari Pakaian"];

    const newRoom: Room = {
      id: `rm-${Date.now()}`,
      propertyId: newPropId,
      propertyName: targetProp?.name || "Properti Sewa",
      roomNumber: newRoomNumber,
      floor: Number(newFloor),
      type: newType as RoomType,
      status: newStatus,
      price: Number(newPrice),
      facilities,
      size: newSize,
      lastCleanedDate: new Date().toISOString().split("T")[0],
    };

    onAddRoom(newRoom);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoomForEdit) {
      onUpdateRoom(selectedRoomForEdit);
      setSelectedRoomForEdit(null);
    }
  };

  const handleQuickStatusChange = (room: Room, newStatus: RoomStatus) => {
    const updated = { ...room, status: newStatus };
    if (newStatus === "available") {
      updated.tenantId = undefined;
      updated.tenantName = undefined;
    }
    onUpdateRoom(updated);
  };

  const getCategoryBadgeInfo = (category: PropertyCategory) => {
    switch (category) {
      case "rumah":
        return {
          label: "Rumah",
          icon: <Home className="w-3 h-3 text-indigo-600" />,
          color: "bg-indigo-50 text-indigo-800 border-indigo-200",
          unitTerm: "Unit Rumah",
        };
      case "parkir":
        return {
          label: "Parkir",
          icon: <Car className="w-3 h-3 text-emerald-600" />,
          color: "bg-emerald-50 text-emerald-800 border-emerald-200",
          unitTerm: "Slot Parkir",
        };
      case "ruko":
        return {
          label: "Ruko",
          icon: <Store className="w-3 h-3 text-amber-700" />,
          color: "bg-amber-50 text-amber-900 border-amber-200",
          unitTerm: "Unit Ruko",
        };
      case "tanah":
        return {
          label: "Sewa Tanah",
          icon: <Trees className="w-3 h-3 text-teal-700" />,
          color: "bg-teal-50 text-teal-900 border-teal-200",
          unitTerm: "Kavling Tanah",
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
              Manajemen Kamar, Unit & Slot Sewa
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Daftar seluruh kamar kost, unit sewa rumah, lot parkir, unit ruko, dan kavling sewa tanah dengan status okupansi, tarif, serta pemeliharaan.
          </p>
        </div>

        <button
          onClick={() => {
            handleAddPropSelectChange(properties[0]?.id || "");
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#7b1113] hover:bg-[#630d0f] text-[#facc15] font-bold text-xs shadow-md transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#facc15]" />
          Tambah Unit / Kamar / Slot
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Cari nomor unit / nama penyewa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7b1113] text-gray-800"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>

          {/* Quick Filter Status Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === "all"
                  ? "bg-[#7b1113] text-[#facc15] shadow-xs"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
            >
              Semua ({rooms.length})
            </button>
            <button
              onClick={() => setStatusFilter("occupied")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "occupied"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Occupied (🟢 Terisi)
            </button>
            <button
              onClick={() => setStatusFilter("available")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "available"
                  ? "bg-gray-700 text-white shadow-xs"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              Available (⚪ Kosong)
            </button>
            <button
              onClick={() => setStatusFilter("maintenance")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "maintenance"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Maintenance (🟠 Perbaikan)
            </button>
          </div>

          {/* Table vs Grid switch */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === "table" ? "bg-white shadow-xs text-[#7b1113]" : "text-gray-500"
              }`}
              title="Tampilan Tabel"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === "grid" ? "bg-white shadow-xs text-[#7b1113]" : "text-gray-500"
              }`}
              title="Tampilan Grid Kartu"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Property & Category & Floor sub-dropdown filters + SORTING TOOLBAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-gray-400 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Filter:
            </span>

            {/* Category filter pills */}
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition ${
                  categoryFilter === "all" ? "bg-[#7b1113] text-[#facc15]" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Semua Jenis
              </button>
              <button
                onClick={() => setCategoryFilter("kost")}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition ${
                  categoryFilter === "kost" ? "bg-[#7b1113] text-[#facc15]" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Kost
              </button>
              <button
                onClick={() => setCategoryFilter("rumah")}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition ${
                  categoryFilter === "rumah" ? "bg-indigo-900 text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Rumah
              </button>
              <button
                onClick={() => setCategoryFilter("parkir")}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition ${
                  categoryFilter === "parkir" ? "bg-emerald-800 text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Lot Parkir
              </button>
              <button
                onClick={() => setCategoryFilter("ruko")}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition ${
                  categoryFilter === "ruko" ? "bg-amber-900 text-amber-200" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Ruko
              </button>
              <button
                onClick={() => setCategoryFilter("tanah")}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition ${
                  categoryFilter === "tanah" ? "bg-teal-900 text-teal-200" : "text-gray-600 hover:text-gray-900"
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
                  {p.name} ({p.category === "rumah" ? "Rumah" : p.category === "parkir" ? "Parkir" : p.category === "ruko" ? "Ruko" : p.category === "tanah" ? "Tanah" : "Kost"})
                </option>
              ))}
            </select>

            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium cursor-pointer"
            >
              <option value="all">Semua Lantai / Posisi</option>
              <option value="1">Lantai 1 / Ground</option>
              <option value="2">Lantai 2</option>
              <option value="3">Lantai 3</option>
            </select>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-1.5 bg-rose-50/60 p-1 rounded-xl border border-rose-200/70 text-xs">
            <span className="text-[#7b1113] font-bold px-1.5 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Urutkan:
            </span>

            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as RoomSortField)}
              className="px-2 py-1 bg-white border border-rose-200 rounded-lg text-[#7b1113] font-bold focus:outline-none cursor-pointer"
            >
              <option value="roomNumber">Kode Unit / Kamar / Slot</option>
              <option value="price">Tarif Sewa</option>
              <option value="floor">Lantai / Posisi</option>
              <option value="propertyName">Nama Properti</option>
              <option value="status">Status Okupansi</option>
              <option value="type">Tipe Unit</option>
            </select>

            {/* Ascending / Descending Toggle Button */}
            <button
              onClick={() => setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-extrabold transition cursor-pointer ${
                sortDirection === "asc"
                  ? "bg-[#7b1113] text-[#facc15] shadow-xs"
                  : "bg-white text-[#7b1113] border border-rose-200 hover:bg-rose-100"
              }`}
              title={sortDirection === "asc" ? "Urutan: Ascending (A-Z / 1-9 / Rendah ke Tinggi)" : "Urutan: Descending (Z-A / 9-1 / Tinggi ke Rendah)"}
            >
              {sortDirection === "asc" ? (
                <>
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Asc (A-Z)</span>
                </>
              ) : (
                <>
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span>Desc (Z-A)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === "table" ? (
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider select-none">
                {/* Clickable Unit / Room Sort Header */}
                <th
                  onClick={() => handleToggleSort("roomNumber")}
                  className={`pb-3 px-3 cursor-pointer hover:text-[#7b1113] transition group ${
                    sortField === "roomNumber" ? "text-[#7b1113]" : ""
                  }`}
                  title="Klik untuk mengubah urutan Kode Unit (A-Z / Z-A)"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Unit / Slot / Kamar</span>
                    {sortField === "roomNumber" ? (
                      sortDirection === "asc" ? (
                        <span className="px-1.5 py-0.5 rounded bg-rose-100 text-[#7b1113] text-[10px] font-extrabold flex items-center gap-0.5">
                          <ArrowUp className="w-3 h-3" /> Asc
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-rose-100 text-[#7b1113] text-[10px] font-extrabold flex items-center gap-0.5">
                          <ArrowDown className="w-3 h-3" /> Desc
                        </span>
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-50 group-hover:opacity-100" />
                    )}
                  </div>
                </th>

                {/* Clickable Property Sort Header */}
                <th
                  onClick={() => handleToggleSort("propertyName")}
                  className={`pb-3 px-3 cursor-pointer hover:text-[#7b1113] transition group ${
                    sortField === "propertyName" ? "text-[#7b1113]" : ""
                  }`}
                  title="Klik untuk mengurutkan berdasarkan Properti"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Properti & Kategori</span>
                    {sortField === "propertyName" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="w-3 h-3 text-[#7b1113]" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-[#7b1113]" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-30 group-hover:opacity-100" />
                    )}
                  </div>
                </th>

                {/* Clickable Type Sort Header */}
                <th
                  onClick={() => handleToggleSort("type")}
                  className={`pb-3 px-3 cursor-pointer hover:text-[#7b1113] transition group ${
                    sortField === "type" ? "text-[#7b1113]" : ""
                  }`}
                  title="Klik untuk mengurutkan berdasarkan Tipe"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Tipe & Spesifikasi</span>
                    {sortField === "type" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="w-3 h-3 text-[#7b1113]" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-[#7b1113]" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-30 group-hover:opacity-100" />
                    )}
                  </div>
                </th>

                {/* Clickable Status Sort Header */}
                <th
                  onClick={() => handleToggleSort("status")}
                  className={`pb-3 px-3 cursor-pointer hover:text-[#7b1113] transition group ${
                    sortField === "status" ? "text-[#7b1113]" : ""
                  }`}
                  title="Klik untuk mengurutkan berdasarkan Status Okupansi"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    {sortField === "status" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="w-3 h-3 text-[#7b1113]" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-[#7b1113]" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-30 group-hover:opacity-100" />
                    )}
                  </div>
                </th>

                <th className="pb-3 px-3">Penyewa (Tenant)</th>

                {/* Clickable Price Sort Header */}
                <th
                  onClick={() => handleToggleSort("price")}
                  className={`pb-3 px-3 cursor-pointer hover:text-[#7b1113] transition group ${
                    sortField === "price" ? "text-[#7b1113]" : ""
                  }`}
                  title="Klik untuk mengurutkan berdasarkan Tarif Sewa"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Tarif Sewa</span>
                    {sortField === "price" ? (
                      sortDirection === "asc" ? (
                        <span className="px-1.5 py-0.5 rounded bg-rose-100 text-[#7b1113] text-[10px] font-extrabold flex items-center gap-0.5">
                          <ArrowUp className="w-3 h-3" /> Termurah
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-rose-100 text-[#7b1113] text-[10px] font-extrabold flex items-center gap-0.5">
                          <ArrowDown className="w-3 h-3" /> Termahal
                        </span>
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-30 group-hover:opacity-100" />
                    )}
                  </div>
                </th>

                <th className="pb-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {sortedRooms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    Tidak ditemukan data unit/kamar/slot dengan kriteria pencarian ini.
                  </td>
                </tr>
              ) : (
                sortedRooms.map((room) => {
                  const cat = getPropertyCategory(room.propertyId);
                  const badge = getCategoryBadgeInfo(cat);
                  return (
                    <tr key={room.id} className="hover:bg-gray-50/80 transition">
                      {/* Unit / Room */}
                      <td className="py-3 px-3 font-extrabold text-gray-900 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-gray-100 font-mono text-[#7b1113] border border-gray-200 shadow-2xs font-black">
                            {room.roomNumber}
                          </span>
                          <button
                            onClick={() => setSelectedRoomForEdit(room)}
                            className="p-1 rounded text-gray-400 hover:text-[#7b1113] hover:bg-rose-50 transition cursor-pointer"
                            title="Edit Kode Unit Ini"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Property & Category */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                          <span>{room.propertyName}</span>
                        </div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span>• {cat === "parkir" ? "Area Terpadu" : `Lantai ${room.floor}`}</span>
                        </div>
                      </td>

                      {/* Type & Size */}
                      <td className="py-3 px-3">
                        <span className="font-medium text-gray-700 px-2 py-0.5 rounded bg-gray-100">
                          {room.type}
                        </span>
                        <div className="text-[11px] text-gray-400 mt-0.5">Ukuran: {room.size}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        {room.status === "occupied" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Occupied (🟢 Terisi)
                          </span>
                        ) : room.status === "available" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                            <span className="w-2 h-2 rounded-full bg-gray-400" />
                            Available (⚪ Kosong)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            Maintenance (🟠 Perbaikan)
                          </span>
                        )}
                      </td>

                      {/* Tenant */}
                      <td className="py-3 px-3">
                        {room.tenantName ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#7b1113]/10 text-[#7b1113] flex items-center justify-center font-bold text-[10px]">
                              {room.tenantName[0]}
                            </div>
                            <span className="font-bold text-gray-900">{room.tenantName}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">- Siap Disewa -</span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3 font-bold text-[#7b1113]">
                        {formatRupiah(room.price)}
                        <span className="text-[10px] text-gray-400 font-normal"> /bln</span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedRoomForDetail(room)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                            title="Lihat Detail"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedRoomForEdit(room)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#7b1113] border border-rose-200 cursor-pointer flex items-center gap-1 font-bold text-[11px]"
                            title="Edit Kode & Detail Unit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          {onDeleteRoom && (
                            <button
                              onClick={() => setRoomToDelete(room)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 cursor-pointer flex items-center gap-1 font-bold text-[11px] transition"
                              title="Hapus Unit / Kamar / Slot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Hapus</span>
                            </button>
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
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedRooms.map((room) => {
            const cat = getPropertyCategory(room.propertyId);
            const badge = getCategoryBadgeInfo(cat);
            return (
              <div
                key={room.id}
                className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-3 group hover:border-[#7b1113]/30"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-lg bg-gray-100 font-mono font-black text-sm text-[#7b1113] border border-gray-200">
                        {room.roomNumber}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    {room.status === "occupied" ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" title="Terisi" />
                    ) : room.status === "available" ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-300 ring-4 ring-gray-100" title="Kosong" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-100" title="Perbaikan" />
                    )}
                  </div>

                  <div className="mt-2 text-xs space-y-1">
                    <div className="font-bold text-gray-900 truncate">{room.propertyName}</div>
                    <div className="text-gray-400 text-[11px]">
                      {room.type} • {room.size}
                    </div>
                  </div>

                  <div className="mt-3 p-2 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                    <span className="text-gray-400 text-[10px] block">Penyewa Aktif:</span>
                    {room.tenantName ? (
                      <strong className="text-gray-900 font-bold truncate block">{room.tenantName}</strong>
                    ) : (
                      <span className="text-gray-400 italic">Belum Ada Penyewa</span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Tarif Sewa:</span>
                    <strong className="text-xs font-black text-[#7b1113]">{formatRupiah(room.price)}</strong>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedRoomForDetail(room)}
                      className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer"
                      title="Detail"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSelectedRoomForEdit(room)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#7b1113] cursor-pointer flex items-center gap-1 font-bold text-[11px] px-2"
                      title="Edit Kode & Detail Unit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    {onDeleteRoom && (
                      <button
                        onClick={() => setRoomToDelete(room)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 cursor-pointer flex items-center gap-1 font-bold text-[11px] px-2 transition"
                        title="Hapus Unit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: TAMBAH UNIT / KAMAR / SLOT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <DoorOpen className="w-5 h-5 text-[#7b1113]" />
                <h3 className="font-extrabold text-base text-gray-900">Tambah Unit / Kamar / Slot</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Pilih Properti Tujuan *</label>
                <select
                  value={newPropId}
                  onChange={(e) => handleAddPropSelectChange(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category === "rumah" ? "Sewa Rumah" : p.category === "parkir" ? "Sewa Parkir" : p.category === "ruko" ? "Ruko" : p.category === "tanah" ? "Sewa Tanah" : "Kost"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    {getPropertyCategory(newPropId) === "rumah"
                      ? "Nama / Nomor Unit Rumah"
                      : getPropertyCategory(newPropId) === "parkir"
                      ? "Kode Slot Parkir"
                      : getPropertyCategory(newPropId) === "ruko"
                      ? "Nomor / Blok Unit Ruko"
                      : getPropertyCategory(newPropId) === "tanah"
                      ? "Nomor / Kode Kavling Tanah"
                      : "Nomor Kamar Kost"}
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    {getPropertyCategory(newPropId) === "parkir" || getPropertyCategory(newPropId) === "tanah" ? "Zona / Blok" : "Lantai"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newFloor}
                    onChange={(e) => setNewFloor(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Tipe Unit</label>
                  {getPropertyCategory(newPropId) === "rumah" ? (
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                    >
                      <option value="Rumah 1 Lantai">Rumah 1 Lantai</option>
                      <option value="Rumah 2 Lantai">Rumah 2 Lantai</option>
                      <option value="Townhouse / Cluster">Townhouse / Cluster</option>
                    </select>
                  ) : getPropertyCategory(newPropId) === "parkir" ? (
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                    >
                      <option value="Slot Mobil">Slot Mobil (Kanopi)</option>
                      <option value="Slot Motor">Slot Motor</option>
                      <option value="Slot VIP">Slot VIP Tertutup</option>
                    </select>
                  ) : getPropertyCategory(newPropId) === "ruko" ? (
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                    >
                      <option value="Ruko 1 Lantai">Ruko 1 Lantai</option>
                      <option value="Ruko 2 Lantai">Ruko 2 Lantai</option>
                      <option value="Ruko 3 Lantai">Ruko 3 Lantai</option>
                      <option value="Ruko Gandeng / Sudut">Ruko Gandeng / Sudut</option>
                      <option value="Kios Komersial">Kios Komersial</option>
                    </select>
                  ) : getPropertyCategory(newPropId) === "tanah" ? (
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                    >
                      <option value="Lahan Komersial / Usaha">Lahan Komersial / Usaha</option>
                      <option value="Kavling Siap Bangun">Kavling Siap Bangun</option>
                      <option value="Lahan Terbuka / Gudang">Lahan Terbuka / Gudang</option>
                      <option value="Lahan Pertanian / Kebun">Lahan Pertanian / Kebun</option>
                      <option value="Lahan Parkir / Pool">Lahan Parkir / Pool</option>
                    </select>
                  ) : (
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Deluxe">Deluxe</option>
                      <option value="VIP Suite">VIP Suite</option>
                      <option value="Executive Studio">Executive Studio</option>
                    </select>
                  )}
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Status Awal</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as RoomStatus)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  >
                    <option value="available">⚪ Available (Kosong)</option>
                    <option value="occupied">🟢 Occupied (Terisi)</option>
                    <option value="maintenance">🟠 Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Tarif Sewa per Bulan (Rp)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Dimensi / Ukuran</label>
                  <input
                    type="text"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
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
                  Simpan Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL UNIT */}
      {selectedRoomForDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <DoorOpen className="w-5 h-5 text-[#7b1113]" />
                <h3 className="font-extrabold text-base text-gray-900">
                  Detail {selectedRoomForDetail.roomNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRoomForDetail(null)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Lokasi Properti:</span>
                  <strong className="text-gray-900">{selectedRoomForDetail.propertyName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tipe & Ukuran:</span>
                  <strong className="text-gray-900">
                    {selectedRoomForDetail.type} ({selectedRoomForDetail.size})
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tarif Bulanan:</span>
                  <strong className="text-[#7b1113] font-black">
                    {formatRupiah(selectedRoomForDetail.price)} / bulan
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Meteran Listrik / Identitas:</span>
                  <strong className="text-gray-800 font-mono">
                    {selectedRoomForDetail.electricityMeter || "N/A"}
                  </strong>
                </div>
              </div>

              <div>
                <span className="text-gray-500 block mb-1 font-bold">Fasilitas Unit:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedRoomForDetail.facilities.map((f, i) => (
                    <span key={i} className="px-2 py-0.5 bg-rose-50 text-[#7b1113] border border-rose-200 rounded text-[10px] font-semibold">
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                <span className="text-gray-500 block text-[10px]">Penyewa Saat Ini:</span>
                {selectedRoomForDetail.tenantName ? (
                  <div className="font-bold text-gray-900 text-sm mt-0.5">
                    {selectedRoomForDetail.tenantName}
                  </div>
                ) : (
                  <span className="text-emerald-700 font-bold">Unit Kosong (Siap Disewa)</span>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  {onDeleteRoom && (
                    <button
                      type="button"
                      onClick={() => {
                        setRoomToDelete(selectedRoomForDetail);
                      }}
                      className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold border border-red-200 cursor-pointer flex items-center gap-1.5 text-xs transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Unit</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedRoomForDetail(null)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 cursor-pointer"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRoomForEdit(selectedRoomForDetail);
                      setSelectedRoomForDetail(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#7b1113] hover:bg-[#630d0f] text-[#facc15] font-bold cursor-pointer"
                  >
                    Edit Unit Ini
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT UNIT */}
      {selectedRoomForEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <DoorOpen className="w-5 h-5 text-[#7b1113]" />
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">
                    Edit Data Unit & Kode
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {selectedRoomForEdit.propertyName} • {getPropertyCategory(selectedRoomForEdit.propertyId) === "rumah" ? "Sewa Rumah" : getPropertyCategory(selectedRoomForEdit.propertyId) === "parkir" ? "Sewa Parkir" : getPropertyCategory(selectedRoomForEdit.propertyId) === "ruko" ? "Ruko" : getPropertyCategory(selectedRoomForEdit.propertyId) === "tanah" ? "Sewa Tanah" : "Kost"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRoomForEdit(null)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3.5 text-xs">
              {/* Kode / Nomor Unit / Slot / Kamar Input */}
              <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 space-y-1">
                <label className="font-extrabold text-[#7b1113] block">
                  {getPropertyCategory(selectedRoomForEdit.propertyId) === "rumah"
                    ? "Kode / Nomor Unit Rumah"
                    : getPropertyCategory(selectedRoomForEdit.propertyId) === "parkir"
                    ? "Kode Slot Parkir"
                    : getPropertyCategory(selectedRoomForEdit.propertyId) === "ruko"
                    ? "Nomor / Blok Unit Ruko"
                    : getPropertyCategory(selectedRoomForEdit.propertyId) === "tanah"
                    ? "Nomor / Kode Kavling Tanah"
                    : "Nomor / Kode Kamar Kost"}{" "}
                  *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={selectedRoomForEdit.roomNumber}
                    onChange={(e) =>
                      setSelectedRoomForEdit({
                        ...selectedRoomForEdit,
                        roomNumber: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-white border-2 border-rose-300 focus:border-[#7b1113] rounded-xl focus:ring-2 focus:ring-[#7b1113]/20 focus:outline-none font-mono font-black text-gray-900 text-sm tracking-wider"
                    placeholder="Contoh: A-101, Unit 02, Slot P-05..."
                  />
                </div>
                <span className="text-[10px] text-gray-500 block">
                  Perubahan kode unit otomatis memperbarui data kontrak, riwayat tagihan, dan tiket perbaikan terkait.
                </span>
              </div>

              {/* Status & Lantai */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Status Unit</label>
                  <select
                    value={selectedRoomForEdit.status}
                    onChange={(e) => {
                      const newStat = e.target.value as RoomStatus;
                      setSelectedRoomForEdit({
                        ...selectedRoomForEdit,
                        status: newStat,
                        tenantName: newStat === "available" ? "" : selectedRoomForEdit.tenantName,
                      });
                    }}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  >
                    <option value="occupied">🟢 Occupied (Terisi)</option>
                    <option value="available">⚪ Available (Kosong)</option>
                    <option value="maintenance">🟠 Maintenance (Perbaikan)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Lantai / Posisi</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={selectedRoomForEdit.floor}
                    onChange={(e) =>
                      setSelectedRoomForEdit({
                        ...selectedRoomForEdit,
                        floor: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                </div>
              </div>

              {/* Tipe & Ukuran */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Tipe Unit</label>
                  <input
                    type="text"
                    value={selectedRoomForEdit.type}
                    onChange={(e) =>
                      setSelectedRoomForEdit({
                        ...selectedRoomForEdit,
                        type: e.target.value as RoomType,
                      })
                    }
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                    placeholder="Contoh: Standard, Deluxe, VIP, Cluster 2 Lantai..."
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Ukuran / Dimensi</label>
                  <input
                    type="text"
                    value={selectedRoomForEdit.size}
                    onChange={(e) =>
                      setSelectedRoomForEdit({
                        ...selectedRoomForEdit,
                        size: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                    placeholder="Contoh: 4 x 4 m, 70 / 120 m²..."
                  />
                </div>
              </div>

              {/* Tarif & Meteran Listrik */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Tarif Sewa Bulanan (Rp)</label>
                  <input
                    type="number"
                    value={selectedRoomForEdit.price}
                    onChange={(e) =>
                      setSelectedRoomForEdit({
                        ...selectedRoomForEdit,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none font-bold text-[#7b1113]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">No. Meteran Listrik / ID</label>
                  <input
                    type="text"
                    placeholder="Contoh: PLN-5421990"
                    value={selectedRoomForEdit.electricityMeter || ""}
                    onChange={(e) =>
                      setSelectedRoomForEdit({
                        ...selectedRoomForEdit,
                        electricityMeter: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Nama Penyewa</label>
                <input
                  type="text"
                  placeholder="Kosongkan jika tidak ada penyewa aktif"
                  value={selectedRoomForEdit.tenantName || ""}
                  onChange={(e) =>
                    setSelectedRoomForEdit({
                      ...selectedRoomForEdit,
                      tenantName: e.target.value,
                    })
                  }
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Catatan Khusus</label>
                <textarea
                  rows={2}
                  placeholder="Catatan perbaikan atau riwayat unit..."
                  value={selectedRoomForEdit.notes || ""}
                  onChange={(e) =>
                    setSelectedRoomForEdit({
                      ...selectedRoomForEdit,
                      notes: e.target.value,
                    })
                  }
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  {onDeleteRoom && (
                    <button
                      type="button"
                      onClick={() => {
                        setRoomToDelete(selectedRoomForEdit);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold border border-red-200 cursor-pointer flex items-center gap-1.5 transition text-xs"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Hapus Unit</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRoomForEdit(null)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#7b1113] hover:bg-[#630d0f] text-[#facc15] font-bold shadow-sm cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS UNIT / KAMAR / SLOT */}
      {roomToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-100">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-gray-900">
                  Konfirmasi Hapus Unit
                </h3>
                <p className="text-xs text-gray-500">
                  Tindakan ini akan menghapus data unit dari sistem.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Nomor / Kode Unit:</span>
                  <span className="font-mono font-black text-[#7b1113] bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-sm">
                    {roomToDelete.roomNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Lokasi Properti:</span>
                  <span className="font-bold text-gray-900">{roomToDelete.propertyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tipe & Spesifikasi:</span>
                  <span className="font-semibold text-gray-800">{roomToDelete.type} ({roomToDelete.size})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tarif Sewa:</span>
                  <span className="font-black text-[#7b1113]">{formatRupiah(roomToDelete.price)}/bln</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status Okupansi:</span>
                  <span className="font-bold text-gray-800">
                    {roomToDelete.status === "occupied" ? "🟢 Terisi (Occupied)" : roomToDelete.status === "available" ? "⚪ Kosong (Available)" : "🟠 Perbaikan (Maintenance)"}
                  </span>
                </div>
              </div>

              {/* Warning if occupied / has tenant */}
              {(roomToDelete.status === "occupied" || roomToDelete.tenantName) && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Perhatian: Unit Sedang Terisi</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    Unit ini sedang terisi oleh penyewa <strong>{roomToDelete.tenantName || "Aktif"}</strong>. Menghapus unit ini akan melepaskan relasi kamar pada penyewa tersebut.
                  </p>
                </div>
              )}

              <p className="text-gray-600 text-[11px] leading-relaxed">
                Apakah Anda yakin ingin menghapus data unit <strong>{roomToDelete.roomNumber}</strong>? Data yang dihapus akan tersinkronisasi ke Cloud Firebase.
              </p>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRoomToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Ya, Hapus Unit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
