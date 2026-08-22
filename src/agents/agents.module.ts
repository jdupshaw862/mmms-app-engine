import { Module } from '@nestjs/common';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';

import { AppBuilderAgentService } from './app-builder-agent/app-builder-agent.service';
import { WorkflowAgentService } from './workflow-agent/workflow-agent.service';
import { DocumentAgentService } from './document-agent/document-agent.service';
import { EmailAgentService } from './email-agent/email-agent.service';
import { CalendarAgentService } from './calendar-agent/calendar-agent.service';
import { PhoneAgentService } from './phone-agent/phone-agent.service';
import { LocalRuntimeAgentService } from './local-runtime-agent/local-runtime-agent.service';

@Module({
  controllers: [AgentsController],
  providers: [
    AgentsService,
    AppBuilderAgentService,
    WorkflowAgentService,
    DocumentAgentService,
    EmailAgentService,
    CalendarAgentService,
    PhoneAgentService,
    LocalRuntimeAgentService,
  ],
  exports: [AgentsService],
})
export class AgentsModule {}
