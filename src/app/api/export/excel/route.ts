import { NextRequest, NextResponse } from "next/server";
import Kas from "@/models/Kas";
import { getUser } from "@/lib/auth";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const tipe = searchParams.get("tipe");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};
    if (tipe) where.tipe = tipe;
    if (startDate || endDate) {
      where.tanggal = {};
      if (startDate) where.tanggal[">="] = startDate;
      if (endDate) where.tanggal["<="] = endDate;
    }

    const data = await Kas.findAll({
      where,
      order: [["tanggal", "ASC"]],
    });

    const totalPemasukan = data
      .filter((d) => d.tipe === "pemasukan")
      .reduce((sum, d) => sum + parseFloat(d.jumlah.toString()), 0);
    const totalPengeluaran = data
      .filter((d) => d.tipe === "pengeluaran")
      .reduce((sum, d) => sum + parseFloat(d.jumlah.toString()), 0);
    const saldo = totalPemasukan - totalPengeluaran;

    const wb = XLSX.utils.book_new();

    const titleTipe = tipe
      ? tipe === "pemasukan"
        ? "PEMASUKAN"
        : "PENGELUARAN"
      : "KAS";

    const rows: any[][] = [
      [`LAPORAN ${titleTipe} GEKINDO`],
      [`Periode: ${startDate || "Awal"} - ${endDate || "Akhir"}`],
      [],
      ["No", "Tanggal", "Tipe", "Jumlah", "Keterangan"],
    ];

    data.forEach((d, i) => {
      rows.push([
        i + 1,
        d.tanggal,
        d.tipe === "pemasukan" ? "Pemasukan" : "Pengeluaran",
        parseFloat(d.jumlah.toString()),
        d.keterangan,
      ]);
    });

    rows.push([]);
    rows.push(["Total Pemasukan", "", "", totalPemasukan, ""]);
    rows.push(["Total Pengeluaran", "", "", totalPengeluaran, ""]);
    rows.push(["Saldo", "", "", saldo, ""]);
    rows.push([]);
    rows.push([`Dicetak pada: ${new Date().toLocaleString("id-ID")}`]);

    const ws = XLSX.utils.aoa_to_sheet(rows);

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
      { s: { r: rows.length - 2, c: 0 }, e: { r: rows.length - 2, c: 4 } },
    ];

    ws["!cols"] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
      { wch: 50 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Laporan Kas");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="laporan_kas_${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal export Excel" },
      { status: 500 }
    );
  }
}
