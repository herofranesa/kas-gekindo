import sequelize from "../src/lib/sequelize";
import "../src/models/Kas";

async function init() {
  try {
    await sequelize.authenticate();
    console.log("Koneksi database berhasil");

    await sequelize.sync({ alter: true });
    console.log("Tabel berhasil dibuat/diupdate");

    process.exit(0);
  } catch (error) {
    console.error("Gagal inisialisasi database:", error);
    process.exit(1);
  }
}

init();
