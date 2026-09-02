import React from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  Check,
  Building2,
  DollarSign,
  FileText,
  Wrench,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { AppNotification, ActiveTab } from "../types";

interface NotificationViewProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const NotificationView: React.FC<NotificationViewProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearNotifications,
  setActiveTab,
}) => {
  const [filterType, setFilterType] = React.useState<string>("all");

  const filtered = notifications.filter(
    (n) => filterType === "all" || n.type === filterType
  );

  const getIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "payment":
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case "contract":
        return <FileText className="w-4 h-4 text-amber-600" />;
      case "maintenance":
        return <Wrench className="w-4 h-4 text-rose-600" />;
      case "ai":
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#800020]" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Pusat Notifikasi & Pemberitahuan
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Semua aktivitas masuk: pembayaran sewa, jatuh tempo kontrak, tiket perbaikan, dan alert AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onMarkAllAsRead}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" /> Tandai Semua Dibaca
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white rounded-2xl border border-slate-200 shadow-xs text-xs">
        {[
          { id: "all", label: `Semua (${notifications.length})` },
          { id: "payment", label: "💰 Pembayaran" },
          { id: "contract", label: "📄 Kontrak" },
          { id: "maintenance", label: "🔧 Maintenance" },
          { id: "ai", label: "✨ AI Insights" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              filterType === tab.id
                ? "bg-[#800020] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            Tidak ada notifikasi pada kategori ini.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onMarkAsRead(item.id);
                if (item.actionUrl) {
                  setActiveTab(item.actionUrl as ActiveTab);
                }
              }}
              className={`p-4 rounded-2xl border transition flex items-start justify-between gap-3 cursor-pointer ${
                item.read
                  ? "bg-white border-slate-200 text-slate-700"
                  : "bg-rose-50/40 border-[#800020]/30 shadow-xs"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    item.read ? "bg-slate-100" : "bg-white shadow-sm ring-1 ring-[#800020]/20"
                  }`}
                >
                  {getIcon(item.type)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-slate-900">{item.title}</h3>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-[#800020] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.message}</p>
                  <span className="text-[10px] text-slate-400 font-medium block mt-1">
                    {item.time}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-center">
                <span className="text-xs font-bold text-[#800020] flex items-center gap-1 hover:underline">
                  Buka Modul <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
