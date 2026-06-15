"use client";

import { useEffect, useState } from "react";
import { Plus, Download, FileText, FileSpreadsheet } from "lucide-react";
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

export default function PemasukanPage() {
  const [data, setData] = useState<KasItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<KasItem | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      let url = "/api/kas?tipe=pemasukan";
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const res = await fetch(url);
      const json = await res.json();
      setData(json.data || []);
      setTotal(json.totalPemasukan || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

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
    setShowModal(true);
  }

  function handleAdd() {
    setEditItem(null);
    setShowModal(true);
  }

  function formatRupiah(num: number) {
    return `Rp ${num.toLocaleString("id-ID")}`;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Pemasukan</h1>
          <button
            onClick={handleAdd}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Tambah Pemasukan
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Filter
              </button>
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  fetchData();
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={`/api/export/csv?tipe=pemasukan${startDate ? `&startDate=${startDate}` : ""}${endDate ? `&endDate=${endDate}` : ""}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition"
            >
              <FileText className="w-4 h-4" />
              CSV
            </a>
            <a
              href={`/api/export/excel?tipe=pemasukan${startDate ? `&startDate=${startDate}` : ""}${endDate ? `&endDate=${endDate}` : ""}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </a>
            <a
              href={`/api/export/pdf?tipe=pemasukan${startDate ? `&startDate=${startDate}` : ""}${endDate ? `&endDate=${endDate}` : ""}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition"
            >
              <Download className="w-4 h-4" />
              PDF
            </a>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          {loading ? (
            <p className="text-gray-500">Memuat data...</p>
          ) : data.length === 0 ? (
            <p className="text-gray-500">Belum ada data pemasukan</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-3 font-medium">Tanggal</th>
                      <th className="pb-3 font-medium">Keterangan</th>
                      <th className="pb-3 font-medium text-right">Jumlah</th>
                      <th className="pb-3 font-medium text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-3">{item.tanggal}</td>
                        <td className="py-3 text-gray-600">
                          {item.keterangan}
                        </td>
                        <td className="py-3 text-right font-medium text-green-600">
                          {formatRupiah(Number(item.jumlah))}
                        </td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-800 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 pt-4 border-t text-right">
                <span className="font-semibold text-gray-700">
                  Total Pemasukan:{" "}
                </span>
                <span className="font-bold text-green-600">
                  {formatRupiah(total)}
                </span>
              </div>
            </>
          )}
        </div>
      </main>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editItem ? "Edit Pemasukan" : "Tambah Pemasukan"}
      >
        <FormKas
          tipe="pemasukan"
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
