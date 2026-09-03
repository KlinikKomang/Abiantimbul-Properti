import React from "react";
import { X, Calendar, Building2, Tag, CreditCard, User, FileText, Download, Printer } from "lucide-react";
import { ExpenseRecord } from "../types";
import { formatRupiah } from "../data/mockData";

interface ExpenseProofModalProps {
  expense: ExpenseRecord | null;
  onClose: () => void;
}

export const ExpenseProofModal: React.FC<ExpenseProofModalProps> = ({
  expense,
  onClose,
}) => {
  if (!expense) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800">
                Bukti Pengeluaran
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {expense.invoiceNumber || expense.id}
              </span>
            </div>
            <h2 className="text-base font-black text-slate-900 mt-0.5">
              {expense.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Receipt Image Display */}
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900/5 flex items-center justify-center min-h-[220px]">
            {expense.proofUrl ? (
              <img
                src={expense.proofUrl}
                alt={`Bukti ${expense.title}`}
                className="max-h-80 w-auto object-contain rounded-lg shadow-xs"
              />
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                Tidak ada foto bukti struk / nota yang dilampirkan untuk pengeluaran ini.
              </div>
            )}
          </div>

          {/* Transaction Metadata Card */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5 text-xs text-slate-700">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Nominal Pengeluaran:</span>
              <span className="text-base font-black text-rose-700">
                {formatRupiah(expense.amount)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Tanggal: <strong>{expense.date}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">Properti: <strong>{expense.propertyName}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Kategori: <strong>{expense.categoryLabel || expense.category}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Metode: <strong>{expense.paymentMethod || "Tunai"}</strong></span>
              </div>
              {expense.recipient && (
                <div className="flex items-center gap-1.5 text-slate-600 col-span-2">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Penerima / Vendor: <strong>{expense.recipient}</strong></span>
                </div>
              )}
            </div>

            {expense.notes && (
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                <span className="font-semibold text-slate-700">Catatan: </span>
                {expense.notes}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 font-medium">
            Status:{" "}
            <span className={`font-bold ${expense.status === "paid" ? "text-emerald-700" : "text-amber-600"}`}>
              {expense.status === "paid" ? "Lunas" : "Pending"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
