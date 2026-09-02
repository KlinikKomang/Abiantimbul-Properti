import React, { useState, useEffect, useRef } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  KeyRound,
  Shield,
  Building,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Sparkles,
  Upload,
  Camera,
  RefreshCw,
  Trash2,
  Image as ImageIcon
} from "lucide-react";
import { AuthAccount, UserProfile, UserRole, Property } from "../types";

// Helper to compress uploaded user avatar image
const compressAvatarFile = (file: File, maxDimension = 400, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: AuthAccount, isEdit: boolean) => void;
  editingAccount: AuthAccount | null;
  properties: Property[];
}

const DEFAULT_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
];

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAccount,
  properties,
}) => {
  const isEdit = Boolean(editingAccount);
  const isProtectedAdmin = editingAccount?.email.toLowerCase() === "gdeasbawaputra@gmail.com";

  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("admin");
  const [roleTitle, setRoleTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("123456");
  const [avatar, setAvatar] = useState(DEFAULT_AVATARS[0]);
  const [isCustomAvatar, setIsCustomAvatar] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const [avatarFileName, setAvatarFileName] = useState("");
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);

  const [assignedPropertyId, setAssignedPropertyId] = useState<string>("all");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (editingAccount) {
      setName(editingAccount.profile.name || "");
      setRole(editingAccount.profile.role || "admin");
      setRoleTitle(editingAccount.profile.roleTitle || "");
      setEmail(editingAccount.email || "");
      setPhone(editingAccount.phone || "");
      setPassword(editingAccount.passwordHash || "");
      setPin(editingAccount.pin || "123456");
      const currentAvatar = editingAccount.profile.avatar || DEFAULT_AVATARS[0];
      setAvatar(currentAvatar);
      setIsCustomAvatar(!DEFAULT_AVATARS.includes(currentAvatar));
      setAvatarFileName(!DEFAULT_AVATARS.includes(currentAvatar) ? "Foto Kustom Aktif" : "");
      setAssignedPropertyId(editingAccount.profile.assignedPropertyId || "all");
    } else {
      setName("");
      setRole("admin");
      setRoleTitle("Admin Operasional Kost");
      setEmail("");
      setPhone("+62 ");
      setPassword("user123");
      setPin("123456");
      const defaultAv = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
      setAvatar(defaultAv);
      setIsCustomAvatar(false);
      setAvatarFileName("");
      setAssignedPropertyId("all");
    }
    setErrorMessage(null);
  }, [editingAccount, isOpen]);

  const handleProcessAvatarFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Silakan pilih file gambar yang valid (JPG, PNG, WEBP).");
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setErrorMessage(null);
      const compressedDataUrl = await compressAvatarFile(file, 400, 0.85);
      setAvatar(compressedDataUrl);
      setIsCustomAvatar(true);
      setAvatarFileName(file.name);
    } catch (err) {
      console.error("Error processing avatar image:", err);
      setErrorMessage("Gagal memproses gambar avatar.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (!editingAccount || !roleTitle) {
      if (newRole === "owner") setRoleTitle("Pemilik Kost & Super Admin");
      else if (newRole === "property_manager") setRoleTitle("Property Manager Area");
      else if (newRole === "admin") setRoleTitle("Admin Operasional Kost");
      else if (newRole === "finance") setRoleTitle("Staff Keuangan & Kasir");
      else if (newRole === "technician") setRoleTitle("Koordinator Maintenance");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setErrorMessage("Silakan masukkan alamat email yang valid.");
      return;
    }

    if (!name.trim()) {
      setErrorMessage("Nama pengguna wajib diisi.");
      return;
    }

    if (password.length < 4) {
      setErrorMessage("Kata sandi minimal 4 karakter.");
      return;
    }

    if (pin.length < 4 || pin.length > 6) {
      setErrorMessage("Kode PIN harus 4 hingga 6 digit angka.");
      return;
    }

    const updatedProfile: UserProfile = {
      id: editingAccount ? editingAccount.id : `usr-${Date.now()}`,
      name: name.trim(),
      role,
      roleTitle: roleTitle.trim() || (role === "owner" ? "Pemilik Kost" : role),
      email: trimmedEmail,
      phone: phone.trim(),
      avatar,
      assignedPropertyId: assignedPropertyId === "all" ? undefined : assignedPropertyId,
    };

    const updatedAccount: AuthAccount = {
      id: updatedProfile.id,
      email: trimmedEmail,
      phone: phone.trim(),
      passwordHash: password,
      pin: pin.trim(),
      profile: updatedProfile,
    };

    onSave(updatedAccount, isEdit);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#7b1113] to-[#590b0d] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#facc15] text-[#7b1113] flex items-center justify-center font-black shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                {isEdit ? "Ubah Data & Kredensial User" : "Tambah User Login Baru"}
              </h3>
              <p className="text-xs text-amber-200/90 mt-0.5">
                {isEdit
                  ? `Mengedit akun: ${editingAccount?.profile.name}`
                  : "Buat akun login baru untuk tim staf, manajer, atau kasir"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-white/80 hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isProtectedAdmin && (
            <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Akun Super Administrator Utama:</strong> Alamat email utama ini memiliki hak akses tertinggi sebagai pemilik sistem KOSTMANAGER.
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nama Lengkap */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                Nama Lengkap User <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Hendra Wijaya"
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                />
              </div>
            </div>

            {/* Email Login */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                Alamat Email Login <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  disabled={isProtectedAdmin}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hendra@kostmanager.id"
                  className={`w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none ${
                    isProtectedAdmin ? "opacity-75 cursor-not-allowed bg-gray-100" : ""
                  }`}
                />
              </div>
            </div>

            {/* Nomor WhatsApp / Telepon */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">Nomor WhatsApp / HP</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+62 812-3456-7890"
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                />
              </div>
            </div>

            {/* Role / Jabatan */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                Hak Akses & Role <span className="text-rose-500">*</span>
              </label>
              <select
                disabled={isProtectedAdmin}
                value={role}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className={`w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none ${
                  isProtectedAdmin ? "opacity-75 cursor-not-allowed bg-gray-100" : ""
                }`}
              >
                {isProtectedAdmin ? (
                  <option value="owner">Pemilik Kost (Super Admin)</option>
                ) : (
                  <>
                    <option value="property_manager">Property Manager (Kelola Unit & Kamar)</option>
                    <option value="admin">Admin Operasional (Input Data & Surat)</option>
                    <option value="finance">Staff Finance (Kasir & Rekonsiliasi)</option>
                    <option value="technician">Teknisi / Maintenance</option>
                    <option value="owner">Super Admin (Hak Akses Penuh)</option>
                  </>
                )}
              </select>
            </div>

            {/* Title / Sebutan Jabatan */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">Sebutan Jabatan / Label</label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="Contoh: Manajer Area Ubud"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
              />
            </div>

            {/* Wilayah Tanggung Jawab / Properti */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">Wilayah / Properti Tanggung Jawab</label>
              <div className="relative">
                <Building className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <select
                  value={assignedPropertyId}
                  onChange={(e) => setAssignedPropertyId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                >
                  <option value="all">Semua Properti (Akses Global)</option>
                  {properties.map((prop) => (
                    <option key={prop.id} value={prop.id}>
                      {prop.name} ({prop.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Kredensial Keamanan: Password & PIN */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
            <h4 className="font-extrabold text-gray-900 text-xs flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#7b1113]" /> Kredensial Kata Sandi & Kode PIN
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Password */}
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Kata Sandi Login <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 4 karakter"
                    className="w-full pl-9 pr-9 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* PIN Code */}
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Kode PIN Akses Cepat (4-6 Digit) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="Contoh: 123456"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pilihan Foto Profil / Avatar */}
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#7b1113]" />
                Foto Profil Pengguna (Avatar)
              </label>
              <span className="text-[11px] text-gray-500 font-medium">
                Pilih avatar atau upload foto sendiri
              </span>
            </div>

            {/* Hidden Input for avatar file */}
            <input
              ref={avatarFileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleProcessAvatarFile(file);
              }}
              className="hidden"
            />

            {/* Upload Area & Active Avatar Display */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Active Avatar Preview with badge */}
              <div className="relative group shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#7b1113] ring-3 ring-amber-400/50 shadow-md bg-white">
                  <img src={avatar} alt="Active Avatar" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  title="Ganti Foto Profil"
                  className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#7b1113] text-[#facc15] flex items-center justify-center shadow-md hover:bg-[#630e10] transition cursor-pointer border border-white"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>

              {/* Upload Drop Zone / Button */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingAvatar(true);
                }}
                onDragLeave={() => setIsDraggingAvatar(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingAvatar(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleProcessAvatarFile(file);
                }}
                onClick={() => avatarFileInputRef.current?.click()}
                className={`flex-1 w-full border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition flex items-center justify-center gap-2.5 ${
                  isDraggingAvatar
                    ? "border-[#7b1113] bg-amber-50"
                    : "border-gray-300 hover:border-[#7b1113] hover:bg-white bg-white/70"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 text-[#7b1113] flex items-center justify-center shrink-0">
                  {isUploadingAvatar ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#7b1113]" />
                  ) : (
                    <Upload className="w-4 h-4 text-[#7b1113]" />
                  )}
                </div>
                <div className="text-left min-w-0">
                  <p className="font-bold text-gray-800 text-xs truncate">
                    {isUploadingAvatar ? "Mengunggah & Mengompres Foto..." : "Upload Foto Profil dari Perangkat"}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">
                    {avatarFileName ? `File: ${avatarFileName}` : "Klik / seret file foto JPG, PNG, WEBP ke sini"}
                  </p>
                </div>
              </div>
            </div>

            {/* Avatar Presets */}
            <div className="pt-2 border-t border-gray-200">
              <span className="text-[11px] font-semibold text-gray-600 block mb-1.5">
                Atau pilih avatar default:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {DEFAULT_AVATARS.map((imgUrl, idx) => {
                  const isSelected = avatar === imgUrl;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAvatar(imgUrl);
                        setIsCustomAvatar(false);
                        setAvatarFileName("");
                      }}
                      className={`relative w-9 h-9 rounded-full overflow-hidden border-2 transition cursor-pointer active:scale-95 ${
                        isSelected
                          ? "border-[#7b1113] ring-2 ring-amber-400 scale-105"
                          : "border-gray-200 hover:border-gray-400 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <img src={imgUrl} alt="Avatar option" className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#7b1113]/30 flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#facc15]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#7b1113] hover:bg-[#630e10] text-[#facc15] font-extrabold shadow-md transition flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <UserCheck className="w-4 h-4" />
              {isEdit ? "Simpan Perubahan User" : "Tambahkan User Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
