import React from "react";
import {
  X,
  Printer,
  FileSignature,
  Building2,
  CheckCircle2,
  Scale
} from "lucide-react";
import { Contract, Property, Tenant } from "../types";
import { formatRupiah } from "../data/mockData";

interface ContractDocModalProps {
  contract: Contract;
  property?: Property;
  tenant?: Tenant;
  onClose: () => void;
}

export const ContractDocModal: React.FC<ContractDocModalProps> = ({
  contract,
  property,
  tenant,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[95vh] overflow-y-auto relative">
        {/* Top actions bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#800020] bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              Dokumen Perjanjian Sewa Digital
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
              title="Cetak Surat Perjanjian"
            >
              <Printer className="w-4 h-4" /> Cetak Surat
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Contract Document */}
        <div className="border border-slate-300 rounded-2xl p-6 sm:p-10 bg-white space-y-5 text-slate-800 text-xs leading-relaxed font-serif">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <h2 className="text-base sm:text-lg font-black tracking-tight font-sans text-slate-900">
              SURAT PERJANJIAN SEWA MENYEWA KAMAR KOST
            </h2>
            <p className="text-xs font-mono font-bold text-[#800020] mt-0.5">
              Nomor: {contract.contractNumber}
            </p>
          </div>

          <p className="text-justify font-sans">
            Pada hari ini telah dibuat dan disepakati perjanjian sewa kamar antara pihak-pihak di bawah ini:
          </p>

          {/* Parties */}
          <div className="space-y-3 font-sans">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block mb-1">PIHAK PERTAMA (PEMILIK / PENGELOLA KOST):</strong>
              <div>Nama: <strong>Pak Gde Asbawa Putra</strong></div>
              <div>Pengelola: <strong>{contract.propertyName}</strong></div>
              <div>Alamat: {property?.address || "Jakarta Selatan, Indonesia"}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block mb-1">PIHAK KEDUA (PENYEWA):</strong>
              <div>Nama Lengkap: <strong>{contract.tenantName}</strong></div>
              <div>No. Identitas (NIK): <strong>{tenant?.idCardNumber || "3174091208950009"}</strong></div>
              <div>No. WhatsApp: <strong>{tenant?.phone || "+62 812-9988-7766"}</strong></div>
            </div>
          </div>

          {/* Clauses */}
          <div className="space-y-3 font-sans">
            <div>
              <strong className="text-slate-900 block font-bold">PASAL 1 - OBJEK SEWA & TARIF</strong>
              <p className="text-slate-600 text-justify mt-0.5">
                PIHAK PERTAMA menyewakan kepada PIHAK KEDUA 1 (satu) unit kamar kost yaitu{" "}
                <strong>Kamar {contract.roomNumber}</strong> di {contract.propertyName} dengan tarif sewa sebesar{" "}
                <strong>{formatRupiah(contract.monthlyRent)}</strong> per bulan.
              </p>
            </div>

            <div>
              <strong className="text-slate-900 block font-bold">PASAL 2 - JANGKA WAKTU & JATUH TEMPO</strong>
              <p className="text-slate-600 text-justify mt-0.5">
                Sewa menyewa ini berlaku sejak tanggal <strong>{contract.startDate}</strong> sampai dengan tanggal{" "}
                <strong>{contract.endDate}</strong>. Pembayaran sewa wajib dilakukan paling lambat tanggal 5 setiap bulannya.
              </p>
            </div>

            <div>
              <strong className="text-slate-900 block font-bold">PASAL 3 - UANG JAMINAN (DEPOSIT)</strong>
              <p className="text-slate-600 text-justify mt-0.5">
                PIHAK KEDUA telah menyerahkan uang jaminan deposit sebesar{" "}
                <strong>{formatRupiah(contract.deposit)}</strong> yang akan dikembalikan secara utuh pada saat masa sewa
                berakhir setelah dipotong biaya perbaikan kerusakan jika ada.
              </p>
            </div>

            <div>
              <strong className="text-slate-900 block font-bold">PASAL 4 - TATA TERTIB & KEAMANAN</strong>
              <p className="text-slate-600 text-justify mt-0.5">
                PIHAK KEDUA wajib mematuhi jam malam (pukul 23:00 WIB) serta dilarang membawa tamu lawan jenis menginap
                di kamar demi menjaga ketertiban bersama.
              </p>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 border-t-2 border-slate-900 grid grid-cols-2 gap-6 text-center text-xs font-sans">
            <div>
              <span className="text-slate-500 block mb-16">PIHAK KEDUA (Penyewa)</span>
              <strong className="text-slate-900 border-t border-slate-300 pt-1 block">
                {contract.tenantName}
              </strong>
            </div>

            <div className="relative">
              {/* Materai simulation */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-10 border border-emerald-500 bg-emerald-50 text-emerald-800 text-[8px] font-bold flex items-center justify-center rounded">
                MATERAI 10.000
              </div>

              <span className="text-slate-500 block mb-16">PIHAK PERTAMA (Pemilik Kost)</span>
              <strong className="text-slate-900 border-t border-slate-300 pt-1 block">
                Pak Gde Asbawa Putra
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
