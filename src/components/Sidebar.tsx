import React from "react";
import {
  LayoutDashboard,
  Building,
  DoorOpen,
  Users,
  WalletCards,
  MessageSquareShare,
  Wrench,
  FileText,
  BarChart3,
  Sparkles,
  Bell,
  Settings,
  ChevronRight,
  ShieldCheck,
  PhoneCall
} from "lucide-react";
import { ActiveTab, UserRole, UserProfile } from "../types";
import { LogOut } from "lucide-react";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  userRole: UserRole;
  unreadNotifications: number;
  user?: UserProfile;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  unreadNotifications,
  user,
  onLogout,
}) => {
  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    roles?: UserRole[];
  }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "properties", label: "List Properti", icon: Building },
    { id: "rooms", label: "Manajemen Kamar/ Parking ", icon: DoorOpen },
    { id: "tenants", label: "Data Penyewa", icon: Users },
    { id: "finance", label: "Keuangan & Billing", icon: WalletCards },
    { id: "reminders", label: "Pengingat Otomatis", icon: MessageSquareShare },
    { id: "maintenance", label: "Maintenance & Tiket", icon: Wrench, badge: "4" },
    { id: "contracts", label: "Manajemen Kontrak", icon: FileText },
    { id: "analytics", label: "Analisis & Laporan", icon: BarChart3 },
    { id: "notifications", label: "Notifikasi", icon: Bell, badge: unreadNotifications > 0 ? unreadNotifications : undefined },
    { id: "settings", label: "Pengaturan & Role", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#7b1113] text-white flex flex-col shrink-0 shadow-xl border-r border-[#630e10] select-none h-full">
      {/* Sidebar Header Banner */}
      <div className="p-4 flex items-center gap-3 border-b border-[#ffffff15]">
        <div className="w-10 h-10 bg-[#facc15] rounded-xl flex items-center justify-center shadow-md shrink-0">
          <span className="text-[#7b1113] font-black text-xl leading-none">A</span>
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-black tracking-tight text-white leading-tight uppercase truncate">
            ABIANTIMBUL
          </h1>
          <div className="text-[10px] text-amber-200/90 font-semibold tracking-wide">Property Management</div>
        </div>
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-200/70">
          Menu Utama
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAi = item.id === "ai_assistant";

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                isActive
                  ? isAi
                    ? "bg-[#ffffff25] text-[#facc15] border border-amber-400/40 shadow-sm font-bold"
                    : "bg-[#ffffff20] text-white shadow-sm font-bold border border-white/10"
                  : isAi
                  ? "text-[#facc15] hover:bg-[#ffffff10]"
                  : "text-rose-100/80 hover:bg-[#ffffff10] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition ${
                    isActive
                      ? isAi
                        ? "text-[#facc15]"
                        : "text-[#facc15]"
                      : isAi
                      ? "text-[#facc15] group-hover:scale-110"
                      : "text-rose-200/80 group-hover:text-white"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isAi
                      ? "bg-[#facc15] text-[#7b1113]"
                      : item.id === "notifications"
                      ? "bg-rose-500 text-white"
                      : isActive
                      ? "bg-[#ffffff25] text-amber-200"
                      : "bg-[#00000025] text-rose-200"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom info & Quick help */}
      <div className="p-3 m-3 rounded-xl bg-[#00000020] border border-[#ffffff15]">
        <div className="flex items-center justify-between text-xs text-white mb-1.5">
          <span className="font-bold flex items-center gap-1.5 text-[#facc15]">
            <Sparkles className="w-3.5 h-3.5" /> Abiantimbul AI
          </span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-[#facc15] border border-amber-400/40 font-bold uppercase">
            Active
          </span>
        </div>
        <p className="text-[11px] text-rose-100/80 leading-snug line-clamp-2">
          Okupansi meningkat 8%. Prediksi 5 kamar akhir kontrak 30 hari ke depan.
        </p>
        <button
          onClick={() => setActiveTab("ai_assistant")}
          className="mt-2.5 w-full py-1.5 px-2 bg-[#facc15] hover:bg-amber-300 text-[#7b1113] text-[11px] font-extrabold rounded-lg transition flex items-center justify-center gap-1 shadow-sm cursor-pointer"
        >
          Konsultasi AI <ChevronRight className="w-3 h-3 text-[#7b1113]" />
        </button>
      </div>

      {/* Footer Profile summary */}
      <div className="p-3.5 border-t border-[#ffffff10] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full border-2 border-[#facc15] overflow-hidden shrink-0 shadow-xs">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
              alt={user?.name || "User"}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white leading-tight truncate">{user?.name || "Pak Gde"}</p>
            <p className="text-[10px] text-rose-200/70 truncate">{user?.roleTitle || "Owner Account"}</p>
          </div>
        </div>
        
        {onLogout ? (
          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-rose-200 hover:text-white transition cursor-pointer shrink-0"
            title="Keluar Akun"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="text-[10px] px-1.5 py-0.5 rounded bg-[#ffffff15] text-[#facc15] font-bold shrink-0">
            PRO
          </div>
        )}
      </div>
    </aside>
  );
};
