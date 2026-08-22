import { Controller, Post, Body } from '@nestjs/common';
import { AgentsService } from './agents.service';

@Controller('agents')
export class AgentsController {
  constructor(private readonly agents: AgentsService) {}

  @Post('run')
  run(
    @Body()
    body: {
      agent: string;
      orgId: string;
      payload: any;
    },
  ) {
    return this.agents.runAgent(body.agent, body.orgId, body.payload);
  }
}
