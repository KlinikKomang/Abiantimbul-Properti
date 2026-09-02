import React from "react";
import {
  FileText,
  Search,
  Plus,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Download,
  Eye,
  FileSignature,
  Building2,
  X,
  Sparkles
} from "lucide-react";
import { Contract, Property, Tenant } from "../types";
import { formatRupiah } from "../data/mockData";

interface ContractViewProps {
  contracts: Contract[];
  properties: Property[];
  tenants: Tenant[];
  selectedPropertyId: string;
  onOpenContractDoc: (contract: Contract) => void;
  onExtendContract: (contract: Contract) => void;
}

export const ContractView: React.FC<ContractViewProps> = ({
  contracts,
  properties,
  tenants,
  selectedPropertyId,
  onOpenContractDoc,
  onExtendContract,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [propertyFilter, setPropertyFilter] = React.useState<string>(selectedPropertyId);

  React.useEffect(() => {
    setPropertyFilter(selectedPropertyId);
  }, [selectedPropertyId]);

  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      c.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.propertyName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesProperty = propertyFilter === "all" || c.propertyId === propertyFilter;

    return matchesSearch && matchesStatus && matchesProperty;
  });

  const expiringCount = contracts.filter((c) => c.status === "expiring_soon").length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#800020]" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Manajemen Surat Kontrak & Perjanjian Sewa
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Dokumentasi legal perjanjian sewa kost digital, monitoring masa berlaku sewa, dan perpanjangan kontrak.
          </p>
        </div>

        {expiringCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            {expiringCount} Kontrak Segera Berakhir (&lt; 30 Hari)
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Cari nomor kontrak / nama penyewa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#800020] text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === "all" ? "bg-[#800020] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Semua ({contracts.length})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                statusFilter === "active"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              🟢 Aktif
            </button>
            <button
              onClick={() => setStatusFilter("expiring_soon")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                statusFilter === "expiring_soon"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 text-amber-900 border border-amber-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              🟡 Segera Berakhir
            </button>
            <button
              onClick={() => setStatusFilter("expired")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                statusFilter === "expired"
                  ? "bg-rose-700 text-white shadow-xs"
                  : "bg-rose-50 text-rose-900 border border-rose-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              🔴 Berakhir
            </button>
          </div>
        </div>

        {/* Property filter */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-semibold">Properti:</span>
          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="all">Semua Cabang Kost</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
              <th className="pb-3 px-3">Nomor Kontrak & Penyewa</th>
              <th className="pb-3 px-3">Kost / Kamar</th>
              <th className="pb-3 px-3">Masa Berlaku Sewa</th>
              <th className="pb-3 px-3">Tarif & Deposit</th>
              <th className="pb-3 px-3">Status Kontrak</th>
              <th className="pb-3 px-3 text-right">Aksi Legal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredContracts.map((c) => {
              return (
                <tr key={c.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-3">
                    <div className="font-mono text-[11px] font-bold text-[#800020]">{c.contractNumber}</div>
                    <div className="font-extrabold text-slate-900 text-sm mt-0.5">{c.tenantName}</div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-[#800020] font-mono font-bold border border-rose-200">
                      {c.roomNumber}
                    </span>
                    <div className="text-[11px] text-slate-500 mt-1">{c.propertyName}</div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="text-slate-800 font-semibold">{c.startDate} s/d {c.endDate}</div>
                    <div className="text-[10px] text-slate-400">Durasi: 12 Bulan</div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-extrabold text-slate-900">{formatRupiah(c.monthlyRent)}/bln</div>
                    <div className="text-[10px] text-slate-400">Deposit: {formatRupiah(c.deposit)}</div>
                  </td>

                  <td className="py-3.5 px-3">
                    {c.status === "active" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        🟢 Aktif
                      </span>
                    ) : c.status === "expiring_soon" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        🟡 Segera Berakhir
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        🔴 Berakhir
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenContractDoc(c)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-[#800020] text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-300" /> Lihat Surat
                      </button>

                      {c.status === "expiring_soon" && (
                        <button
                          onClick={() => onExtendContract(c)}
                          className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition flex items-center gap-1 shadow-xs"
                        >
                          <FileSignature className="w-3.5 h-3.5" /> Perpanjang
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
