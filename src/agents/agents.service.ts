import { Injectable, BadRequestException } from '@nestjs/common';

import { AppBuilderAgentService } from './app-builder-agent/app-builder-agent.service';
import { WorkflowAgentService } from './workflow-agent/workflow-agent.service';
import { DocumentAgentService } from './document-agent/document-agent.service';
import { EmailAgentService } from './email-agent/email-agent.service';
import { CalendarAgentService } from './calendar-agent/calendar-agent.service';
import { PhoneAgentService } from './phone-agent/phone-agent.service';
import { LocalRuntimeAgentService } from './local-runtime-agent/local-runtime-agent.service';

@Injectable()
export class AgentsService {
  constructor(
    private readonly appBuilderAgent: AppBuilderAgentService,
    private readonly workflowAgent: WorkflowAgentService,
    private readonly documentAgent: DocumentAgentService,
    private readonly emailAgent: EmailAgentService,
    private readonly calendarAgent: CalendarAgentService,
    private readonly phoneAgent: PhoneAgentService,
    private readonly localRuntimeAgent: LocalRuntimeAgentService,
  ) {}

  async runAgent(agent: string, orgId: string, payload: any) {
    switch (agent) {
      case 'app-builder':
        return this.appBuilderAgent.run(orgId, payload);
      case 'workflow':
        return this.workflowAgent.run(orgId, payload);
      case 'document':
        return this.documentAgent.run(orgId, payload);
      case 'email':
        return this.emailAgent.run(orgId, payload);
      case 'calendar':
        return this.calendarAgent.run(orgId, payload);
      case 'phone':
        return this.phoneAgent.run(orgId, payload);
      case 'local-runtime':
        return this.localRuntimeAgent.run(orgId, payload);
      default:
        throw new BadRequestException('Unknown agent');
    }
  }
}
