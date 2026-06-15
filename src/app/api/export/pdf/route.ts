import { NextRequest, NextResponse } from "next/server";
import Kas from "@/models/Kas";
import { getUser } from "@/lib/auth";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;

    const titleTipe = tipe
      ? tipe === "pemasukan"
        ? "PEMASUKAN"
        : "PENGELUARAN"
      : "KAS";

    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`LAPORAN ${titleTipe} GEKINDO`, pageWidth / 2, 18, {
      align: "center",
    });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Periode: ${startDate || "Awal"} - ${endDate || "Akhir"}`,
      pageWidth / 2,
      28,
      { align: "center" }
    );
    if (user?.nama) {
      doc.text(`Dicetak oleh: ${user.nama}`, pageWidth / 2, 36, {
        align: "center",
      });
    }

    const tableColumn = ["No", "Tanggal", "Tipe", "Jumlah", "Keterangan"];
    const tableRows = data.map((d, i) => [
      i + 1,
      d.tanggal,
      d.tipe === "pemasukan" ? "Pemasukan" : "Pengeluaran",
      `Rp ${parseFloat(d.jumlah.toString()).toLocaleString("id-ID")}`,
      d.keterangan,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 48,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        1: { halign: "center", cellWidth: 25 },
        2: { halign: "center", cellWidth: 28 },
        3: { halign: "right", cellWidth: 35 },
        4: { cellWidth: "auto" },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setDrawColor(37, 99, 235);
    doc.setFillColor(240, 248, 255);
    doc.roundedRect(margin, finalY, pageWidth - 2 * margin, 50, 3, 3, "FD");

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("RINGKASAN", pageWidth / 2, finalY + 10, { align: "center" });

    const summaryX = margin + 10;
    const valueX = pageWidth - margin - 10;
    doc.setFont("helvetica", "normal");

    const summaryLines = [
      { label: "Total Pemasukan", value: totalPemasukan, color: [22, 163, 74] },
      {
        label: "Total Pengeluaran",
        value: totalPengeluaran,
        color: [220, 38, 38],
      },
      { label: "Saldo", value: saldo, color: [37, 99, 235] },
    ];

    summaryLines.forEach((item, idx) => {
      const y = finalY + 22 + idx * 10;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 100, 100);
      doc.text(item.label, summaryX, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(item.color[0], item.color[1], item.color[2]);
      doc.text(
        `Rp ${item.value.toLocaleString("id-ID")}`,
        valueX,
        y,
        { align: "right" }
      );
    });

    const footerY = finalY + 60;
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text(
      `Dicetak pada: ${new Date().toLocaleString("id-ID")}`,
      pageWidth / 2,
      footerY,
      { align: "center" }
    );

    const buffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="laporan_kas_${new Date().toISOString().slice(0, 10)}.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal export PDF" },
      { status: 500 }
    );
  }
}
