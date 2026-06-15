"use client";

import { useState } from "react";

interface FormKasProps {
  tipe: "pemasukan" | "pengeluaran";
  initialData?: {
    id?: number;
    tipe?: string;
    jumlah?: number;
    keterangan?: string;
    tanggal?: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export default function FormKas({
  tipe,
  initialData,
  onSuccess,
  onCancel,
}: FormKasProps) {
  const [jumlah, setJumlah] = useState(initialData?.jumlah?.toString() || "");
  const [keterangan, setKeterangan] = useState(
    initialData?.keterangan || ""
  );
  const [tanggal, setTanggal] = useState(
    initialData?.tanggal || new Date().toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!initialData?.id;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = isEdit ? `/api/kas/${initialData.id}` : "/api/kas";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipe, jumlah, keterangan, tanggal }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message);
        return;
      }

      onSuccess();
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  const accentColor = tipe === "pemasukan" ? "emerald" : "red";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
            tipe === "pemasukan"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {tipe === "pemasukan" ? "Pemasukan" : "Pengeluaran"}
        </span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Tanggal
        </label>
        <input
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-gray-900"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Jumlah (Rp)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
            Rp
          </span>
          <input
            type="number"
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-gray-900"
            placeholder="0"
            min="0"
            step="0.01"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Keterangan
        </label>
        <textarea
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-gray-900 resize-none"
          rows={3}
          placeholder="Deskripsi transaksi"
          required
        />
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`px-5 py-2.5 text-sm font-medium text-white rounded-xl transition disabled:opacity-50 ${
            tipe === "pemasukan"
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {loading ? "Menyimpan..." : isEdit ? "Perbarui" : "Simpan"}
        </button>
      </div>
    </form>
  );
}
