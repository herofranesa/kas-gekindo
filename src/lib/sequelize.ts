import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
    process.env.DB_NAME || "kas_gekindo",
    process.env.DB_USER || "root",
    process.env.DB_PASSWORD || "",
    {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "3345"),
        dialect: "mysql",
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    },
);

export default sequelize;
