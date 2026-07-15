import { Body, Controller, Get, httpError, Inject, Post } from "@midwayjs/core";
import { AgentService } from "../service/agent.service";
import { parseAgentInput } from "../utils/agent-input";

@Controller("/api/agent")
export class AgentController {
  @Inject()
  agentService: AgentService;

  @Post("/chat")
  async chat(@Body() body: unknown) {
    try {
      const input = parseAgentInput(body);
      const response = this.agentService.processMessage(input.message, input.userName);
      return response;
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "请求无效";
      throw new httpError.BadRequestError(message);
    }
  }

  @Get("/suggestions")
  async suggestions() {
    return { data: this.agentService.listSuggestions() };
  }
}
