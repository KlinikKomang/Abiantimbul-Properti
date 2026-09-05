import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Zap,
  Droplets,
  ShieldCheck,
  Briefcase,
  Wrench,
  Wifi,
  Package,
  FileText,
  MoreHorizontal,
  CreditCard,
  Building2,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  Camera,
  Search,
  Filter,
  Sparkles,
  Check,
} from "lucide-react";
import { ExpenseRecord, ExpenseCategory, Property, Room } from "../types";
import { EXPENSE_CATEGORIES, formatRupiah } from "../data/mockData";
import { ProofUploader } from "./ProofUploader";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (expense: ExpenseRecord) => void;
  properties: Property[];
  rooms?: Room[];
  selectedPropertyId?: string;
  expenseToEdit?: ExpenseRecord | null;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSaveExpense,
  properties,
  rooms = [],
  selectedPropertyId,
  expenseToEdit,
}) => {
  const [propertyId, setPropertyId] = useState<string>(
    expenseToEdit?.propertyId || (selectedPropertyId && selectedPropertyId !== "all" ? selectedPropertyId : properties[0]?.id || "")
  );
  const [roomNumber, setRoomNumber] = useState<string>(expenseToEdit?.roomNumber || "Seluruh Properti / Umum");
  const [category, setCategory] = useState<ExpenseCategory>(expenseToEdit?.category || "electricity");
  const [title, setTitle] = useState<string>(expenseToEdit?.title || "");
  const [amount, setAmount] = useState<number>(expenseToEdit?.amount || 250000);
  const [date, setDate] = useState<string>(expenseToEdit?.date || new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>(expenseToEdit?.paymentMethod || "Transfer BCA");
  const [recipient, setRecipient] = useState<string>(expenseToEdit?.recipient || "");
  const [status, setStatus] = useState<"paid" | "pending">(expenseToEdit?.status || "paid");
  const [notes, setNotes] = useState<string>(expenseToEdit?.notes || "");
  const [proofUrl, setProofUrl] = useState<string | undefined>(expenseToEdit?.proofUrl);
  const [invoiceNumber, setInvoiceNumber] = useState<string>(expenseToEdit?.invoiceNumber || "");

  // In-form filter states
  const [categoryFilterQuery, setCategoryFilterQuery] = useState<string>("");
  const [roomSearchQuery, setRoomSearchQuery] = useState<string>("");

  const QUICK_TEMPLATES = [
    { label: "⚡ Token PLN", category: "electricity" as ExpenseCategory, title: "Token Listrik Induk & Fasilitas Bersama", amount: 250000, recipient: "PLN Mobile" },
    { label: "💧 Air PDAM", category: "water" as ExpenseCategory, title: "Tagihan Air PDAM Bulanan", amount: 150000, recipient: "PDAM Tirta Mangutama" },
    { label: "🛡️ Iuran RT & Sampah", category: "security_cleaning" as ExpenseCategory, title: "Iuran Keamanan & Sampah Warga RT/RW", amount: 100000, recipient: "Pak RT / Bendahara Lingkungan" },
    { label: "💼 Gaji Penjaga", category: "management" as ExpenseCategory, title: "Gaji Pengelola & Penjaga Kost", amount: 1500000, recipient: "Penjaga Kost" },
    { label: "🌐 WiFi Kost", category: "internet_wifi" as ExpenseCategory, title: "Langganan WiFi Internet Kost Bulanan", amount: 375000, recipient: "Provider Internet" },
    { label: "🔧 Servis AC", category: "maintenance_repair" as ExpenseCategory, title: "Cuci & Servis AC Rutin", amount: 150000, recipient: "Teknisi AC" },
    { label: "🧹 Perlengkapan", category: "supplies" as ExpenseCategory, title: "Pembelian Sabun Pel, Sapu & Bohlam", amount: 85000, recipient: "Toko Perlengkapan" },
  ];

  // Reset or sync form state when editing changes
  useEffect(() => {
    if (expenseToEdit) {
      setPropertyId(expenseToEdit.propertyId);
      setRoomNumber(expenseToEdit.roomNumber || "Seluruh Properti / Umum");
      setCategory(expenseToEdit.category);
      setTitle(expenseToEdit.title);
      setAmount(expenseToEdit.amount);
      setDate(expenseToEdit.date);
      setPaymentMethod(expenseToEdit.paymentMethod || "Transfer BCA");
      setRecipient(expenseToEdit.recipient || "");
      setStatus(expenseToEdit.status);
      setNotes(expenseToEdit.notes || "");
      setProofUrl(expenseToEdit.proofUrl);
      setInvoiceNumber(expenseToEdit.invoiceNumber || "");
    } else {
      const defaultPropId = selectedPropertyId && selectedPropertyId !== "all" ? selectedPropertyId : properties[0]?.id || "";
      setPropertyId(defaultPropId);
      setRoomNumber("Seluruh Properti / Umum");
      setCategory("electricity");
      setTitle("Token Listrik Induk & Fasilitas Umum");
      setAmount(250000);
      setDate(new Date().toISOString().split("T")[0]);
      setPaymentMethod("Transfer BCA");
      setRecipient("PLN Mobile");
      setStatus("paid");
      setNotes("");
      setProofUrl(undefined);
      setInvoiceNumber(`EXP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [expenseToEdit, isOpen, properties, selectedPropertyId]);

  if (!isOpen) return null;

  // Selected property rooms
  const propertyRooms = rooms.filter((r) => r.propertyId === propertyId);

  // Quick preset title generator based on category
  const handleCategoryChange = (newCat: ExpenseCategory) => {
    setCategory(newCat);
    // Suggest appropriate title and recipient if empty or still on default
    if (!expenseToEdit) {
      switch (newCat) {
        case "electricity":
          setTitle("Token Listrik Induk & Fasilitas Bersama");
          setRecipient("PLN Mobile");
          break;
        case "security_cleaning":
          setTitle("Iuran Kebersihan & Keamanan Lingkungan RT/RW");
          setRecipient("Pak RT / Petugas Kebersihan");
          break;
        case "management":
          setTitle("Gaji Pengelola / Penjaga Kost Bulan Ini");
          setRecipient("Penjaga Kost");
          break;
        case "water":
          setTitle("Tagihan Air PDAM / Pengisian Toren Air");
          setRecipient("PDAM / Vendor Air Bersih");
          break;
        case "internet_wifi":
          setTitle("Langganan Internet WiFi Kost Bulanan");
          setRecipient("Provider Internet (Indihome/Biznet)");
          break;
        case "maintenance_repair":
          setTitle("Servis & Pembersihan AC Rutin / Tukang");
          setRecipient("Teknisi Servis");
          break;
        case "supplies":
          setTitle("Pembelian Sabun Pembersih, Sapu & Bohlam");
          setRecipient("Toko Perlengkapan");
          break;
        case "taxes_permits":
          setTitle("Pajak Bumi dan Bangunan (PBB) / Retribusi");
          setRecipient("Bapenda / Kas Daerah");
          break;
        case "other":
          setTitle("Operasional & Pengeluaran Lainnya");
          setRecipient("");
          break;
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Silakan masukkan judul atau rincian pengeluaran");
      return;
    }
    if (amount <= 0) {
      alert("Nominal pengeluaran harus lebih besar dari Rp 0");
      return;
    }

    const currentProp = properties.find((p) => p.id === propertyId) || properties[0];
    const catObj = EXPENSE_CATEGORIES.find((c) => c.key === category);

    const expenseData: ExpenseRecord = {
      id: expenseToEdit ? expenseToEdit.id : `exp-${Date.now()}`,
      title: title.trim(),
      category,
      categoryLabel: catObj?.label || category,
      amount: Number(amount),
      date,
      propertyId: currentProp?.id || "prop-default",
      propertyName: currentProp?.name || "Properti",
      roomNumber: roomNumber === "Seluruh Properti / Umum" ? undefined : roomNumber,
      paymentMethod,
      recipient: recipient.trim() ? recipient.trim() : undefined,
      status,
      paidDate: status === "paid" ? date : undefined,
      notes: notes.trim() ? notes.trim() : undefined,
      proofUrl,
      invoiceNumber: invoiceNumber.trim() ? invoiceNumber.trim() : `EXP-${Date.now().toString().slice(-6)}`,
      createdAt: expenseToEdit?.createdAt || new Date().toISOString(),
    };

    onSaveExpense(expenseData);
    onClose();
  };

  const getCategoryIcon = (catKey: ExpenseCategory) => {
    switch (catKey) {
      case "electricity":
        return <Zap className="w-3.5 h-3.5 text-amber-500" />;
      case "security_cleaning":
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
      case "management":
        return <Briefcase className="w-3.5 h-3.5 text-indigo-600" />;
      case "water":
        return <Droplets className="w-3.5 h-3.5 text-cyan-600" />;
      case "maintenance_repair":
        return <Wrench className="w-3.5 h-3.5 text-rose-600" />;
      case "internet_wifi":
        return <Wifi className="w-3.5 h-3.5 text-blue-600" />;
      case "supplies":
        return <Package className="w-3.5 h-3.5 text-purple-600" />;
      case "taxes_permits":
        return <FileText className="w-3.5 h-3.5 text-orange-600" />;
      default:
        return <MoreHorizontal className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-300">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">
                {expenseToEdit ? "Edit Pengeluaran Operasional" : "Catat Pengeluaran Baru"}
              </h2>
              <p className="text-[11px] text-slate-300">
                Catat biaya listrik, kebersihan, keamanan, gaji penjaga, air, wifi & perbaikan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Quick Preset Templates Filter */}
          <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#800020] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Pintasan & Template Cepat Pengeluaran
              </span>
              <span className="text-[10px] text-slate-400">Klik untuk isi otomatis</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {QUICK_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCategory(tmpl.category);
                    setTitle(tmpl.title);
                    setAmount(tmpl.amount);
                    setRecipient(tmpl.recipient);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-rose-200/80 hover:border-[#800020] hover:bg-rose-100/50 text-slate-800 text-[11px] font-bold shrink-0 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <span>{tmpl.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 1. Category Selection Grid with Filter */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700">
                Kategori Pengeluaran <span className="text-rose-500">*</span>
              </label>
              <div className="relative w-44">
                <input
                  type="text"
                  placeholder="Filter kategori..."
                  value={categoryFilterQuery}
                  onChange={(e) => setCategoryFilterQuery(e.target.value)}
                  className="w-full pl-6 pr-5 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#800020] text-slate-700 font-medium"
                />
                <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                {categoryFilterQuery && (
                  <button
                    type="button"
                    onClick={() => setCategoryFilterQuery("")}
                    className="absolute right-1.5 top-1.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {EXPENSE_CATEGORIES.filter((c) => {
                if (!categoryFilterQuery.trim()) return true;
                const q = categoryFilterQuery.toLowerCase();
                return c.label.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q);
              }).map((cat) => {
                const isSelected = category === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => handleCategoryChange(cat.key)}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition cursor-pointer ${
                      isSelected
                        ? "border-[#800020] bg-rose-50/70 text-slate-900 shadow-xs ring-2 ring-[#800020]/20 font-bold"
                        : "border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-white shadow-xs shrink-0 mt-0.5">
                      {getCategoryIcon(cat.key)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold leading-tight truncate">{cat.label}</div>
                      <div className="text-[9px] text-slate-400 leading-tight mt-0.5 line-clamp-1">{cat.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Property & Room Allocation with Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Lokasi Properti <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none font-medium text-slate-800 cursor-pointer"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">
                  Unit / Fasilitas
                </label>
                {propertyRooms.length > 3 && (
                  <div className="relative w-28">
                    <input
                      type="text"
                      placeholder="Cari kamar..."
                      value={roomSearchQuery}
                      onChange={(e) => setRoomSearchQuery(e.target.value)}
                      className="w-full pl-5 pr-2 py-0.5 text-[10px] bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#800020]"
                    />
                    <Search className="w-2.5 h-2.5 text-slate-400 absolute left-1.5 top-1.5" />
                  </div>
                )}
              </div>
              <select
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none font-medium text-slate-800 cursor-pointer"
              >
                <option value="Seluruh Properti / Umum">Seluruh Properti / Fasilitas Bersama</option>
                {propertyRooms
                  .filter((r) => {
                    if (!roomSearchQuery.trim()) return true;
                    const q = roomSearchQuery.toLowerCase();
                    return r.roomNumber.toLowerCase().includes(q) || r.type.toLowerCase().includes(q);
                  })
                  .map((r) => (
                    <option key={r.id} value={`Kamar ${r.roomNumber}`}>
                      Unit/Kamar {r.roomNumber} ({r.type})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* 3. Title / Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Judul / Rincian Pengeluaran <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Token Listrik Induk Blok A, Iuran Satpam & Kebersihan September"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none text-slate-900 font-semibold"
            />
          </div>

          {/* 4. Nominal Amount & Preset Shortcuts */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">
                Nominal Biaya (Rp) <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs font-black text-rose-700">
                {formatRupiah(amount || 0)}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">Rp</span>
              <input
                type="number"
                required
                min={1000}
                step={5000}
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none text-base font-black text-slate-900"
              />
            </div>
            {/* Quick Nominal Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] text-slate-400 self-center mr-1">Pintasan:</span>
              {[50000, 100000, 250000, 500000, 1000000, 2000000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                    amount === preset
                      ? "bg-[#800020] text-white border-[#800020]"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                  }`}
                >
                  {preset >= 1000000 ? `${preset / 1000000} Jt` : `${preset / 1000} Rb`}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tanggal Transaksi <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none text-slate-800 font-medium cursor-pointer"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Metode Pembayaran
              </label>
              <div className="relative">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none text-slate-800 font-medium cursor-pointer"
                >
                  <option value="Transfer BCA">Transfer BCA</option>
                  <option value="Transfer Mandiri">Transfer Mandiri</option>
                  <option value="Transfer BRI">Transfer BRI</option>
                  <option value="Transfer BNI">Transfer BNI</option>
                  <option value="Tunai / Cash">Tunai / Cash</option>
                  <option value="QRIS / E-Wallet">QRIS / E-Wallet</option>
                  <option value="Virtual Account">Virtual Account</option>
                </select>
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* 6. Recipient & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Penerima / Vendor / Petugas
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. PLN Mobile, Pak RT Made, Pak Budi Penjaga"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none text-slate-800 font-medium"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Status Pembayaran <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus("paid")}
                  className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    status === "paid"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Lunas
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("pending")}
                  className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    status === "pending"
                      ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Pending
                </button>
              </div>
            </div>
          </div>

          {/* 7. Reference Number & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                No. Bukti / Struk / Nota (Opsional)
              </label>
              <input
                type="text"
                placeholder="No. Referensi PLN / No. Nota Toko"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none text-slate-800 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Catatan Tambahan
              </label>
              <input
                type="text"
                placeholder="Keterangan tambahan jika ada"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none text-slate-800 font-medium"
              />
            </div>
          </div>

          {/* 8. Upload Receipt Photo via ProofUploader */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-[#800020]" />
              Foto Bukti Struk / Nota / Kwitansi Pengeluaran
            </label>
            <ProofUploader
              value={proofUrl}
              onChange={setProofUrl}
              label="Unggah atau Foto Struk Nota / Kwitansi Pengeluaran"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#800020] to-[#991b1b] hover:from-[#6b001b] hover:to-[#881337] text-white font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              {expenseToEdit ? "Simpan Perubahan" : "Simpan Pengeluaran"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
