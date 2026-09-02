import React from "react";
import {
  X,
  Printer,
  Download,
  Building2,
  CheckCircle2,
  Share2,
  Sparkles,
  FileCheck,
} from "lucide-react";
import { PaymentRecord, Property } from "../types";
import { formatRupiah } from "../data/mockData";

interface ReceiptModalProps {
  payment: PaymentRecord;
  property?: Property;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  payment,
  property,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[95vh] overflow-y-auto relative">
        {/* Top actions bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#800020] bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              Kwitansi Digital Resmi
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
              title="Cetak Kwitansi"
            >
              <Printer className="w-4 h-4" /> Cetak
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="border-2 border-slate-800 rounded-2xl p-6 sm:p-8 bg-white relative">
          {/* Watermark "LUNAS" */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none">
            <span className="text-8xl font-black text-emerald-800 -rotate-25 tracking-widest">
              LUNAS
            </span>
          </div>

          {/* Receipt Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#800020] flex items-center justify-center text-amber-300 shadow-md">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  {payment.propertyName.toUpperCase()}
                </h2>
                <p className="text-[11px] text-slate-500">
                  Sistem Manajemen Kost & Hunian Modern
                </p>
                <p className="text-[10px] text-slate-400">
                  {property?.address || "Jakarta, Indonesia"}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono font-bold text-[#800020]">
                {payment.invoiceNumber}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Tanggal: {payment.paymentDate || "31 Agustus 2026"}
              </div>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase">
                ✓ LUNAS (PAID)
              </span>
            </div>
          </div>

          {/* Receipt Body */}
          <div className="py-5 space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Telah Diterima Dari:</span>
              <strong className="text-slate-900 text-sm font-black">{payment.tenantName}</strong>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Unit / Kamar:</span>
              <strong className="text-[#800020] font-bold">Kamar {payment.roomNumber}</strong>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Untuk Pembayaran:</span>
              <span className="text-slate-800 font-semibold">
                {payment.category || "Sewa Kamar / Unit"} {payment.billingPeriod ? `(${payment.billingPeriod})` : ""}
              </span>
            </div>

            {payment.billingPeriod && (
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Periode Tagihan:</span>
                <span className="px-2 py-0.5 rounded-md bg-rose-50 text-[#800020] font-bold text-[11px] border border-rose-200">
                  {payment.billingPeriod}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Metode Pembayaran:</span>
              <span className="text-slate-800 font-semibold">{payment.paymentMethod || "Transfer Bank"}</span>
            </div>

            {/* Total Highlight */}
            <div className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Jumlah Dibayarkan:
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900">
                  {formatRupiah(payment.amount)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Status:</span>
                <span className="text-xs font-bold text-emerald-600">Terverifikasi Masuk Kas</span>
              </div>
            </div>

            {/* Bukti Transfer jika ada */}
            {payment.proofUrl && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Lampiran Bukti Pembayaran / Struk:
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src={payment.proofUrl}
                    alt="Bukti Struk Transfer"
                    className="w-16 h-16 object-cover rounded-lg border border-slate-200 shadow-2xs cursor-pointer hover:opacity-90"
                    onClick={() => window.open(payment.proofUrl, "_blank")}
                  />
                  <div>
                    <p className="text-[11px] font-medium text-slate-800">
                      Struk / Bukti Transaksi Resmi
                    </p>
                    <a
                      href={payment.proofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-[#800020] font-bold hover:underline inline-flex items-center gap-1 mt-0.5 print:hidden"
                    >
                      Buka Gambar Asli ↗
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Terbilang */}
            <div className="text-[11px] text-slate-500 italic bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60">
              Terbilang: Dua Juta Lima Ratus Ribu Rupiah
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-2 gap-6 text-center text-xs">
            <div>
              <span className="text-slate-500 block mb-12">Penyewa (Penerima)</span>
              <strong className="text-slate-900 border-t border-slate-300 pt-1 block">
                {payment.tenantName}
              </strong>
            </div>

            <div className="relative">
              {/* Digital Stamp Simulation */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-2 border-dashed border-[#800020]/40 flex items-center justify-center text-[9px] font-bold text-[#800020] rotate-12 pointer-events-none">
                KOSTMANAGER
                <br />
                VERIFIED
              </div>

              <span className="text-slate-500 block mb-12">Pengelola / Pemilik Kost</span>
              <strong className="text-slate-900 border-t border-slate-300 pt-1 block">
                Pak Gde Asbawa Putra
              </strong>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 text-center text-[11px] text-slate-400 print:hidden">
          Kwitansi ini diterbitkan secara sah dan digital oleh sistem <strong>KOSTMANAGER</strong>.
        </div>
      </div>
    </div>
  );
};
