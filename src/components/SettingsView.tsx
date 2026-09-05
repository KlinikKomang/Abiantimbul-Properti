import React, { useState, useRef } from "react";
import {
  Settings,
  Shield,
  Users,
  Building2,
  CreditCard,
  BellRing,
  Lock,
  Save,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Trash2,
  Database,
  RefreshCw,
  AlertTriangle,
  Download,
  Upload,
  HardDrive,
  FileJson,
  Check,
  LogOut,
  UserPlus,
  Edit2,
  KeyRound,
  Search,
  Building,
  UserCheck,
  AlertCircle
} from "lucide-react";
import { UserRole, UserProfile, Property, AuthAccount } from "../types";
import { AVAILABLE_ROLES, DEMO_ACCOUNTS } from "../data/mockData";
import { UserFormModal } from "./UserFormModal";

interface SettingsViewProps {
  user: UserProfile;
  setUserRole: (role: UserRole) => void;
  properties: Property[];
  accounts?: AuthAccount[];
  onAddUser?: (account: AuthAccount) => void;
  onUpdateUser?: (account: AuthAccount) => void;
  onDeleteUser?: (accountId: string) => void;
  onClearAllData?: () => void;
  onResetMinimalData?: () => void;
  onResetToFullUpdatedData?: () => void;
  onForceSyncToCloud?: () => Promise<boolean>;
  onExportBackup?: () => void;
  onImportBackup?: (backupJson: any) => boolean;
  onLogout?: () => void;
  cloudSyncStatus?: "connected" | "syncing" | "offline";
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  setUserRole,
  properties,
  accounts = DEMO_ACCOUNTS,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onClearAllData,
  onResetMinimalData,
  onResetToFullUpdatedData,
  onForceSyncToCloud,
  onExportBackup,
  onImportBackup,
  onLogout,
  cloudSyncStatus = "connected",
}) => {
  const [activeTab, setActiveTab] = useState<"roles" | "operational" | "account" | "database">("roles");
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Operational form state
  const [curfew, setCurfew] = useState("23:00 WIB (Pintu Gerbang Ditutup)");
  const [guestPolicy, setGuestPolicy] = useState("Tamu lawan jenis dilarang masuk kamar, maksimal di ruang tamu pukul 21:00");
  const [bankName, setBankName] = useState("Bank Central Asia (BCA)");
  const [accountNumber, setAccountNumber] = useState("8830-9988-11");
  const [accountHolder, setAccountHolder] = useState("GDE ASBAWA PUTRA");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // User management state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AuthAccount | null>(null);
  const [deleteConfirmAccount, setDeleteConfirmAccount] = useState<AuthAccount | null>(null);
  const [userSearch, setUserSearch] = useState("");

  const isSuperAdmin =
    user.email.toLowerCase() === "gdeasbawaputra@gmail.com" ||
    user.role === "owner";

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (onImportBackup) {
          const success = onImportBackup(json);
          if (success) {
            setImportStatus("Data berhasil dipulihkan dari file backup!");
            setTimeout(() => setImportStatus(null), 4000);
          } else {
            setImportStatus("Gagal membaca format file backup.");
            setTimeout(() => setImportStatus(null), 4000);
          }
        }
      } catch (err) {
        setImportStatus("Format file JSON tidak valid.");
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleOpenAddUser = () => {
    if (!isSuperAdmin) {
      alert("Hanya Administrator Utama (gdeasbawaputra@gmail.com) yang memiliki hak akses untuk menambah user login baru.");
      return;
    }
    setEditingAccount(null);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (acc: AuthAccount) => {
    if (!isSuperAdmin) {
      alert("Hanya Administrator Utama (gdeasbawaputra@gmail.com) yang memiliki hak akses untuk mengubah data user login.");
      return;
    }
    setEditingAccount(acc);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (acc: AuthAccount, isEdit: boolean) => {
    if (isEdit) {
      if (onUpdateUser) onUpdateUser(acc);
    } else {
      if (onAddUser) onAddUser(acc);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDeleteUser = () => {
    if (!deleteConfirmAccount) return;
    if (deleteConfirmAccount.email.toLowerCase() === "gdeasbawaputra@gmail.com") {
      alert("Akun Super Administrator Utama tidak dapat dihapus!");
      setDeleteConfirmAccount(null);
      return;
    }
    if (onDeleteUser) {
      onDeleteUser(deleteConfirmAccount.id);
    }
    setDeleteConfirmAccount(null);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Filtered accounts list
  const filteredAccounts = accounts.filter((acc) => {
    const q = userSearch.toLowerCase();
    return (
      acc.profile.name.toLowerCase().includes(q) ||
      acc.email.toLowerCase().includes(q) ||
      acc.phone.toLowerCase().includes(q) ||
      acc.profile.role.toLowerCase().includes(q) ||
      acc.profile.roleTitle.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#7b1113]" />
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Pengaturan & Manajemen Sistem
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Konfigurasi tim pengelola, akun login multi-role, peraturan operasional, rekening bank, dan reset database.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" /> Perubahan Berhasil Disimpan!
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white rounded-2xl border border-gray-200 shadow-xs text-xs">
        <button
          onClick={() => setActiveTab("roles")}
          className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "roles"
              ? "bg-[#7b1113] text-[#facc15] shadow-xs"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Shield className="w-3.5 h-3.5" /> Manajemen User & Akun Login
        </button>
        <button
          onClick={() => setActiveTab("operational")}
          className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "operational"
              ? "bg-[#7b1113] text-[#facc15] shadow-xs"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" /> Aturan Operasional
        </button>
        <button
          onClick={() => setActiveTab("account")}
          className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "account"
              ? "bg-[#7b1113] text-[#facc15] shadow-xs"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" /> Rekening Pembayaran
        </button>
        <button
          onClick={() => setActiveTab("database")}
          className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "database"
              ? "bg-[#7b1113] text-[#facc15] shadow-xs"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Database className="w-3.5 h-3.5" /> Manajemen Data / Reset
        </button>
      </div>

      {activeTab === "roles" && (
        <div className="space-y-6">
          {/* Sesi Login & Profil Pengguna Saat Ini */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#facc15] shadow-xs shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-gray-900 leading-tight">
                    {user.name}
                  </h3>
                  {isSuperAdmin ? (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#7b1113] text-[#facc15]">
                      SUPER ADMIN UTAMA
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-gray-200 text-gray-800">
                      {user.role.toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-medium mt-0.5">{user.roleTitle}</p>
                <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                  {user.email} • {user.phone}
                </div>
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" /> Keluar dari Akun Ini (Logout)
              </button>
            )}
          </div>

          {/* Otoritas & Keamanan Banner */}
          {isSuperAdmin ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-300 shadow-xs flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#7b1113] text-[#facc15] flex items-center justify-center shrink-0 font-bold shadow-xs">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                    Hak Akses Administrator Utama Terbuka
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-[#7b1113] text-[#facc15]">
                      {user.email}
                    </span>
                  </h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Hanya Anda (<strong>gdeasbawaputra@gmail.com</strong>) yang memiliki otoritas penuh untuk <strong>Menambah User Baru (Add)</strong>, <strong>Mengubah Data & Role (Modify/Edit)</strong>, serta <strong>Menghapus Akun</strong> staf dan pengelola.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleOpenAddUser}
                className="px-4 py-2.5 rounded-xl bg-[#7b1113] hover:bg-[#630e10] text-[#facc15] font-extrabold text-xs shadow-md transition flex items-center gap-2 cursor-pointer shrink-0 active:scale-95"
              >
                <UserPlus className="w-4 h-4" /> Tambah User Login Baru
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 shadow-xs flex items-start gap-3 text-xs text-blue-900">
              <Lock className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-xs text-blue-950">
                  Mode Hak Akses Terbatas (Read-Only User Management)
                </h4>
                <p className="mt-0.5 text-blue-800 leading-relaxed">
                  Anda masuk sebagai <strong>{user.name}</strong> ({user.roleTitle}). Hak pengelolaan akun login (Add, Edit, Modify, dan Delete) <strong>khusus dan hanya didelegasikan kepada Administrator Utama: gdeasbawaputra@gmail.com</strong>.
                </p>
              </div>
            </div>
          )}

          {/* User Login Accounts Table & Management Section */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#7b1113]" /> Daftar Akun Login & Kredensial Pengguna
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Total {accounts.length} akun terdaftar di sistem KOSTMANAGER
                </p>
              </div>

              {/* Search bar & Add Button */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Cari user / email / role..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none w-44 sm:w-56"
                  />
                </div>
                {isSuperAdmin && (
                  <button
                    type="button"
                    onClick={handleOpenAddUser}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#7b1113] hover:bg-[#630e10] text-[#facc15] font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    title="Tambah User Baru"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Tambah User</span>
                  </button>
                )}
              </div>
            </div>

            {/* Table of User Accounts */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="pb-3 px-3">User & Nama</th>
                    <th className="pb-3 px-3">Hak Akses (Role)</th>
                    <th className="pb-3 px-3">Email & WhatsApp</th>
                    <th className="pb-3 px-3">Wilayah Properti</th>
                    <th className="pb-3 px-3 text-right">Aksi Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredAccounts.map((acc) => {
                    const isAccAdmin = acc.email.toLowerCase() === "gdeasbawaputra@gmail.com";
                    const assignedProp = properties.find((p) => p.id === acc.profile.assignedPropertyId);

                    return (
                      <tr key={acc.id} className="hover:bg-gray-50/80 transition">
                        {/* User & Avatar */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={acc.profile.avatar}
                              alt={acc.profile.name}
                              className={`w-9 h-9 rounded-full object-cover border-2 shrink-0 ${
                                isAccAdmin ? "border-[#7b1113] ring-1 ring-amber-400" : "border-gray-200"
                              }`}
                            />
                            <div>
                              <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                {acc.profile.name}
                                {isAccAdmin && (
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-[#7b1113] text-[#facc15]">
                                    SUPER ADMIN
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-gray-500 font-medium">
                                {acc.profile.roleTitle}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider inline-block ${
                              isAccAdmin
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : acc.profile.role === "property_manager"
                                ? "bg-indigo-100 text-indigo-800"
                                : acc.profile.role === "admin"
                                ? "bg-blue-100 text-blue-800"
                                : acc.profile.role === "finance"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {acc.profile.role}
                          </span>
                        </td>

                        {/* Email & Phone */}
                        <td className="py-3 px-3">
                          <div className="font-mono text-gray-800 font-medium">{acc.email}</div>
                          <div className="text-[11px] text-gray-400">{acc.phone || "-"}</div>
                        </td>

                        {/* Properti Wilayah */}
                        <td className="py-3 px-3">
                          <span className="font-medium text-gray-700">
                            {assignedProp ? assignedProp.name : "Semua Properti (Global)"}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3 px-3 text-right">
                          {isSuperAdmin ? (
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditUser(acc)}
                                className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#7b1113] hover:text-[#facc15] text-gray-700 transition cursor-pointer"
                                title="Edit / Ubah Data User"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Button */}
                              {isAccAdmin ? (
                                <button
                                  type="button"
                                  disabled
                                  className="p-1.5 rounded-lg bg-gray-100 text-gray-300 cursor-not-allowed"
                                  title="Akun Super Admin Utama tidak dapat dihapus"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmAccount(acc)}
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 transition cursor-pointer"
                                  title="Hapus Akun User"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-400 italic">
                              Hanya Super Admin
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredAccounts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        Tidak ditemukan akun dengan kata kunci "{userSearch}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Role Switcher Panel (Simulation) */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 shadow-xs">
            <h3 className="font-extrabold text-sm text-slate-900 mb-1">
              Simulasi Role Pengguna Aktif
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Pilih role untuk menguji tampilan antarmuka dan batasan hak akses sesuai kebutuhan jabatan:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {AVAILABLE_ROLES.map((r) => {
                const isCurrent = user.role === r.role;
                return (
                  <button
                    key={r.role}
                    onClick={() => setUserRole(r.role)}
                    className={`p-3 rounded-xl text-left border transition flex flex-col justify-between ${
                      isCurrent
                        ? "bg-[#800020] text-white border-[#800020] shadow-md ring-2 ring-amber-400"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs flex items-center justify-between mb-1">
                        <span>{r.title}</span>
                        {isCurrent && <span className="w-2 h-2 rounded-full bg-amber-300" />}
                      </div>
                      <p
                        className={`text-[10px] leading-tight ${
                          isCurrent ? "text-rose-100" : "text-slate-500"
                        }`}
                      >
                        {r.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "operational" && (
        <form onSubmit={handleSaveSettings} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="font-extrabold text-sm text-slate-900 mb-2">
            Peraturan & Standar Operasional Kost (SOP)
          </h3>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Ketentuan Jam Malam (Curfew)</label>
            <input
              type="text"
              value={curfew}
              onChange={(e) => setCurfew(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Kebijakan Tamu & Berkunjung</label>
            <textarea
              rows={3}
              value={guestPolicy}
              onChange={(e) => setGuestPolicy(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Integrasi WhatsApp Gateway</label>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <div>
                  <strong className="text-emerald-900 text-xs">Gateway WhatsApp Terhubung</strong>
                  <div className="text-emerald-700 text-[10px]">Nomor: +62 812-9900-2211 (KOSTMANAGER PRO)</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 text-[10px] font-bold">
                Online
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-300" /> Simpan Pengaturan Operasional
            </button>
          </div>
        </form>
      )}

      {activeTab === "account" && (
        <form onSubmit={handleSaveSettings} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="font-extrabold text-sm text-slate-900 mb-2">
            Rekening Bank Penampung Pembayaran Sewa
          </h3>
          <p className="text-xs text-slate-500">
            Rekening ini dicetak otomatis pada invoice, kwitansi, dan template pesan WhatsApp pengingat sewa.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Bank</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nomor Rekening</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Atas Nama (Pemilik)</label>
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#7b1113] hover:bg-[#630d0f] text-[#facc15] font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#facc15]" /> Simpan Rekening Bank
            </button>
          </div>
        </form>
      )}

      {activeTab === "database" && (
        <div className="space-y-6">
          {/* Status Database & Proteksi Data Persisten */}
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#7b1113]" /> Status Database & Cloud Firestore
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Seluruh data properti, unit/kamar, penyewa, akun login, dan transaksi keuangan disinkronisasikan ke Firebase Cloud Firestore dan dicache di Local Storage.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-1.5 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {cloudSyncStatus === "connected" ? "Cloud Firestore Terhubung" : "Offline Storage Aktif"}
              </span>
            </div>

            {/* Cloud Firestore Sync Card */}
            <div className="p-4 bg-gradient-to-r from-amber-50 to-rose-50 rounded-xl border border-amber-200 text-xs text-gray-800 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <RefreshCw className={`w-5 h-5 text-[#7b1113] shrink-0 mt-0.5 ${isSyncingCloud ? "animate-spin" : ""}`} />
                  <div>
                    <strong className="text-gray-900 block font-bold text-xs">Sinkronisasi Cloud Firestore</strong>
                    <span className="text-gray-600 text-[11px] leading-relaxed">
                      Pastikan seluruh perubahan data properti, penyewa, kamar, dan keuangan tersimpan langsung di server Cloud Firestore agar selalu ter-update saat diakses dari internet atau perangkat lain.
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={isSyncingCloud}
                  onClick={async () => {
                    if (onForceSyncToCloud) {
                      setIsSyncingCloud(true);
                      setSyncMessage("Menyinkronkan data ke Cloud Firestore...");
                      const ok = await onForceSyncToCloud();
                      setIsSyncingCloud(false);
                      if (ok) {
                        setSyncMessage("✅ Seluruh data berhasil diperbarui dan tersimpan di Cloud Firestore!");
                      } else {
                        setSyncMessage("⚠️ Gagal menyinkronkan ke Cloud Firestore.");
                      }
                      setTimeout(() => setSyncMessage(null), 4000);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-[#7b1113] hover:bg-[#630d0f] text-[#facc15] font-bold text-xs shadow-sm transition flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? "animate-spin" : ""}`} />
                  {isSyncingCloud ? "Menyinkronkan..." : "Sinkronkan & Update ke Cloud Sekarang"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onResetToFullUpdatedData) {
                      onResetToFullUpdatedData();
                      setSyncMessage("✅ Data lengkap terbaru (Kost, Rumah & Lot Parkir) berhasil dimuat dan disimpan ke Cloud Firestore!");
                      setTimeout(() => setSyncMessage(null), 4000);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#7b1113] font-bold text-xs border border-amber-300 transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Muat Portfolio Lengkap (Kost, Rumah & Parkir)
                </button>
              </div>

              {syncMessage && (
                <div className="p-2.5 rounded-lg bg-white/80 border border-amber-200 text-xs text-[#7b1113] font-semibold animate-in fade-in">
                  {syncMessage}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-center">
                <span className="text-[11px] text-gray-500 font-bold block">Total Properti</span>
                <strong className="text-xl font-black text-gray-900 mt-1 block">{properties.length}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-center">
                <span className="text-[11px] text-gray-500 font-bold block">Total Akun Login</span>
                <strong className="text-xl font-black text-[#7b1113] mt-1 block">{accounts.length}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-center">
                <span className="text-[11px] text-gray-500 font-bold block">Tipe Storage</span>
                <strong className="text-sm font-bold text-gray-800 mt-1 block">Cloud Firestore</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-center">
                <span className="text-[11px] text-gray-500 font-bold block">Status Akses</span>
                <strong className="text-sm font-bold text-emerald-600 mt-1 block">Auto-Login Super Admin</strong>
              </div>
            </div>
          </div>

          {/* Backup & Restore Data Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Export / Cadangkan Data JSON */}
            <div className="p-6 bg-white rounded-2xl border border-amber-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-[#7b1113] mb-3">
                  <Download className="w-5 h-5 text-[#7b1113]" />
                </div>
                <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                  Cadangkan Data (Backup JSON)
                </h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Unduh seluruh database (properti, kamar/unit, penyewa, transaksi keuangan, akun login, dan kontrak) ke dalam 1 file JSON sebagai arsip aman di komputer/HP Anda.
                </p>
              </div>

              <button
                type="button"
                onClick={onExportBackup}
                className="w-full py-2.5 px-4 rounded-xl bg-[#7b1113] hover:bg-[#630d0f] text-[#facc15] font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
              >
                <Download className="w-4 h-4" /> Unduh Cadangan Data (.json)
              </button>
            </div>

            {/* Import / Pulihkan Data JSON */}
            <div className="p-6 bg-white rounded-2xl border border-indigo-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 mb-3">
                  <Upload className="w-5 h-5 text-indigo-700" />
                </div>
                <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                  Pulihkan Data (Restore Backup)
                </h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Unggah file cadangan JSON yang pernah Anda unduh sebelumnya untuk memulihkan seluruh data properti ke sistem secara instan.
                </p>
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="backup-file-input"
                />
                <label
                  htmlFor="backup-file-input"
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
                >
                  <Upload className="w-4 h-4 text-indigo-700" /> Pilih File Cadangan (.json)
                </label>
                {importStatus && (
                  <p className="text-[11px] text-emerald-700 font-semibold text-center mt-2 animate-in fade-in">
                    {importStatus}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Cards: Bersihkan Data & Muat Contoh */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bersihkan Semua Data Card */}
            <div className="p-6 bg-white rounded-2xl border border-red-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 mb-3">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-gray-900">
                  Bersihkan Semua Data Contoh (Mulai dari Nol)
                </h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Hapus seluruh data properti contoh, unit/kamar demo, dan riwayat tagihan simulasi agar Anda dapat mulai mendaftarkan data properti asli Anda tanpa gangguan data dummy.
                </p>
              </div>

              <button
                onClick={() => setIsClearModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
              >
                <Trash2 className="w-4 h-4" /> Bersihkan Semua Data Contoh
              </button>
            </div>

            {/* Muat Data Contoh Minimal Card */}
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-[#7b1113] mb-3">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-gray-900">
                  Muat Data Contoh Minimal (1 Properti)
                </h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Muat 1 contoh properti kost tunggal dengan beberapa kamar dan simulasi penyewa untuk keperluan testing dan demo alur kerja.
                </p>
              </div>

              <button
                onClick={() => {
                  if (onResetMinimalData) onResetMinimalData();
                  setSavedSuccess(true);
                  setTimeout(() => setSavedSuccess(false), 3000);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer border border-gray-300 active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-[#7b1113]" /> Muat 1 Contoh Demo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER FORM MODAL (ADD & EDIT) */}
      <UserFormModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleSaveUser}
        editingAccount={editingAccount}
        properties={properties}
      />

      {/* MODAL KONFIRMASI HAPUS USER */}
      {deleteConfirmAccount && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900">
                  Hapus Akun User Login?
                </h3>
                <p className="text-xs text-gray-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <div className="my-4 p-4 bg-rose-50/70 border border-rose-200 rounded-2xl text-xs space-y-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={deleteConfirmAccount.profile.avatar}
                  alt={deleteConfirmAccount.profile.name}
                  className="w-8 h-8 rounded-full object-cover border border-rose-300"
                />
                <div>
                  <strong className="text-gray-900 block">{deleteConfirmAccount.profile.name}</strong>
                  <span className="text-gray-500 font-mono text-[11px]">{deleteConfirmAccount.email}</span>
                </div>
              </div>
              <p className="text-rose-900 leading-relaxed pt-1">
                Akun ini tidak akan dapat login lagi ke dalam sistem KOSTMANAGER.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmAccount(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 cursor-pointer text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm transition cursor-pointer text-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Ya, Hapus User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI BERSIHKAN DATA */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900">
                  Bersihkan Semua Data Contoh?
                </h3>
                <p className="text-[11px] text-gray-500">Mulai database kosong untuk properti Anda</p>
              </div>
            </div>

            <div className="my-4 p-3.5 bg-red-50/70 border border-red-200 rounded-xl text-xs space-y-2">
              <p className="text-gray-700 leading-relaxed font-medium">
                Semua data properti contoh, unit/kamar, penyewa demo, dan catatan tagihan contoh akan dihapus dari aplikasi.
              </p>
              <p className="text-gray-500 text-[11px]">
                Setelah dibersihkan, Anda dapat mulai mendaftarkan properti asli Anda melalui menu <strong>Properti</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 cursor-pointer text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onClearAllData) onClearAllData();
                  setIsClearModalOpen(false);
                  setSavedSuccess(true);
                  setTimeout(() => setSavedSuccess(false), 3000);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-sm transition cursor-pointer text-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Ya, Bersihkan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
