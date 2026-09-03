export type UserRole = "owner" | "property_manager" | "admin" | "finance" | "technician";

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  email: string;
  avatar: string;
  phone: string;
  assignedPropertyId?: string; // If manager/admin
}

export interface AuthAccount {
  id: string;
  email: string;
  phone: string;
  passwordHash: string;
  pin: string;
  profile: UserProfile;
}

export type PropertyCategory = "kost" | "rumah" | "parkir" | "ruko" | "tanah";

export interface Property {
  id: string;
  name: string;
  category?: PropertyCategory; // "kost" | "rumah" | "parkir" | "ruko" | "tanah"
  type: string; // "Campur" | "Putra" | "Putri" | "Eksekutif" | "Rumah Kontrakan" | "Townhouse" | "Paviliun" | "Lot Parkir Mobil" | "Lot Parkir Motor" | "Ruko 2 Lantai" | "Ruko 3 Lantai" | "Kavling Tanah" | "Lahan Komersial"
  location: string;
  address: string;
  city: string;
  totalRooms: number; // For kost: rooms, for rumah/ruko: units, for parkir: slots, for tanah: plots/kavling
  occupiedRooms: number;
  availableRooms: number;
  maintenanceRooms: number;
  occupancyRate: number; // e.g. 85.0
  image: string;
  priceRange: string;
  facilities: string[];
  managerName: string;
  managerPhone: string;
  bankAccount: {
    bank: string;
    accountNumber: string;
    accountHolder: string;
  };
  monthlyRevenue: number;
}

export type RoomStatus = "occupied" | "available" | "maintenance";
export type RoomType =
  | "Standard"
  | "Deluxe"
  | "VIP Suite"
  | "Executive Studio"
  | "Rumah 1 Lantai"
  | "Rumah 2 Lantai"
  | "Paviliun"
  | "Townhouse / Cluster"
  | "Slot Mobil"
  | "Slot Motor"
  | "Slot Bus / Truk"
  | "Ruko 1 Lantai"
  | "Ruko 2 Lantai"
  | "Ruko 3 Lantai"
  | "Ruko Sudut (Hook)"
  | "Kios / Stand Usaha"
  | "Kavling Tanah Siap Bangun"
  | "Lahan Komersial / Usaha"
  | "Tanah Pertanian / Perkebunan"
  | "Lahan Parkir / Gudang Terbuka"
  | string;

export interface Room {
  id: string;
  propertyId: string;
  propertyName: string;
  roomNumber: string; // e.g. A-101, Unit-1, Slot-P01
  floor: number;
  type: RoomType;
  status: RoomStatus;
  price: number;
  tenantId?: string;
  tenantName?: string;
  facilities: string[];
  size: string; // e.g. "4x4 m", "36/72 m²", "2.5 x 5 m"
  electricityMeter?: string;
  lastCleanedDate?: string;
  notes?: string;
}

export type TenantStatus = "active" | "due" | "overdue" | "checkout";

export interface Tenant {
  id: string;
  name: string;
  propertyId: string;
  propertyName: string;
  roomNumber: string;
  phone: string;
  email: string;
  idCardNumber: string; // KTP / NIK
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  checkInDate: string; // YYYY-MM-DD
  contractEndDate: string; // YYYY-MM-DD
  monthlyPrice: number;
  depositAmount: number;
  paymentStatus: TenantStatus;
  occupation: string; // Pekerjaan / Mahasiswa
  notes?: string;
  avatar?: string;
}

export type PaymentStatus = "paid" | "pending" | "overdue";
export type PaymentMethod = "Transfer BCA" | "Transfer Mandiri" | "QRIS Gopay/OVO" | "Tunai" | "Virtual Account";

export interface PaymentRecord {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  propertyId: string;
  propertyName: string;
  roomNumber: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  paidDate?: string;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  status: PaymentStatus;
  periodMonth?: string;
  billingPeriod?: "Bulanan" | "6 Bulanan" | "Tahunan" | string;
  category?: string;
  notes?: string;
  proofUrl?: string;
}

export type MaintenanceCategory = "Plumbing" | "AC" | "Electrical" | "Furniture" | "General Maintenance" | "General";
export type MaintenanceStatus = "new" | "in_progress" | "completed";
export type MaintenancePriority = "Urgent" | "High" | "Medium" | "Low";

export interface MaintenanceTicket {
  id: string;
  ticketNumber?: string;
  propertyId: string;
  propertyName: string;
  roomNumber: string;
  tenantName: string;
  category: MaintenanceCategory;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assignedTechnician: string;
  estimatedCompletionDate: string;
  createdAt?: string;
  reportedDate?: string;
  completedAt?: string;
  completedDate?: string;
  photos?: string[];
  photoUrl?: string;
  estimatedCost?: number;
  resolutionNotes?: string;
}

