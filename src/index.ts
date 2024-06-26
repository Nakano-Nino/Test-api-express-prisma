import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import router from "./routes/routes";
import errorHandler from "./middlewares/errorHandler.middleware";

dotenv.config();
var cookieParser = require("cookie-parser");

export const prisma = new PrismaClient();

const app = express();
const port = process.env.PORT || 3000;

async function main() {
  app.use(express.json());
  app.use(cookieParser());
  app.use(helmet());
  app.disable("x-powered-by");
  
  app.use("/api", router)

  app.use(errorHandler)

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}

main()
  .then(async () => {
    await prisma.$connect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
