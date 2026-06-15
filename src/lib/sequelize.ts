import { Sequelize } from "sequelize";
import pg from "pg";
import "pg-hstore";

const isPooler = process.env.DB_POOLER === "true";

const baseDialectOptions: any = {
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
};

const basePool = {
  max: 5,
  min: 0,
  acquire: 30000,
  idle: 10000,
};

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      dialectModule: pg,
      logging: false,
      dialectOptions: baseDialectOptions,
      pool: basePool,
    })
  : new Sequelize(
      process.env.DB_NAME || "kas_gekindo",
      process.env.DB_USER || "postgres",
      process.env.DB_PASSWORD || "",
      {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || (isPooler ? "6543" : "5432")),
        dialect: "postgres",
        dialectModule: pg,
        logging: false,
        dialectOptions: baseDialectOptions,
        pool: basePool,
      },
    );

export default sequelize;
