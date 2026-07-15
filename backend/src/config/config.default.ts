import { MidwayConfig } from "@midwayjs/core";

export default {
  keys: "worldcup-platform-development-key",
  koa: {
    port: Number(process.env.BACKEND_PORT ?? 7001),
  },
  worldcupDatabase: {
    path: process.env.DATABASE_PATH ?? "./data/worldcup-platform.sqlite",
  },
} as MidwayConfig;
