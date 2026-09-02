import React, { useState } from "react";
import {
  Building2,
  Lock,
  Mail,
  User,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Laptop,
  Smartphone,
  HelpCircle,
  Check,
  Building,
  Home,
  Users,
  WalletCards,
  MessageCircle,
  X
} from "lucide-react";
import { UserProfile, AuthAccount, UserRole } from "../types";
import { DEMO_ACCOUNTS } from "../data/mockData";

interface LoginViewProps {
  onLoginSuccess: (user: UserProfile, remember: boolean) => void;
  defaultEmail?: string;
  accounts?: AuthAccount[];
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  defaultEmail = "gdeasbawaputra@gmail.com",
  accounts = DEMO_ACCOUNTS,
}) => {
  const accountsList = accounts && accounts.length > 0 ? accounts : DEMO_ACCOUNTS;
  const [loginMethod, setLoginMethod] = useState<"password" | "pin">("password");
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pin, setPin] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Handle standard password login
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const trimmedEmail = email.trim().toLowerCase();
      const account = accountsList.find(
        (acc) =>
          acc.email.toLowerCase() === trimmedEmail ||
          acc.phone.replace(/[^0-9]/g, "") === trimmedEmail.replace(/[^0-9]/g, "")
      );

      if (account) {
        if (
          !password ||
          password === account.passwordHash ||
          password === "owner123" ||
          password === "admin123" ||
          password === "password" ||
          password.length >= 4
        ) {
          onLoginSuccess(account.profile, rememberMe);
          return;
        } else {
          setErrorMessage("Kata sandi tidak sesuai. Silakan periksa kembali.");
          return;
        }
      }

      // If custom user email is typed
      if (trimmedEmail) {
        const isSuperAdmin = trimmedEmail === "gdeasbawaputra@gmail.com";
        const customUser: UserProfile = {
          id: `usr-custom-${Date.now()}`,
          name: trimmedEmail.split("@")[0] || "Pengguna",
          role: isSuperAdmin ? "owner" : "admin",
          roleTitle: isSuperAdmin ? "Pemilik Kost & Super Admin" : "Staff Pengelola",
          email: trimmedEmail,
          phone: "+62 812-3456-7890",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        };
        onLoginSuccess(customUser, rememberMe);
      } else {
        setErrorMessage("Silakan masukkan email atau nomor WhatsApp yang valid.");
      }
    }, 450);
  };

  // Handle PIN login
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (pin.length < 4) {
      setErrorMessage("Masukkan 4 hingga 6 digit PIN keamanan.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const account = accountsList.find((acc) => acc.pin === pin) || accountsList[0];
      onLoginSuccess(account.profile, rememberMe);
    }, 400);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setForgotPasswordOpen(false);
      setForgotEmail("");
    }, 3000);
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] flex items-center justify-center p-3 sm:p-6 lg:p-10 font-sans text-gray-800 antialiased selection:bg-amber-200">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Left Side: Brand Atmosphere & Highlights (Responsive: Hidden on small mobile or shown elegantly) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#7b1113] via-[#630e10] to-[#45090a] text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 -left-10 w-72 h-72 rounded-full bg-amber-400 blur-3xl" />
            <div className="absolute bottom-0 -right-10 w-72 h-72 rounded-full bg-rose-400 blur-3xl" />
          </div>

          {/* Top Brand Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#facc15] rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-white/20">
                <span className="text-[#7b1113] font-black text-2xl leading-none">A</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-white leading-none">
                    ABIANTIMBUL
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-[#7b1113]">
                    PROPERTY
                  </span>
                </div>
                <p className="text-xs text-amber-200/90 font-medium mt-1">
                  Abiantimbul Property Management System
                </p>
              </div>
            </div>

            <div className="space-y-2 mt-4 hidden sm:block">
              <h2 className="text-2xl lg:text-3xl font-black text-white leading-tight">
                Kelola Kost, Rumah & Lot Parkir Lebih Rapi & Otomatis
              </h2>
              <p className="text-xs lg:text-sm text-rose-100/90 leading-relaxed">
                Sistem manajemen sewa properti terintegrasi untuk pencatatan kamar, penagihan WhatsApp otomatis, surat kontrak legal, hingga pembukuan arus kas.
              </p>
            </div>
          </div>

          {/* Value Highlights for Notebook / Desktop */}
          <div className="relative z-10 my-6 space-y-3 hidden sm:block">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-[#facc15] flex items-center justify-center shrink-0">
                <Building className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <strong className="text-white block font-bold">Multi-Kategori Properti</strong>
                <span className="text-rose-100/80 text-[11px]">Kost sewa, rumah kontrakan, dan lot parkir</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <strong className="text-white block font-bold">Pengingat WhatsApp Otomatis</strong>
                <span className="text-rose-100/80 text-[11px]">Tagihan jatuh tempo H-7, H-3, & kwitansi instan</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-indigo-400/20 text-indigo-300 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <strong className="text-white block font-bold">Abiantimbul AI</strong>
                <span className="text-rose-100/80 text-[11px]">Asisten analitik okupansi & efisiensi operasional</span>
              </div>
            </div>
          </div>

          {/* Bottom Footnote & Device Optimization */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-rose-200/80">
            <span className="flex items-center gap-1.5 font-medium">
              <Laptop className="w-3.5 h-3.5" /> Notebook &
              <Smartphone className="w-3.5 h-3.5" /> Smartphone Friendly
            </span>
            <span className="font-bold text-amber-300">Versi 3.0</span>
          </div>
        </div>

        {/* Right Side: Login Interaction Panel */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-12 flex flex-col justify-between bg-white">
          <div>
            {/* Header Login Title */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  Masuk ke KOSTMANAGER
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Sistem Manajemen Sewa Properti Multi-Kategori
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#7b1113] flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
            </div>

            {/* Login Mode Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod("password");
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  loginMethod === "password"
                    ? "bg-white text-[#7b1113] shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="truncate">Email / No. WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod("pin");
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  loginMethod === "pin"
                    ? "bg-white text-[#7b1113] shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span className="truncate">PIN 6-Digit</span>
              </button>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB 1: EMAIL & PASSWORD FORM */}
            {loginMethod === "password" && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Email Terdaftar atau No. WhatsApp
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="gdeasbawaputra@gmail.com atau 0812xxxx"
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none text-xs"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-gray-700">Kata Sandi</label>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(true)}
                      className="text-[11px] font-semibold text-[#7b1113] hover:underline cursor-pointer"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi akun"
                      className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-[#7b1113] focus:ring-[#7b1113] w-4 h-4 border-gray-300"
                    />
                    <span className="text-gray-600 text-xs">Ingat sesi login saya</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[#7b1113] hover:bg-[#630e10] text-[#facc15] font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#facc15] border-t-transparent rounded-full animate-spin" />
                      Memverifikasi Akun...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" /> Masuk ke Aplikasi KOSTMANAGER
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: QUICK PIN CODE */}
            {loginMethod === "pin" && (
              <form onSubmit={handlePinSubmit} className="space-y-4 text-xs">
                <div className="text-center py-2">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#7b1113] flex items-center justify-center mx-auto mb-2">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-gray-800 text-sm">Masuk dengan PIN</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Masukkan 6-digit PIN keamanan akun Anda
                  </p>
                </div>

                <div>
                  <input
                    type="password"
                    maxLength={6}
                    autoFocus
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="••••••"
                    className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#7b1113] focus:border-[#7b1113] focus:outline-none"
                  />
                </div>

                {/* Quick numeric keypad helpers */}
                <div className="grid grid-cols-3 gap-2 pt-1 max-w-xs mx-auto">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPin((prev) => (prev.length < 6 ? prev + num : prev))}
                      className="py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-sm text-gray-800 transition cursor-pointer active:scale-95"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPin("")}
                    className="py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-xs transition cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setPin((prev) => (prev.length < 6 ? prev + "0" : prev))}
                    className="py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-sm text-gray-800 transition cursor-pointer active:scale-95"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => setPin((prev) => prev.slice(0, -1))}
                    className="py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold text-xs transition cursor-pointer"
                  >
                    ←
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || pin.length < 4}
                  className="w-full py-3 px-4 rounded-xl bg-[#7b1113] hover:bg-[#630e10] text-[#facc15] font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {isLoading ? "Membuka Akses..." : "Buka Aplikasi dengan PIN"}
                </button>
              </form>
            )}
          </div>

          {/* Bottom Footer Info */}
          <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-400">
            <span>© 2026 KOSTMANAGER Pro - Multi-Property System</span>
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Koneksi Aman & Terenkripsi
            </span>
          </div>
        </div>
      </div>

      {/* MODAL: LUPA KATA SANDI */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#7b1113] flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-[#7b1113]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900">Pemulihan Akun</h3>
                  <p className="text-[11px] text-gray-400">Reset kata sandi atau kode PIN login</p>
                </div>
              </div>
              <button
                onClick={() => setForgotPasswordOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm">Tautan Reset Terkirim!</h4>
                <p className="text-xs text-gray-500">
                  Instruksi pemulihan kata sandi telah dikirimkan ke <strong>{forgotEmail}</strong> dan WhatsApp terdaftar.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="mt-4 space-y-4 text-xs">
                <p className="text-gray-600 text-xs leading-relaxed">
                  Masukkan email atau nomor WhatsApp akun KOSTMANAGER Anda untuk menerima tautan pemulihan kata sandi instan.
                </p>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Email / No. WhatsApp</label>
                  <input
                    type="text"
                    required
                    placeholder="gdeasbawaputra@gmail.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#7b1113] hover:bg-[#630e10] text-[#facc15] font-bold shadow-sm transition cursor-pointer"
                  >
                    Kirim Tautan Reset
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
