import { NextRequest, NextResponse } from "next/server";
import Kas from "@/models/Kas";
import { getUser } from "@/lib/auth";

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

    const titleTipe = tipe
      ? tipe === "pemasukan"
        ? "PEMASUKAN"
        : "PENGELUARAN"
      : "KAS";
    const periode = `Periode: ${startDate || "Awal"} - ${endDate || "Akhir"}`;

    const lines: string[] = [];
    lines.push(`LAPORAN ${titleTipe} GEKINDO`);
    lines.push(periode);
    lines.push("");
    lines.push("No,Tanggal,Tipe,Jumlah,Keterangan");
    data.forEach((d, i) => {
      lines.push(
        `${i + 1},${d.tanggal},${d.tipe === "pemasukan" ? "Pemasukan" : "Pengeluaran"},${d.jumlah},"${d.keterangan.replace(/"/g, '""')}"`
      );
    });
    lines.push("");
    lines.push(`Total Pemasukan,,,${totalPemasukan},`);
    lines.push(`Total Pengeluaran,,,${totalPengeluaran},`);
    lines.push(`Saldo,,,${saldo},`);
    lines.push("");
    lines.push(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`);

    const csv = "\uFEFF" + lines.join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="laporan_kas_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Gagal export CSV" },
      { status: 500 }
    );
  }
}
