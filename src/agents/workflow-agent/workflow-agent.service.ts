import { Injectable } from '@nestjs/common';

@Injectable()
export class WorkflowAgentService {
  async run(orgId: string, payload: any) {
    return {
      agent: 'workflow',
      orgId,
      generatedWorkflow: {
        steps: payload.steps || [],
      },
    };
  }
}
