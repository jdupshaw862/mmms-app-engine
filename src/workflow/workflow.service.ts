import { Injectable } from '@nestjs/common';
import { HttpNode } from './nodes/http.node';
import { DbNode } from './nodes/db.node';
import { ConditionNode } from './nodes/condition.node';
import { DelayNode } from './nodes/delay.node';
import { AiNode } from './nodes/ai.node';
import { EmailNode } from './nodes/email.node';
import { WebhookNode } from './nodes/webhook.node';

@Injectable()
export class WorkflowService {
  private nodes: Record<string, any> = {
    http: new HttpNode(),
    db: new DbNode(),
    condition: new ConditionNode(),
    delay: new DelayNode(),
    ai: new AiNode(),
    email: new EmailNode(),
    webhook: new WebhookNode(),
  };

  async runWorkflow(orgId: string, workflowId: string, payload: any) {
    const workflow = {
      id: workflowId,
      steps: [
        { type: 'http', config: { url: 'https://example.com', method: 'GET' } },
        { type: 'delay', config: { ms: 1000 } },
        { type: 'email', config: { to: 'test@example.com', subject: 'Hello', body: 'World' } },
      ],
    };

    const results = [];

    for (const step of workflow.steps) {
      const node = this.nodes[step.type];
      const result = await node.run(step.config, payload);
      results.push({ step: step.type, result });
    }

    return { workflowId, results };
  }
}
