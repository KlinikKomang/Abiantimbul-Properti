import React from "react";
import {
  Building2,
  Bell,
  ChevronDown,
  User,
  Shield,
  Search,
  SlidersHorizontal,
  Sparkles,
  Home,
  LogOut,
  ExternalLink,
  Smartphone,
  Laptop,
  Cloud,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { UserProfile, Property, AppNotification, UserRole, Room, PropertyCategory } from "../types";
import { AVAILABLE_ROLES } from "../data/mockData";

interface HeaderProps {
  user: UserProfile;
  setUserRole: (role: UserRole) => void;
  properties: Property[];
  rooms?: Room[];
  selectedPropertyId: string;
  setSelectedPropertyId: (id: string) => void;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  onOpenAiAssistant?: () => void;
  isMobilePreview: boolean;
  setIsMobilePreview: (val: boolean) => void;
  onOpenProfile: () => void;
  onLogout?: () => void;
  cloudSyncStatus?: "connected" | "syncing" | "offline";
}

export const Header: React.FC<HeaderProps> = ({
  user,
  setUserRole,
  properties,
  rooms = [],
  selectedPropertyId,
  setSelectedPropertyId,
  notifications,
  onOpenNotifications,
  isMobilePreview,
  setIsMobilePreview,
  onOpenProfile,
  onLogout,
  cloudSyncStatus = "connected",
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = React.useState(false);
  const [propertyDropdownOpen, setPropertyDropdownOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const currentProperty = properties.find((p) => p.id === selectedPropertyId);

  const getCategoryUnitTerm = (cat?: PropertyCategory) => {
    switch (cat) {
      case "rumah":
        return "unit";
      case "parkir":
        return "slot";
      case "ruko":
        return "ruko";
      case "tanah":
        return "kavling";
      case "kost":
      default:
        return "kamar";
    }
  };

  const totalUnitsCount =
    rooms && rooms.length > 0
      ? rooms.length
      : properties.reduce((acc, p) => acc + (p.totalRooms || 0), 0);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-8 py-3 transition-all shadow-xs">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Brand & Greeting */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#7b1113] flex items-center justify-center text-white shadow-sm ring-2 ring-[#facc15]/60">
              <Building2 className="w-5 h-5 text-[#facc15]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#7b1113]">
                  ABIANTIMBUL
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  PROPERTY MANAGEMENT
                </span>
              </div>
              <h2 className="text-xs text-gray-500 font-medium hidden sm:block">
                Selamat datang, <strong className="text-gray-900 font-semibold">{user.name}</strong> 👋
              </h2>
            </div>
          </div>

          <div className="h-6 w-px bg-gray-200 hidden md:block mx-1" />

            {/* Multi-Property Switcher */}
          <div className="relative">
            <button
              onClick={() => setPropertyDropdownOpen(!propertyDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 transition shadow-xs cursor-pointer"
              title="Pilih Unit / Portofolio Properti"
            >
              <Home className="w-3.5 h-3.5 text-[#7b1113]" />
              <span className="max-w-[130px] sm:max-w-[180px] truncate">
                {selectedPropertyId === "all" ? `🏢 Semua Properti (${properties.length} Properti)` : currentProperty?.name || "Pilih Properti"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {propertyDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Pilih Unit Properti</span>
                  <span className="text-[10px] text-gray-500 font-normal">{properties.length} Terdaftar</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedPropertyId("all");
                    setPropertyDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition cursor-pointer ${
                    selectedPropertyId === "all" ? "bg-rose-50 text-[#7b1113] font-bold" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#7b1113]" />
                    Semua Properti ({properties.length} Properti)
                  </span>
                  <span className="text-[10px] text-gray-500 font-semibold px-1.5 py-0.5 rounded bg-gray-100">{totalUnitsCount} Total Unit</span>
                </button>
                {properties.map((p) => {
                  const propRooms = rooms ? rooms.filter((r) => r.propertyId === p.id) : [];
                  const totalUnits = propRooms.length > 0 ? propRooms.length : (p.totalRooms || 0);
                  const occupiedUnits = propRooms.length > 0
                    ? propRooms.filter((r) => r.status === "occupied").length
                    : (p.occupiedRooms || 0);
                  const unitTerm = getCategoryUnitTerm(p.category);

                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPropertyId(p.id);
                        setPropertyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition cursor-pointer ${
                        selectedPropertyId === p.id ? "bg-rose-50 text-[#7b1113] font-bold" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="truncate pr-2 font-medium">{p.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-mono font-semibold shrink-0">
                        {occupiedUnits}/{totalUnits} {unitTerm}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Tools, Cloud Status, Notifications, Role Switcher, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cloud Firestore Status Badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold select-none shadow-2xs"
            title="Database Firebase Cloud Firestore aktif & tersinkronisasi otomatis"
          >
            {cloudSyncStatus === "syncing" ? (
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
            ) : (
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span className="hidden sm:inline text-[11px]">
              {cloudSyncStatus === "syncing" ? "Menyinkronkan..." : "Cloud Firestore"}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* View mode toggle (Responsive vs Mobile simulator) */}
          <button
            onClick={() => setIsMobilePreview(!isMobilePreview)}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition cursor-pointer"
            title={isMobilePreview ? "Beralih ke Tampilan Desktop Web" : "Beralih ke Tampilan Mobile App"}
          >
            {isMobilePreview ? (
              <>
                <Laptop className="w-3.5 h-3.5 text-[#7b1113]" />
                <span className="text-[11px] font-semibold">Mode Desktop</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-[#7b1113]" />
                <span className="text-[11px] font-semibold">Mode Mobile</span>
              </>
            )}
          </button>

          {/* Role Switcher for seamless demo & permissions */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium border border-gray-200 transition cursor-pointer"
              title="Ganti Role Pengguna"
            >
              <Shield className="w-3.5 h-3.5 text-[#7b1113]" />
              <span className="capitalize font-semibold">{user.role.replace("_", " ")}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Simulasi Role Pengguna
                </div>
                {AVAILABLE_ROLES.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      setUserRole(r.role);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs transition ${
                      user.role === r.role ? "bg-rose-50 text-[#7b1113] font-bold" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-semibold">{r.title}</div>
                    <div className="text-[10px] text-gray-400 font-normal leading-tight">{r.desc}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full text-gray-600 hover:text-[#7b1113] bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
            title="Pusat Pemberitahuan"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#7b1113] text-white text-[8px] px-1.5 py-0.2 rounded-full border-2 border-white font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Profile Button & Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-gray-100 border border-gray-200 transition cursor-pointer"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover border-2 border-[#facc15]"
              />
              <span className="text-xs font-semibold text-gray-700 hidden lg:inline max-w-[80px] truncate">
                {user.name}
              </span>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-gray-100">
                  <div className="font-bold text-xs text-gray-800">{user.name}</div>
                  <div className="text-[11px] text-[#7b1113] font-semibold">{user.roleTitle}</div>
                  <div className="text-[10px] text-gray-400 truncate">{user.email}</div>
                </div>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenProfile();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  Profil & Pengaturan Akun
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    if (onLogout) {
                      onLogout();
                    }
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Keluar Akun
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
