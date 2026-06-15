"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Download,
  FileText,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  Search,
  RotateCcw,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Modal from "@/components/Modal";
import FormKas from "@/components/FormKas";

interface KasItem {
  id: number;
  tipe: "pemasukan" | "pengeluaran";
  jumlah: number;
  keterangan: string;
  tanggal: string;
}

export default function TransaksiPage() {
  const [allData, setAllData] = useState<KasItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalTipe, setModalTipe] = useState<"pemasukan" | "pengeluaran">("pemasukan");
  const [editItem, setEditItem] = useState<KasItem | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      let url = "/api/kas";
      if (startDate) url += `?startDate=${startDate}`;
      if (endDate) url += `${startDate ? "&" : "?"}endDate=${endDate}`;

      const res = await fetch(url);
      const json = await res.json();
      setAllData(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const pemasukan = allData.filter((d) => d.tipe === "pemasukan");
  const pengeluaran = allData.filter((d) => d.tipe === "pengeluaran");

  const totalPemasukan = pemasukan.reduce(
    (sum, d) => sum + Number(d.jumlah), 0
  );
  const totalPengeluaran = pengeluaran.reduce(
    (sum, d) => sum + Number(d.jumlah), 0
  );
  const saldo = totalPemasukan - totalPengeluaran;

  async function handleDelete(id: number) {
    if (!confirm("Yakin ingin menghapus data ini?")) return;
    try {
      await fetch(`/api/kas/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  function handleEdit(item: KasItem) {
    setEditItem(item);
    setModalTipe(item.tipe);
    setShowModal(true);
  }

  function handleAdd(tipe: "pemasukan" | "pengeluaran") {
    setEditItem(null);
    setModalTipe(tipe);
    setShowModal(true);
  }

  function formatRupiah(num: number) {
    return `Rp ${num.toLocaleString("id-ID")}`;
  }

  function TablePanel({
    data,
    tipe,
    total,
    onAdd,
    onEdit,
    onDelete,
  }: {
    data: KasItem[];
    tipe: "pemasukan" | "pengeluaran";
    total: number;
    onAdd: () => void;
    onEdit: (item: KasItem) => void;
    onDelete: (id: number) => void;
  }) {
    const isPemasukan = tipe === "pemasukan";
    const accent = isPemasukan ? "emerald" : "red";
    const Icon = isPemasukan ? TrendingUp : TrendingDown;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
        <div className={`px-5 py-4 border-b border-gray-100 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isPemasukan ? "bg-emerald-100" : "bg-red-100"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isPemasukan ? "text-emerald-600" : "text-red-600"
                }`}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {isPemasukan ? "Pemasukan" : "Pengeluaran"}
              </h3>
              <p
                className={`text-xs font-medium ${
                  isPemasukan ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {formatRupiah(total)}
              </p>
            </div>
          </div>
          <button
            onClick={onAdd}
            className={`p-2 rounded-xl transition ${
              isPemasukan
                ? "text-emerald-600 hover:bg-emerald-50"
                : "text-red-600 hover:bg-red-50"
            }`}
            title={`Tambah ${isPemasukan ? "Pemasukan" : "Pengeluaran"}`}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto scrollbar-thin">
          {data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Icon className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">Belum ada data</p>
              <button
                onClick={onAdd}
                className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700 transition"
              >
                Tambah sekarang
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Keterangan</th>
                  <th className="px-4 py-3 text-right">Jumlah</th>
                  <th className="px-4 py-3 text-center w-20">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`border-t border-gray-50 hover:bg-gray-50/50 transition ${
                      idx === 0 ? "animate-fade-in" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">
                      {item.tanggal}
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate">
                      {item.keterangan}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-medium whitespace-nowrap ${
                        isPemasukan ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {formatRupiah(Number(item.jumlah))}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                          title="Edit"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Hapus"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-6 pt-16 lg:pt-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Transaksi</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Kelola pemasukan dan pengeluaran kas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/api/export/csv${startDate || endDate ? `?${startDate ? `startDate=${startDate}` : ""}${startDate && endDate ? "&" : ""}${endDate ? `endDate=${endDate}` : ""}` : ""}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition shadow-sm"
            >
              <FileText className="w-4 h-4" />
              CSV
            </a>
            <a
              href={`/api/export/excel${startDate || endDate ? `?${startDate ? `startDate=${startDate}` : ""}${startDate && endDate ? "&" : ""}${endDate ? `endDate=${endDate}` : ""}` : ""}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm hover:bg-emerald-100 transition shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </a>
            <a
              href={`/api/export/pdf${startDate || endDate ? `?${startDate ? `startDate=${startDate}` : ""}${startDate && endDate ? "&" : ""}${endDate ? `endDate=${endDate}` : ""}` : ""}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm hover:bg-red-100 transition shadow-sm"
            >
              <Download className="w-4 h-4" />
              PDF
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-gray-500">Total Pemasukan</p>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xl font-bold text-emerald-600">
              {formatRupiah(totalPemasukan)}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-gray-500">Total Pengeluaran</p>
              <TrendingDown className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-xl font-bold text-red-600">
              {formatRupiah(totalPengeluaran)}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-gray-500">Saldo</p>
              <div className={`w-2 h-2 rounded-full ${saldo >= 0 ? "bg-blue-500" : "bg-red-500"}`} />
            </div>
            <p className={`text-xl font-bold ${saldo >= 0 ? "text-blue-600" : "text-red-600"}`}>
              {formatRupiah(saldo)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
              placeholder="Tanggal Mulai"
            />
            <span className="text-gray-300 text-sm">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
              placeholder="Tanggal Akhir"
            />
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm"
            >
              Filter
            </button>
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
                fetchData();
              }}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex items-center justify-center"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-400">Memuat data...</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TablePanel
              data={pemasukan}
              tipe="pemasukan"
              total={totalPemasukan}
              onAdd={() => handleAdd("pemasukan")}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            <TablePanel
              data={pengeluaran}
              tipe="pengeluaran"
              total={totalPengeluaran}
              onAdd={() => handleAdd("pengeluaran")}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}
      </main>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={
          editItem
            ? `Edit ${modalTipe === "pemasukan" ? "Pemasukan" : "Pengeluaran"}`
            : `Tambah ${modalTipe === "pemasukan" ? "Pemasukan" : "Pengeluaran"}`
        }
      >
        <FormKas
          tipe={modalTipe}
          initialData={editItem || undefined}
          onSuccess={() => {
            setShowModal(false);
            fetchData();
          }}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}