export type ContractStatus = "active" | "expiring_soon" | "expired" | "terminated";

export interface Contract {
  id: string;
  contractNumber: string;
  tenantId: string;
  tenantName: string;
  propertyId: string;
  propertyName: string;
  roomNumber: string;
  startDate: string;
  endDate: string;
  monthlyPrice?: number;
  monthlyRent?: number;
  deposit: number;
  status: ContractStatus;
  documentTitle?: string;
  documentUrl?: string;
  signedDate?: string;
  terms?: string;
}

export interface ReminderRule {
  id: string;
  daysBeforeOrAfter: number;
  triggerType: "before" | "exact" | "after";
  channel: "whatsapp" | "email";
  enabled: boolean;
  template: string;
}

export interface ReminderSetting {
  id: string;
  timingType: "7_days_before" | "due_date" | "3_days_after_overdue";
  title: string;
  defaultTemplate: string;
  whatsappEnabled: boolean;
  emailEnabled: boolean;
  inAppEnabled: boolean;
}

export interface ReminderLog {
  id: string;
  tenantName: string;
  roomNumber: string;
  propertyName: string;
  phone: string;
  type: string;
  channel: "WhatsApp" | "Email" | "In-App";
  sentAt: string;
  messageText: string;
  status: "Terkirim" | "Gagal" | "Dibaca";
}

export type NotificationCategory = "payment" | "contract" | "maintenance" | "room" | "ai" | "tenant" | "system";

export interface AppNotification {
  id: string;
  category?: NotificationCategory;
  type?: NotificationCategory;
  title: string;
  message: string;
  timestamp?: string;
  time?: string;
  read: boolean;
  linkTab?: string;
  actionUrl?: string;
  badgeType?: "info" | "success" | "warning" | "danger";
}

export interface AIInsight {
  id: string;
  category: "occupancy" | "vacancy" | "payment" | "revenue" | "pricing";
  title: string;
  badge: string;
  icon: string;
  description: string;
  metric: string;
  impact: "positive" | "warning" | "danger" | "info";
  actionText: string;
  actionTab: string;
}

export interface AIChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  source?: string;
  suggestedActions?: { label: string; actionTab: string }[];
}

export type ExpenseCategory =
  | "electricity"       // Biaya Listrik (Token PLN / Tagihan Listrik)
  | "water"             // Biaya Air (PDAM / Pompa / Air Bersih)
  | "security_cleaning" // Biaya Kebersihan & Keamanan (Iuran Sampah, Ronda, Satpam)
  | "management"        // Biaya Pengelolaan (Gaji Pengelola/Penjaga Kost, Fee Operasional)
  | "maintenance_repair"// Biaya Perbaikan & Perawatan (Tukang, Cat, AC Servis, Plumbing)
  | "internet_wifi"     // Biaya Internet & WiFi
  | "supplies"          // Perlengkapan & Operasional (Pembersih, Bohlam, Galon)
  | "taxes_permits"     // Pajak & Perizinan (PBB, Retribusi Lingkungan)
  | "other";            // Biaya Lain-lain

export interface ExpenseRecord {
  id: string;
  title: string;              // e.g. "Token Listrik Induk & Kamar A3", "Iuran Kebersihan & Satpam RT 04"
  category: ExpenseCategory;  // Kategori pengeluaran
  categoryLabel?: string;     // Label tampilan bahasa Indonesia
  amount: number;             // Nominal (Rp)
  date: string;               // Tanggal transaksi (YYYY-MM-DD)
  propertyId: string;         // ID Properti terkait
  propertyName: string;       // Nama Properti
  roomNumber?: string;        // Kamar/Unit spesifik atau "Fasilitas Bersama / Seluruh Properti"
  paymentMethod?: string;     // Transfer BCA, Mandiri, Tunai, QRIS, dll.
  recipient?: string;         // Penerima pembayaran (PLN, Pak RT, Petugas, Toko Bangunan)
  status: "paid" | "pending"; // Status: Lunas / Pending
  paidDate?: string;          // Tanggal lunas
  notes?: string;             // Catatan atau rincian pengeluaran
  proofUrl?: string;          // Bukti foto struk / nota / kwitansi
  invoiceNumber?: string;     // Nomor bukti / nota transaksi
  createdAt?: string;
}

export type ActiveTab =
  | "dashboard"
  | "properties"
  | "rooms"
  | "tenants"
  | "finance"
  | "reminders"
  | "maintenance"
  | "contracts"
  | "ai_assistant"
  | "notifications"
  | "analytics"
  | "settings";

