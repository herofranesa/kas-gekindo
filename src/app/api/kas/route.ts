import { NextRequest, NextResponse } from "next/server";
import Kas from "@/models/Kas";
import { getUser } from "@/lib/auth";
import sequelize from "@/lib/sequelize";

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
      order: [["tanggal", "DESC"], ["createdAt", "DESC"]],
    });

    const totalPemasukan = await Kas.sum("jumlah", {
      where: { ...where, tipe: "pemasukan" },
    });
    const totalPengeluaran = await Kas.sum("jumlah", {
      where: { ...where, tipe: "pengeluaran" },
    });

    return NextResponse.json({
      data,
      totalPemasukan: totalPemasukan || 0,
      totalPengeluaran: totalPengeluaran || 0,
      saldo: (totalPemasukan || 0) - (totalPengeluaran || 0),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.tipe || !body.jumlah || !body.keterangan || !body.tanggal) {
      return NextResponse.json(
        { message: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    const kas = await Kas.create({
      tipe: body.tipe,
      jumlah: parseFloat(body.jumlah),
      keterangan: body.keterangan,
      tanggal: body.tanggal,
    });

    return NextResponse.json(
      { message: "Data berhasil disimpan", data: kas },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal menyimpan data" },
      { status: 500 }
    );
  }
}
