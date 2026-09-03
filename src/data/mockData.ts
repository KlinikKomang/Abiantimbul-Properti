import {
  Property,
  Room,
  Tenant,
  PaymentRecord,
  MaintenanceTicket,
  Contract,
  ReminderSetting,
  ReminderLog,
  AppNotification,
  AIInsight,
  UserProfile,
  AuthAccount,
  ExpenseRecord,
  ExpenseCategory,
} from "../types";

export const INITIAL_USER: UserProfile = {
  id: "usr-owner-1",
  name: "Pak Gde",
  role: "owner",
  roleTitle: "Pemilik Kost & Super Admin",
  email: "gdeasbawaputra@gmail.com",
  phone: "+62 812-3456-7890",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
};

export const MOCK_USER = INITIAL_USER;

export const DEMO_ACCOUNTS: AuthAccount[] = [
  {
    id: "usr-owner-1",
    email: "gdeasbawaputra@gmail.com",
    phone: "+62 812-3456-7890",
    passwordHash: "owner123",
    pin: "123456",
    profile: {
      id: "usr-owner-1",
      name: "Pak Gde",
      role: "owner",
      roleTitle: "Pemilik Kost & Super Admin",
      email: "gdeasbawaputra@gmail.com",
      phone: "+62 812-3456-7890",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
  },
  {
    id: "usr-mgr-1",
    email: "manager@kostmanager.id",
    phone: "+62 813-8899-1122",
    passwordHash: "manager123",
    pin: "123456",
    profile: {
      id: "usr-mgr-1",
      name: "Hendra Wijaya",
      role: "property_manager",
      roleTitle: "Property Manager Area",
      email: "manager@kostmanager.id",
      phone: "+62 813-8899-1122",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
  },
  {
    id: "usr-adm-1",
    email: "admin@kostmanager.id",
    phone: "+62 819-2233-4455",
    passwordHash: "admin123",
    pin: "123456",
    profile: {
      id: "usr-adm-1",
      name: "Rina Marlina",
      role: "admin",
      roleTitle: "Admin Operasional Kost",
      email: "admin@kostmanager.id",
      phone: "+62 819-2233-4455",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
  },
  {
    id: "usr-fin-1",
    email: "finance@kostmanager.id",
    phone: "+62 878-1122-3344",
    passwordHash: "finance123",
    pin: "123456",
    profile: {
      id: "usr-fin-1",
      name: "Sari Wulandari, S.Ak.",
      role: "finance",
      roleTitle: "Staff Keuangan & Kasir",
      email: "finance@kostmanager.id",
      phone: "+62 878-1122-3344",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  },
  {
    id: "usr-tech-1",
    email: "teknisi@kostmanager.id",
    phone: "+62 856-7788-9900",
    passwordHash: "teknisi123",
    pin: "123456",
    profile: {
      id: "usr-tech-1",
      name: "Budi Santoso",
      role: "technician",
      roleTitle: "Koordinator Maintenance",
      email: "teknisi@kostmanager.id",
      phone: "+62 856-7788-9900",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    },
  },
];

export const AVAILABLE_ROLES: { role: UserProfile["role"]; title: string; desc: string }[] = [
  { role: "owner", title: "Pemilik Kost (Pak Gde)", desc: "Akses penuh seluruh properti, laporan keuangan, dan AI" },
  { role: "property_manager", title: "Property Manager", desc: "Mengelola properti tertentu & operasional kamar" },
  { role: "admin", title: "Admin Kost", desc: "Mengelola data kamar, penyewa, dan operasional harian" },
  { role: "finance", title: "Finance / Keuangan", desc: "Mengelola penagihan, kwitansi, dan laporan arus kas" },
  { role: "technician", title: "Teknisi / Maintenance", desc: "Melihat & memperbarui status tiket perbaikan" },
];

// Identifiers for sample/demo data to ensure clean removal
export const SAMPLE_PROPERTY_IDS: string[] = ["prop-1", "prop-2", "prop-3", "prop-4", "prop-5"];
export const SAMPLE_PROPERTY_NAMES: string[] = [
  "Kost Harmoni Residence",
  "Graha Asri Townhouse",
  "Harmoni Parking Hub",
  "Ruko Niaga Abiantimbul",
  "Kavling Lahan Abiantimbul",
];

// Clean initial datasets (Default kosong - hanya menyimpan data & properti yang diinput oleh user)
export const INITIAL_PROPERTIES: Property[] = [];
export const INITIAL_ROOMS: Room[] = [];
export const INITIAL_TENANTS: Tenant[] = [];
export const INITIAL_PAYMENTS: PaymentRecord[] = [];
export const INITIAL_MAINTENANCE: MaintenanceTicket[] = [];
export const INITIAL_MAINTENANCE_TICKETS = INITIAL_MAINTENANCE;
export const INITIAL_CONTRACTS: Contract[] = [];
export const INITIAL_EXPENSES: ExpenseRecord[] = [];

export const EXPENSE_CATEGORIES: {
  key: ExpenseCategory;
  label: string;
  desc: string;
}[] = [
  { key: "electricity", label: "Biaya Listrik", desc: "Token PLN, meteran kamar, abonemen listrik induk" },
  { key: "security_cleaning", label: "Kebersihan & Keamanan", desc: "Iuran sampah, keamanan lingkungan, ronda RT/RW, satpam" },
  { key: "management", label: "Biaya Pengelolaan", desc: "Gaji penjaga kost, admin operasional, fee manajer properti" },
  { key: "water", label: "Biaya Air", desc: "Tagihan PDAM, isi tangki air bersih, servis pompa air" },
  { key: "maintenance_repair", label: "Perbaikan & Servis", desc: "Biaya tukang, cat ulang, servis rutin AC, instalasi listrik/plumbing" },
  { key: "internet_wifi", label: "Internet & WiFi", desc: "Tagihan langganan internet wifi bulanan kost" },
  { key: "supplies", label: "Perlengkapan Operasional", desc: "Cairan pembersih lantai, sabun, sapu, galon air bersama, lampu bohlam" },
  { key: "taxes_permits", label: "Pajak & Retribusi", desc: "PBB tahunan, retribusi daerah, izin lingkungan sewa" },
  { key: "other", label: "Biaya Lain-lain", desc: "Biaya administrasi bank, konsumsi rapat, pengeluaran tak terduga" },
];

export const INITIAL_REMINDER_SETTINGS: ReminderSetting[] = [
  {
    id: "rem-1",
    timingType: "7_days_before",
    title: "Pengingat H-7 Jatuh Tempo",
    defaultTemplate:
      "Halo {nama_penyewa}, kami mengingatkan bahwa tagihan sewa kamar {nomor_kamar} di {nama_kost} sebesar {nominal} akan jatuh tempo pada {jatuh_tempo}. Terima kasih.",
    whatsappEnabled: true,
    emailEnabled: true,
    inAppEnabled: true,
  },
  {
    id: "rem-2",
    timingType: "due_date",
    title: "Pengingat Hari H Jatuh Tempo",
    defaultTemplate:
      "Selamat pagi {nama_penyewa}, pembayaran sewa kamar {nomor_kamar} ({nama_kost}) sebesar {nominal} jatuh tempo HARI INI ({jatuh_tempo}). Silakan transfer ke rekening {rekening_kost}. Terima kasih!",
    whatsappEnabled: true,
    emailEnabled: true,
    inAppEnabled: true,
  },
  {
    id: "rem-3",
    timingType: "3_days_after_overdue",
    title: "Peringatan H+3 Melewati Jatuh Tempo (Overdue)",
    defaultTemplate:
      "Yth. {nama_penyewa}, tagihan sewa kamar {nomor_kamar} ({nama_kost}) sebesar {nominal} telah melewati jatuh tempo sejak {jatuh_tempo}. Mohon segera melakukan pembayaran atau konfirmasi ke Admin {telepon_admin}. Terima kasih.",
    whatsappEnabled: true,
    emailEnabled: false,
    inAppEnabled: true,
  },
];

export const INITIAL_REMINDER_LOGS: ReminderLog[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const INITIAL_AI_INSIGHTS: AIInsight[] = [];

// Helper currency formatter
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}
