import { NextRequest, NextResponse } from "next/server";
import Kas from "@/models/Kas";
import { getUser } from "@/lib/auth";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: Params) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const kas = await Kas.findByPk(id);
    if (!kas) {
      return NextResponse.json(
        { message: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    await kas.update({
      tipe: body.tipe,
      jumlah: parseFloat(body.jumlah),
      keterangan: body.keterangan,
      tanggal: body.tanggal,
    });

    return NextResponse.json({ message: "Data berhasil diupdate", data: kas });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal mengupdate data" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const kas = await Kas.findByPk(id);
    if (!kas) {
      return NextResponse.json(
        { message: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    await kas.destroy();
    return NextResponse.json({ message: "Data berhasil dihapus" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal menghapus data" },
      { status: 500 }
    );
  }
}
