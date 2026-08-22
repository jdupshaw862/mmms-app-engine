import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BillingModule } from './billing/billing.module';
import { CreditsModule } from './credits/credits.module';
import { BuilderModule } from './builder/builder.module';
import { WorkflowModule } from './workflow/workflow.module';
import { DeploymentModule } from './deployment/deployment.module';
import { EmailModule } from './email/email.module';
import { AgentsModule } from './agents/agents.module';
import { DocumentsModule } from './documents/documents.module';
import { StorageModule } from './storage/storage.module';
import { ConnectorsModule } from './connectors/connectors.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    BillingModule,
    CreditsModule,
    BuilderModule,
    WorkflowModule,
    DeploymentModule,
    EmailModule,
    AgentsModule,
    DocumentsModule,
    StorageModule,
    ConnectorsModule,
  ],
})
export class AppModule {}
