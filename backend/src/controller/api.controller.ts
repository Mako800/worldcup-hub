import { Controller, Get } from "@midwayjs/core";

@Controller("/api")
export class ApiController {
  @Get("/health")
  async health() {
    return {
      status: "ok" as const,
      service: "worldcup-platform-api",
      timestamp: new Date().toISOString(),
    };
  }
}
