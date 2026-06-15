import { Sequelize } from "sequelize";

const useConnectionString = !!process.env.DATABASE_URL;

const sequelize = useConnectionString
    ? new Sequelize(process.env.DATABASE_URL!, {
          dialect: "postgres",
          logging: false,
          dialectOptions: {
              ssl: {
                  require: true,
                  rejectUnauthorized: false,
              },
          },
          pool: {
              max: 5,
              min: 0,
              acquire: 30000,
              idle: 10000,
          },
      })
    : new Sequelize(
          process.env.DB_NAME || "kas_gekindo",
          process.env.DB_USER || "postgres",
          process.env.DB_PASSWORD || "",
          {
              host: process.env.DB_HOST || "localhost",
              port: parseInt(process.env.DB_PORT || "5432"),
              dialect: "postgres",
              logging: false,
              dialectOptions: {
                  ssl: {
                      require: true,
                      rejectUnauthorized: false,
                  },
              },
              pool: {
                  max: 5,
                  min: 0,
                  acquire: 30000,
                  idle: 10000,
              },
          },
      );

export default sequelize;
