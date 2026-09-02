import React, { useState, useRef, useEffect } from "react";
import {
  Check,
  ChevronsUpDown,
  Search,
  Plus,
  DoorOpen,
  Home,
  Car,
  Building2,
  Sparkles,
  X
} from "lucide-react";
import { Room, Property, PropertyCategory } from "../types";
import { formatRupiah } from "../data/mockData";

interface RoomComboBoxProps {
  rooms: Room[];
  propertyId: string;
  value: string;
  onChange: (value: string) => void;
  onSelectRoom?: (room: Room) => void;
  placeholder?: string;
  required?: boolean;
  filterAvailableOnly?: boolean;
  disabled?: boolean;
  className?: string;
  category?: PropertyCategory;
}

export const RoomComboBox: React.FC<RoomComboBoxProps> = ({
  rooms,
  propertyId,
  value,
  onChange,
  onSelectRoom,
  placeholder = "Pilih / Ketik Unit...",
  required = false,
  filterAvailableOnly = false,
  disabled = false,
  className = "",
  category = "kost",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Filter rooms belonging to current selected property
  const propertyRooms = React.useMemo(() => {
    let list = rooms.filter((r) => r.propertyId === propertyId);
    if (filterAvailableOnly) {
      list = list.filter((r) => r.status === "available");
    }
    // Sort naturally
    return list.sort((a, b) =>
      a.roomNumber.localeCompare(b.roomNumber, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );
  }, [rooms, propertyId, filterAvailableOnly]);

  // Filtered by search input
  const filteredRooms = React.useMemo(() => {
    if (!searchTerm.trim()) return propertyRooms;
    const q = searchTerm.toLowerCase();
    return propertyRooms.filter(
      (r) =>
        r.roomNumber.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        (r.tenantName && r.tenantName.toLowerCase().includes(q)) ||
        r.price.toString().includes(q)
    );
  }, [propertyRooms, searchTerm]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (room: Room) => {
    onChange(room.roomNumber);
    if (onSelectRoom) {
      onSelectRoom(room);
    }
    setSearchTerm("");
    setIsOpen(false);
  };

  const selectedRoomObj = propertyRooms.find((r) => r.roomNumber === value);

  const getUnitTerm = () => {
    if (category === "rumah") return "Unit Rumah";
    if (category === "parkir") return "Slot Parkir";
    return "Kamar Kost";
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Combobox Main Input Box */}
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
            inputRef.current?.focus();
          }
        }}
        className={`flex items-center justify-between w-full px-3 py-2 bg-gray-50 border rounded-xl cursor-pointer transition select-none ${
          isOpen
            ? "border-[#7b1113] ring-2 ring-[#7b1113]/20 bg-white"
            : "border-gray-200 hover:border-gray-300"
        } ${disabled ? "opacity-60 cursor-not-allowed bg-gray-100" : ""}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {category === "rumah" ? (
            <Home className="w-4 h-4 text-indigo-700 shrink-0" />
          ) : category === "parkir" ? (
            <Car className="w-4 h-4 text-emerald-700 shrink-0" />
          ) : (
            <DoorOpen className="w-4 h-4 text-[#7b1113] shrink-0" />
          )}

          {value ? (
            <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
              <span className="font-mono font-bold text-gray-900 text-xs tracking-wider bg-white px-2 py-0.5 rounded border border-gray-200 shadow-2xs">
                {value}
              </span>
              {selectedRoomObj && (
                <span className="text-[11px] text-gray-500 truncate hidden sm:inline">
                  • {selectedRoomObj.type} ({formatRupiah(selectedRoomObj.price)}/bln)
                </span>
              )}
              {selectedRoomObj && (
                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase ml-auto shrink-0 ${
                    selectedRoomObj.status === "available"
                      ? "bg-emerald-100 text-emerald-800"
                      : selectedRoomObj.status === "occupied"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {selectedRoomObj.status === "available"
                    ? "Kosong"
                    : selectedRoomObj.status === "occupied"
                    ? "Terisi"
                    : "Perbaikan"}
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-400 text-xs font-normal truncate">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 pl-1 text-gray-400 shrink-0">
          {value && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                setSearchTerm("");
              }}
              className="p-0.5 rounded-full hover:bg-gray-200 hover:text-gray-600 transition"
              title="Hapus Pilihan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronsUpDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Hidden real input for required form validation */}
      <input
        type="text"
        required={required}
        value={value}
        onChange={() => {}}
        tabIndex={-1}
        className="opacity-0 absolute inset-0 pointer-events-none w-full h-full"
      />

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[280px] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Search Header inside dropdown */}
          <div className="p-2 border-b border-gray-100 bg-gray-50/70">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Ketik nomor / kode ${getUnitTerm()}...`}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-[#7b1113] focus:ring-1 focus:ring-[#7b1113] text-gray-800"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Summary Header */}
          <div className="px-3 py-1.5 bg-rose-50/50 border-b border-rose-100/60 flex items-center justify-between text-[10px] text-gray-500">
            <span>Daftar {getUnitTerm()} Terdaftar:</span>
            <span className="font-bold text-[#7b1113]">
              {propertyRooms.length} {getUnitTerm()} ({propertyRooms.filter((r) => r.status === "available").length} Kosong)
            </span>
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto p-1 divide-y divide-gray-50 text-xs">
            {filteredRooms.length === 0 ? (
              <div className="py-4 px-3 text-center">
                <p className="text-gray-500 font-medium text-xs">
                  Tidak ada {getUnitTerm()} cocok dengan "{searchTerm}"
                </p>
                {searchTerm.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange(searchTerm.trim());
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#7b1113] text-[#facc15] font-bold text-xs hover:bg-[#630e10] transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Gunakan "{searchTerm.trim()}"
                  </button>
                )}
              </div>
            ) : (
              filteredRooms.map((room) => {
                const isSelected = room.roomNumber === value;
                const isAvail = room.status === "available";

                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => handleSelect(room)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition cursor-pointer ${
                      isSelected
                        ? "bg-rose-50 text-[#7b1113] font-bold"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="font-mono font-black text-xs px-2 py-0.5 rounded bg-white border border-gray-200 shadow-2xs shrink-0 text-gray-900">
                        {room.roomNumber}
                      </div>

                      <div className="min-w-0">
                        <div className="font-bold text-gray-900 text-xs flex items-center gap-1.5 truncate">
                          <span>Tipe {room.type}</span>
                          <span className="text-[10px] text-gray-400 font-normal">
                            (Lt. {room.floor})
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500 flex items-center gap-1">
                          <span className="font-bold text-[#7b1113]">
                            {formatRupiah(room.price)}
                          </span>
                          <span>/bln</span>
                          {room.tenantName && (
                            <span className="truncate text-gray-400">
                              • Penyewa: {room.tenantName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase ${
                          room.status === "available"
                            ? "bg-emerald-100 text-emerald-800"
                            : room.status === "occupied"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {room.status === "available"
                          ? "Kosong"
                          : room.status === "occupied"
                          ? "Terisi"
                          : "Perbaikan"}
                      </span>

                      {isSelected && (
                        <Check className="w-4 h-4 text-[#7b1113]" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Custom entry footer option if searchTerm is typed */}
          {searchTerm.trim() && !filteredRooms.some((r) => r.roomNumber.toLowerCase() === searchTerm.toLowerCase()) && (
            <div className="p-2 bg-gray-50 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  onChange(searchTerm.trim());
                  setIsOpen(false);
                  setSearchTerm("");
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-gray-800 font-bold text-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#7b1113]" />
                Ketik Kode Kustom: "{searchTerm.trim()}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
