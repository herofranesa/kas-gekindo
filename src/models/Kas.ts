import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "@/lib/sequelize";

interface KasAttributes {
  id: number;
  tipe: "pemasukan" | "pengeluaran";
  jumlah: number;
  keterangan: string;
  tanggal: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface KasCreationAttributes extends Optional<KasAttributes, "id"> {}

class Kas extends Model<KasAttributes, KasCreationAttributes> implements KasAttributes {
  public id!: number;
  public tipe!: "pemasukan" | "pengeluaran";
  public jumlah!: number;
  public keterangan!: string;
  public tanggal!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Kas.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tipe: {
      type: DataTypes.ENUM("pemasukan", "pengeluaran"),
      allowNull: false,
    },
    jumlah: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    keterangan: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tanggal: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "kas",
    timestamps: true,
    underscored: true,
  }
);

export default Kas;
