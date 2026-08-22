import { Controller, Post, Body } from '@nestjs/common';
import { WorkflowService } from './workflow.service';

@Controller('workflow')
export class WorkflowController {
  constructor(private readonly workflow: WorkflowService) {}

  @Post('run')
  run(
    @Body()
    body: {
      orgId: string;
      workflowId: string;
      payload: any;
    },
  ) {
    return this.workflow.runWorkflow(body.orgId, body.workflowId, body.payload);
  }
}
