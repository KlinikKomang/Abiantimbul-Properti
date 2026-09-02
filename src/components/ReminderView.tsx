import React from "react";
import {
  MessageSquareShare,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Mail,
  Edit3,
  Copy,
  RefreshCw,
  BellRing,
  Sparkles,
  Sliders
} from "lucide-react";
import { ReminderRule, Tenant, PaymentRecord } from "../types";
import { formatRupiah } from "../data/mockData";

interface ReminderViewProps {
  tenants: Tenant[];
  payments: PaymentRecord[];
}

export const ReminderView: React.FC<ReminderViewProps> = ({ tenants, payments }) => {
  // Rules setup
  const [rules, setRules] = React.useState<ReminderRule[]>([
    {
      id: "rule-1",
      daysBeforeOrAfter: 7,
      triggerType: "before",
      channel: "whatsapp",
      enabled: true,
      template:
        "Halo {nama_penyewa}, kami dari pengelola {nama_kost} ingin menginfokan bahwa tagihan sewa kamar {nomor_kamar} sebesar {nominal} akan jatuh tempo 7 hari lagi pada tanggal {jatuh_tempo}. Pembayaran dapat ditransfer ke rekening BCA 8830-9988-11 a.n GDE ASBAWA PUTRA. Terima kasih!",
    },
    {
      id: "rule-2",
      daysBeforeOrAfter: 0,
      triggerType: "exact",
      channel: "whatsapp",
      enabled: true,
      template:
        "Halo {nama_penyewa}, hari ini adalah tanggal jatuh tempo pembayaran sewa kamar {nomor_kamar} di {nama_kost} ({nominal}). Mohon segera konfirmasi bukti transfer pembayaran agar kami dapat menerbitkan kwitansi resmi. Terima kasih banyak!",
    },
    {
      id: "rule-3",
      daysBeforeOrAfter: 3,
      triggerType: "after",
      channel: "whatsapp",
      enabled: true,
      template:
        "PERINGATAN PEMBAYARAN: Halo {nama_penyewa}, tagihan sewa kamar {nomor_kamar} di {nama_kost} sebesar {nominal} telah melewati jatuh tempo {jatuh_tempo} (terlambat 3 hari). Mohon segera menyelesaikan pembayaran hari ini untuk menghindari denda keterlambatan.",
    },
  ]);

  const [activeRuleIndex, setActiveRuleIndex] = React.useState(0);
  const [selectedTenantPreview, setSelectedTenantPreview] = React.useState<Tenant>(
    tenants.find((t) => t.paymentStatus === "overdue") || tenants[0]
  );
  const [copied, setCopied] = React.useState(false);

  const activeRule = rules[activeRuleIndex];

  // Generate preview text replacing placeholders
  const getRenderedMessage = (template: string, tenant: Tenant) => {
    return template
      .replace(/{nama_penyewa}/g, tenant.name)
      .replace(/{nama_kost}/g, tenant.propertyName)
      .replace(/{nomor_kamar}/g, tenant.roomNumber)
      .replace(/{nominal}/g, formatRupiah(tenant.monthlyPrice))
      .replace(/{jatuh_tempo}/g, "05 Agustus 2026");
  };

  const currentMessage = getRenderedMessage(activeRule.template, selectedTenantPreview);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleRule = (index: number) => {
    const updated = [...rules];
    updated[index].enabled = !updated[index].enabled;
    setRules(updated);
  };

  const handleUpdateTemplate = (text: string) => {
    const updated = [...rules];
    updated[activeRuleIndex].template = text;
    setRules(updated);
  };

  // Due & Overdue queue
  const pendingTenants = tenants.filter(
    (t) => t.paymentStatus === "due" || t.paymentStatus === "overdue"
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#800020]" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Otomasi Pengingat Tagihan (WhatsApp Reminder)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Sistem otomatisasi notifikasi WhatsApp & Email sebelum, saat, dan sesudah jatuh tempo sewa kost.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Gateway WhatsApp Aktif
          </span>
        </div>
      </div>

      {/* 3 Schedule Rules Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rules.map((rule, idx) => {
          const isSelected = activeRuleIndex === idx;
          return (
            <div
              key={rule.id}
              onClick={() => setActiveRuleIndex(idx)}
              className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-rose-50/50 border-[#800020] ring-2 ring-[#800020]/20 shadow-md"
                  : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      rule.triggerType === "before"
                        ? "bg-blue-100 text-blue-800"
                        : rule.triggerType === "exact"
                        ? "bg-amber-100 text-amber-900"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {rule.triggerType === "before"
                      ? "7 Hari Sebelum"
                      : rule.triggerType === "exact"
                      ? "Hari H Jatuh Tempo"
                      : "3 Hari Setelah (Overdue)"}
                  </span>

                  {/* Toggle switch */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleRule(idx);
                    }}
                    className={`w-9 h-5 rounded-full p-0.5 transition ${
                      rule.enabled ? "bg-[#800020]" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        rule.enabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900">
                  {rule.triggerType === "before"
                    ? "Pengingat Dini (H-7)"
                    : rule.triggerType === "exact"
                    ? "Pengingat Tepat Waktu (H-0)"
                    : "Peringatan Menunggak (H+3)"}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {rule.template}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/60 mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp & Email
                </span>
                <span
                  className={`font-bold text-[11px] ${
                    isSelected ? "text-[#800020]" : "text-slate-500"
                  }`}
                >
                  {isSelected ? "Sedang Diedit" : "Klik untuk Edit"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor & Live WhatsApp Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Template Editor (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-50 text-[#800020]">
                <Edit3 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-800">
                Edit Template Pesan ({activeRule.triggerType === "before" ? "H-7" : activeRule.triggerType === "exact" ? "H-0" : "H+3"})
              </h3>
            </div>
            <span className="text-xs text-slate-400">Variabel dinamis didukung</span>
          </div>

          {/* Placeholders helper chips */}
          <div>
            <span className="text-[11px] text-slate-400 block mb-1.5 font-semibold">
              Klik tag untuk menyisipkan variabel otomatis:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                "{nama_penyewa}",
                "{nama_kost}",
                "{nomor_kamar}",
                "{nominal}",
                "{jatuh_tempo}",
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleUpdateTemplate(activeRule.template + " " + chip)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-[#800020] text-slate-700 font-mono text-[11px] font-bold transition border border-slate-200"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div>
            <textarea
              rows={6}
              value={activeRule.template}
              onChange={(e) => handleUpdateTemplate(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none text-xs text-slate-800 font-sans leading-relaxed"
            />
          </div>

          {/* Preview Tenant Selector */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Uji simulasi untuk:</span>
              <select
                value={selectedTenantPreview.id}
                onChange={(e) => {
                  const t = tenants.find((item) => item.id === e.target.value);
                  if (t) setSelectedTenantPreview(t);
                }}
                className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-bold"
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (Kamar {t.roomNumber})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCopyMessage}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? "Tersalin!" : "Salin Teks"}
            </button>
          </div>
        </div>

        {/* Right: WhatsApp Phone Simulator Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-sm bg-slate-900 rounded-3xl p-3 shadow-2xl border-4 border-slate-800">
            {/* Top phone notch */}
            <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2" />

            {/* WA Screen Header */}
            <div className="bg-[#075E54] text-white p-3 rounded-t-2xl flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs ring-1 ring-amber-300">
                KM
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs truncate">KOSTMANAGER Official</div>
                <div className="text-[10px] text-emerald-200">Online • Layanan Pengelola Kost</div>
              </div>
            </div>

            {/* WA Chat Body */}
            <div className="bg-[#ECE5DD] p-3.5 min-h-[220px] max-h-[260px] overflow-y-auto space-y-2 text-xs">
              <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 text-slate-800 leading-relaxed relative">
                <div className="text-[10px] font-bold text-[#800020] mb-1 flex items-center gap-1">
                  <BellRing className="w-3 h-3 text-[#800020]" /> Pengingat Otomatis KOSTMANAGER
                </div>
                <p className="whitespace-pre-line text-[11px] text-slate-700">{currentMessage}</p>
                <div className="text-[9px] text-slate-400 text-right mt-1.5 flex items-center justify-end gap-1">
                  10:45 <span className="text-blue-500 font-bold">✓✓</span>
                </div>
              </div>
            </div>

            {/* WA Screen Footer Action */}
            <div className="bg-white p-2.5 rounded-b-2xl border-t border-slate-200 flex items-center gap-2">
              <a
                href={`https://wa.me/${selectedTenantPreview.phone.replace(
                  /[^0-9]/g,
                  ""
                )}?text=${encodeURIComponent(currentMessage)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                Kirim WhatsApp ke {selectedTenantPreview.name}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Action Queue: Pending & Overdue Tenants List */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-100 text-[#800020]">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">
                Daftar Antrean Pengingat Aktif ({pendingTenants.length} Penyewa)
              </h3>
              <p className="text-xs text-slate-400">Penyewa yang mendekati atau telah melewati jatuh tempo pembayaran</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Penyewa</th>
                <th className="pb-3 px-3">Kost / Kamar</th>
                <th className="pb-3 px-3">Tagihan</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Kontak WA</th>
                <th className="pb-3 px-3 text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {pendingTenants.map((t) => {
                const message = getRenderedMessage(activeRule.template, t);
                return (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-bold text-slate-900">{t.name}</td>
                    <td className="py-3 px-3">
                      {t.propertyName} (Kamar {t.roomNumber})
                    </td>
                    <td className="py-3 px-3 font-bold text-[#800020]">
                      {formatRupiah(t.monthlyPrice)}
                    </td>
                    <td className="py-3 px-3">
                      {t.paymentStatus === "overdue" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          🔴 Overdue
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          🟡 Payment Due
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">{t.phone}</td>
                    <td className="py-3 px-3 text-right">
                      <a
                        href={`https://wa.me/${t.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          message
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#800020] hover:bg-[#68001a] text-white font-bold text-xs transition shadow-xs"
                      >
                        <Send className="w-3 h-3 text-amber-300" /> Kirim Reminder
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
