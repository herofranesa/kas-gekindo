"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Download,
  FileText,
  FileSpreadsheet,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface KasItem {
  id: number;
  tipe: "pemasukan" | "pengeluaran";
  jumlah: number;
  keterangan: string;
  tanggal: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<KasItem[]>([]);
  const [totalPemasukan, setTotalPemasukan] = useState(0);
  const [totalPengeluaran, setTotalPengeluaran] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/kas");
      const json = await res.json();
      setData(json.data?.slice(0, 5) || []);
      setTotalPemasukan(json.totalPemasukan || 0);
      setTotalPengeluaran(json.totalPengeluaran || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const saldo = totalPemasukan - totalPengeluaran;
  const persenPemasukan = totalPemasukan + totalPengeluaran > 0
    ? (totalPemasukan / (totalPemasukan + totalPengeluaran)) * 100
    : 50;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Ringkasan kas GEKINDO
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/export/csv"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition shadow-sm"
          >
            <FileText className="w-4 h-4" />
            CSV
          </a>
          <a
            href="/api/export/excel"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm hover:bg-emerald-100 transition shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </a>
          <a
            href="/api/export/pdf"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm hover:bg-red-100 transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            PDF
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[100px] -z-0" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-gray-500">Total Pemasukan</p>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              Rp {totalPemasukan.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-[100px] -z-0" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-gray-500">Total Pengeluaran</p>
              <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-600 mt-1">
              Rp {totalPengeluaran.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[100px] -z-0" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-gray-500">Saldo</p>
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p
              className={`text-2xl font-bold mt-1 ${saldo >= 0 ? "text-blue-600" : "text-red-600"}`}
            >
              Rp {saldo.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Transaksi Terbaru</h2>
            <Link
              href="/transaksi"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
            >
              Lihat semua
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Wallet className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Belum ada transaksi</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-3 px-5">Tanggal</th>
                    <th className="pb-3 px-5">Tipe</th>
                    <th className="pb-3 px-5">Keterangan</th>
                    <th className="pb-3 px-5 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition"
                    >
                      <td className="py-3 px-5 text-gray-600 text-xs">
                        {item.tanggal}
                      </td>
                      <td className="py-3 px-5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            item.tipe === "pemasukan"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.tipe === "pemasukan" ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {item.tipe === "pemasukan" ? "Pemasukan" : "Pengeluaran"}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-gray-600 max-w-[200px] truncate">
                        {item.keterangan}
                      </td>
                      <td className="py-3 px-5 text-right font-medium">
                        <span
                          className={
                            item.tipe === "pemasukan"
                              ? "text-emerald-600"
                              : "text-red-600"
                          }
                        >
                          Rp {Number(item.jumlah).toLocaleString("id-ID")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Ringkasan</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-500">Pemasukan</span>
                <span className="font-medium text-emerald-600">
                  {persenPemasukan.toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${persenPemasukan}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-500">Pengeluaran</span>
                <span className="font-medium text-red-600">
                  {(100 - persenPemasukan).toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${100 - persenPemasukan}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Transaksi</span>
              <span className="font-medium text-gray-900">{data.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Saldo Akhir</span>
              <span className={`font-bold ${saldo >= 0 ? "text-blue-600" : "text-red-600"}`}>
                Rp {saldo.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
