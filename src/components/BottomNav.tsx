import React from "react";
import {
  LayoutDashboard,
  Building,
  Users,
  WalletCards,
  Menu,
  X,
  DoorOpen,
  Wrench,
  FileText,
  BarChart3,
  Sparkles,
  Settings,
  Bell,
  MessageSquareShare,
  LogOut,
  UserCheck
} from "lucide-react";
import { ActiveTab, UserProfile } from "../types";

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  unreadNotifications: number;
  user?: UserProfile;
  onLogout?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  unreadNotifications,
  user,
  onLogout,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const mainTabs: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "properties", label: "Properti", icon: Building },
    { id: "tenants", label: "Penyewa", icon: Users },
    { id: "finance", label: "Keuangan", icon: WalletCards },
  ];

  const drawerTabs: { id: ActiveTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: "rooms", label: "Manajemen Kamar", icon: DoorOpen },
    { id: "reminders", label: "Pengingat Otomatis", icon: MessageSquareShare },
    { id: "maintenance", label: "Maintenance & Tiket", icon: Wrench, badge: "4 Tiket" },
    { id: "contracts", label: "Manajemen Kontrak", icon: FileText },
    { id: "analytics", label: "Laporan & Analitik", icon: BarChart3 },
    { id: "notifications", label: "Pusat Notifikasi", icon: Bell, badge: unreadNotifications > 0 ? `${unreadNotifications} Baru` : undefined },
    { id: "settings", label: "Pengaturan & Hak Akses", icon: Settings },
  ];

  const isDrawerActive = drawerTabs.some((t) => t.id === activeTab);

  return (
    <>
      {/* Mobile Drawer Menu Backdrop & Modal */}
      {menuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex flex-col justify-end lg:hidden animate-in fade-in duration-150"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="bg-white rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto shadow-2xl border-t border-slate-200 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* User Profile Header in Drawer */}
            {user && (
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-4 bg-gray-50 -mx-5 -mt-5 p-4 rounded-t-3xl">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#facc15] shadow-xs"
                  />
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900 leading-tight flex items-center gap-1.5">
                      {user.name}
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                        {user.role.toUpperCase()}
                      </span>
                    </h4>
                    <p className="text-[11px] text-gray-500 font-medium">{user.roleTitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {onLogout && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onLogout();
                      }}
                      className="p-2 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="Keluar Akun"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Keluar</span>
                    </button>
                  )}
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pb-2 mb-2">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">Semua Modul & Layanan</h3>
                <p className="text-xs text-slate-400">Pilih menu operasional KOSTMANAGER</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pb-4">
              {drawerTabs.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMenuOpen(false);
                    }}
                    className={`flex flex-col items-start p-3 rounded-2xl border text-left transition cursor-pointer active:scale-98 ${
                      isActive
                        ? "bg-[#7b1113]/10 border-[#7b1113] text-[#7b1113] font-bold"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isActive ? "bg-[#7b1113] text-white" : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Bar for Mobile (with safe padding) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 flex items-center justify-around lg:hidden shadow-lg">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer active:scale-95 ${
                isActive ? "text-[#7b1113] font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition ${
                  isActive ? "bg-[#7b1113]/10 ring-1 ring-[#7b1113]/30 text-[#7b1113]" : ""
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
            </button>
          );
        })}

        {/* Menu Tab button with Notification Dot */}
        <button
          onClick={() => setMenuOpen(true)}
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer active:scale-95 ${
            isDrawerActive || menuOpen ? "text-[#7b1113] font-bold" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {unreadNotifications > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
          )}
          <div
            className={`p-1.5 rounded-xl transition ${
              isDrawerActive || menuOpen ? "bg-[#7b1113]/10 ring-1 ring-[#7b1113]/30 text-[#7b1113]" : ""
            }`}
          >
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 font-medium">Menu</span>
        </button>
      </nav>
    </>
  );
};
