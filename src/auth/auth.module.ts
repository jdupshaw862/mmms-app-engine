{
  "name": "mmms-app-engine",
  "version": "1.0.0",
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "build": "nest build"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "typescript": "^5.4.0"
  }
}
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es2017",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": false,
    "sourceMap": true,
    "outDir": "./dist"
  }
}
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.listen(3000);
}
bootstrap();
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
})
export class AppModule {}
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getStatus() {
    return { status: 'MMMS App Engine Running' };
  }
}
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post('create')
  create(
    @Body()
    body: { email: string; passwordHash: string; orgId: string; role: string },
  ) {
    return this.users.create(body);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.users.getById(id);
  }
}
import { Injectable } from '@nestjs/common';

interface User {
  id: string;
  email: string;
  passwordHash: string;
  orgId: string;
  role: string;
}

@Injectable()
export class UsersService {
  private users: User[] = [];

  create(data: Omit<User, 'id'>) {
    const user: User = { id: crypto.randomUUID(), ...data };
    this.users.push(user);
    return user;
  }

  getById(id: string) {
    return this.users.find((u) => u.id === id) || null;
  }
}
import { UsersModule } from './users/users.module';
UsersModule,
import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';

@Module({
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Post('create-customer')
  createCustomer(@Body() body: { email: string; orgId: string }) {
    return this.billing.createCustomer(body.email, body.orgId);
  }

  @Post('subscribe')
  subscribe(@Body() body: { customerId: string; priceId: string; orgId: string }) {
    return this.billing.subscribe(body.customerId, body.priceId, body.orgId);
  }

  @Get('invoices/:customerId')
  invoices(@Param('customerId') customerId: string) {
    return this.billing.getInvoices(customerId);
  }
}
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class BillingService {
  private stripe = new Stripe(process.env.STRIPE_SECRET || '', {
    apiVersion: '2023-10-16',
  });

  createCustomer(email: string, orgId: string) {
    return this.stripe.customers.create({ email, metadata: { orgId } });
  }

  subscribe(customerId: string, priceId: string, orgId: string) {
    return this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata: { orgId },
    });
  }

  getInvoices(customerId: string) {
    return this.stripe.invoices.list({ customer: customerId });
  }
}
import { BillingModule } from './billing/billing.module';
BillingModule,
import { Module } from '@nestjs/common';
import { CreditsController } from './credits.controller';
import { CreditsService } from './credits.service';

@Module({
  controllers: [CreditsController],
  providers: [CreditsService],
  exports: [CreditsService],
})
export class CreditsModule {}
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CreditsService } from './credits.service';

@Controller('credits')
export class CreditsController {
  constructor(private readonly credits: CreditsService) {}

  @Post('add')
  add(@Body() body: { orgId: string; amount: number; reason: string }) {
    return this.credits.addCredits(body.orgId, body.amount, body.reason);
  }

  @Post('consume')
  consume(@Body() body: { orgId: string; amount: number; action: string }) {
    return this.credits.consumeCredits(body.orgId, body.amount, body.action);
  }

  @Get(':orgId')
  balance(@Param('orgId') orgId: string) {
    return this.credits.getBalance(orgId);
  }
}
import { Injectable, BadRequestException } from '@nestjs/common';

interface CreditLog {
  id: string;
  orgId: string;
  amount: number;
  type: 'add' | 'consume';
  action?: string;
  reason?: string;
  timestamp: number;
}

@Injectable()
export class CreditsService {
  private balances: Record<string, number> = {};
  private logs: CreditLog[] = [];

  addCredits(orgId: string, amount: number, reason: string) {
    this.balances[orgId] = (this.balances[orgId] || 0) + amount;
    this.logs.push({
      id: crypto.randomUUID(),
      orgId,
      amount,
      type: 'add',
      reason,
      timestamp: Date.now(),
    });
    return { balance: this.balances[orgId] };
  }

  consumeCredits(orgId: string, amount: number, action: string) {
    if ((this.balances[orgId] || 0) < amount)
      throw new BadRequestException('Insufficient credits');

    this.balances[orgId] -= amount;
    this.logs.push({
      id: crypto.randomUUID(),
      orgId,
      amount,
      type: 'consume',
      action,
      timestamp: Date.now(),
    });

    return { balance: this.balances[orgId] };
  }

  getBalance(orgId: string) {
    return { balance: this.balances[orgId] || 0 };
  }
}
import { CreditsModule } from './credits/credits.module';
CreditsModule,
import { Module } from '@nestjs/common';
import { BuilderController } from './builder.controller';
import { BuilderService } from './builder.service';
import { UiService } from './ui.service';
import { DbService } from './db.service';
import { ApiService } from './api.service';
import { TemplateService } from './template.service';

@Module({
  controllers: [BuilderController],
  providers: [
    BuilderService,
    UiService,
    DbService,
    ApiService,
    TemplateService,
  ],
  exports: [BuilderService],
})
export class BuilderModule {}
import { Controller, Post, Body } from '@nestjs/common';
import { BuilderService } from './builder.service';

@Controller('builder')
export class BuilderController {
  constructor(private readonly builder: BuilderService) {}

  @Post('generate-app')
  generateApp(
    @Body()
    body: {
      orgId: string;
      appName: string;
      ui: any;
      database: any;
      apis: any;
    },
  ) {
    return this.builder.generateApp(body);
  }
}
import { Injectable } from '@nestjs/common';
import { UiService } from './ui.service';
import { DbService } from './db.service';
import { ApiService } from './api.service';
import { TemplateService } from './template.service';

@Injectable()
export class BuilderService {
  constructor(
    private readonly ui: UiService,
    private readonly db: DbService,
    private readonly api: ApiService,
    private readonly templates: TemplateService,
  ) {}

  async generateApp(config: any) {
    const uiBuild = await this.ui.generateUi(config.ui);
    const dbBuild = await this.db.generateDatabase(config.database);
    const apiBuild = await this.api.generateApi(config.apis);
    const templateBuild = await this.templates.applyTemplates(config);

    return {
      status: 'success',
      appName: config.appName,
      orgId: config.orgId,
      uiBuild,
      dbBuild,
      apiBuild,
      templateBuild,
    };
  }
}
import { Injectable } from '@nestjs/common';

@Injectable()
export class UiService {
  async generateUi(uiConfig: any) {
    return {
      uiBundle: `ui-${crypto.randomUUID()}`,
      config: uiConfig,
    };
  }
}
import { Injectable } from '@nestjs/common';

@Injectable()
export class DbService {
  async generateDatabase(dbConfig: any) {
    return {
      schemaId: crypto.randomUUID(),
      schema: dbConfig,
    };
  }
}
import { BuilderModule } from './builder/builder.module';
BuilderModule,
import { Module } from '@nestjs/common';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';

@Module({
  controllers: [WorkflowController],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule {}
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
import { Injectable } from '@nestjs/common';
import { HttpNode } from './nodes/http.node';
import { DelayNode } from './nodes/delay.node';
import { ConditionNode } from './nodes/condition.node';
import { EmailNode } from './nodes/email.node';
import { AiNode } from './nodes/ai.node';
import { WebhookNode } from './nodes/webhook.node';

@Injectable()
export class WorkflowService {
  private nodes: Record<string, any> = {
    http: new HttpNode(),
    delay: new DelayNode(),
    condition: new ConditionNode(),
    email: new EmailNode(),
    ai: new AiNode(),
    webhook: new WebhookNode(),
  };

  async runWorkflow(orgId: string, workflowId: string, payload: any) {
    const workflow = {
      id: workflowId,
      steps: payload.steps || [],
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
import axios from 'axios';

export class HttpNode {
  async run(config: { url: string; method: string; data?: any }) {
    const response = await axios({
      url: config.url,
      method: config.method,
      data: config.data,
    });
    return response.data;
  }
}
export class DelayNode {
  async run(config: { ms: number }) {
    await new Promise((resolve) => setTimeout(resolve, config.ms));
    return { delayed: config.ms };
  }
}
import { WorkflowModule } from './workflow/workflow.module';
WorkflowModule,
import { Module } from '@nestjs/common';
import { DeploymentController } from './deployment.controller';
import { DeploymentService } from './deployment.service';
import { DockerService } from './docker.service';
import { DnsService } from './dns.service';
import { SslService } from './ssl.service';

@Module({
  controllers: [DeploymentController],
  providers: [DeploymentService, DockerService, DnsService, SslService],
  exports: [DeploymentService],
})
export class DeploymentModule {}
import { Controller, Post, Body } from '@nestjs/common';
import { DeploymentService } from './deployment.service';

@Controller('deployment')
export class DeploymentController {
  constructor(private readonly deployment: DeploymentService) {}

  @Post('deploy')
  deploy(
    @Body()
    body: {
      orgId: string;
      appName: string;
      build: any;
      domain?: string;
    },
  ) {
    return this.deployment.deployApp(body);
  }
}
import { Injectable } from '@nestjs/common';
import { DockerService } from './docker.service';
import { DnsService } from './dns.service';
import { SslService } from './ssl.service';

@Injectable()
export class DeploymentService {
  constructor(
    private readonly docker: DockerService,
    private readonly dns: DnsService,
    private readonly ssl: SslService,
  ) {}

  async deployApp(config: any) {
    const image = await this.docker.buildImage(config);
    const container = await this.docker.runContainer(image, config);

    let domainSetup = null;
    if (config.domain) {
      domainSetup = await this.dns.configureDomain(config.domain);
      await this.ssl.provisionSsl(config.domain);
    }

    return {
      deploymentId: crypto.randomUUID(),
      url: config.domain
        ? `https://${config.domain}`
        : `https://apps.local/${config.orgId}/${config.appName}`,
      container,
      domainSetup,
    };
  }
}
import { Injectable } from '@nestjs/common';

@Injectable()
export class DockerService {
  async buildImage(config: any) {
    return {
      imageId: `image-${crypto.randomUUID()}`,
      buildConfig: config.build,
    };
  }

  async runContainer(image: any, config: any) {
    return {
      containerId: `container-${crypto.randomUUID()}`,
      image,
      env: {
        ORG_ID: config.orgId,
        APP_NAME: config.appName,
      },
    };
  }
}
import { Injectable } from '@nestjs/common';

@Injectable()
export class DnsService {
  async configureDomain(domain: string) {
    return {
      domain,
      records: [
        { type: 'A', value: '127.0.0.1' },
        { type: 'CNAME', value: 'apps.local' },
      ],
    };
  }
}
import { Injectable } from '@nestjs/common';

@Injectable()
export class SslService {
  async provisionSsl(domain: string) {
    return {
      domain,
      ssl: true,
      certificateId: crypto.randomUUID(),
    };
  }
}
import { DeploymentModule } from './deployment/deployment.module';
DeploymentModule,
import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { MxService } from './mx.service';
import { SpfService } from './spf.service';
import { DkimService } from './dkim.service';
import { DmarcService } from './dmarc.service';
import { SmtpService } from './smtp.service';
import { InboxService } from './inbox.service';

@Module({
  controllers: [EmailController],
  providers: [
    EmailService,
    MxService,
    SpfService,
    DkimService,
    DmarcService,
    SmtpService,
    InboxService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { MxService } from './mx.service';
import { SpfService } from './spf.service';
import { DkimService } from './dkim.service';
import { DmarcService } from './dmarc.service';
import { SmtpService } from './smtp.service';
import { InboxService } from './inbox.service';

@Module({
  controllers: [EmailController],
  providers: [
    EmailService,
    MxService,
    SpfService,
    DkimService,
    DmarcService,
    SmtpService,
    InboxService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
import { Injectable } from '@nestjs/common';
import { MxService } from './mx.service';
import { SpfService } from './spf.service';
import { DkimService } from './dkim.service';
import { DmarcService } from './dmarc.service';
import { SmtpService } from './smtp.service';
import { InboxService } from './inbox.service';

@Injectable()
export class EmailService {
  constructor(
    private readonly mx: MxService,
    private readonly spf: SpfService,
    private readonly dkim: DkimService,
    private readonly dmarc: DmarcService,
    private readonly smtp: SmtpService,
    private readonly inbox: InboxService,
  ) {}

  async provisionEmail(config: { orgId: string; domain: string; inbox: string }) {
    const mxRecords = await this.mx.setup(config.domain);
    const spfRecord = await this.spf.setup(config.domain);
    const dkimRecord = await this.dkim.setup(config.domain);
    const dmarcRecord = await this.dmarc.setup(config.domain);

    const smtpCredentials = await this.smtp.createCredentials(config.domain);
    const inbox = await this.inbox.createInbox(config.orgId, config.domain, config.inbox);

    return {
      status: 'success',
      domain: config.domain,
      inbox,
      dns: {
        mx: mxRecords,
        spf: spfRecord,
        dkim: dkimRecord,
        dmarc: dmarcRecord,
      },
      smtp: smtpCredentials,
    };
  }
}
import { Injectable } from '@nestjs/common';

@Injectable()
export class MxService {
  async setup(domain: string) {
    return [
      { type: 'MX', priority: 10, value: `mail.${domain}` },
      { type: 'A', value: '127.0.0.1' },
    ];
  }
}
import { Injectable } from '@nestjs/common';

@Injectable()
export class SpfService {
  async setup(domain: string) {
    return {
      type: 'TXT',
      value: `v=spf1 include:_spf.local ~all`,
    };
  }
}
import { Injectable } from '@nestjs/common';

@Injectable()
export class DkimService {
  async setup(domain: string) {
    return {
      selector: 'local',
      publicKey: 'PUBLIC_KEY_PLACEHOLDER',
    };
  }
}
import { Injectable } from '@nestjs/common';

@Injectable()
export class DmarcService {
  async setup(domain: string) {
    return {
      type: 'TXT',
      value: `v=DMARC1; p=none; rua=mailto:dmarc@${domain}`,
    };
  }
}
import { Injectable } from '@nestjs/common';

@Injectable()
export class SmtpService {
  async createCredentials(domain: string) {
    return {
      username: `smtp-${crypto.randomUUID()}`,
      password: crypto.randomUUID(),
      host: `smtp.${domain}`,
      port: 587,
    };
  }
}
import { Injectable } from '@nestjs/common';

@Injectable()
export class InboxService {
  async createInbox(orgId: string, domain: string, inbox: string) {
    return {
      inboxId: crypto.randomUUID(),
      address: `${inbox}@${domain}`,
      orgId,
    };
  }
}
import { EmailModule } from './email/email.module';
EmailModule,
import { Module } from '@nestjs/common';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { AppBuilderAgent } from './app-builder.agent';
import { WorkflowAgent } from './workflow.agent';
import { DocumentAgent } from './document.agent';
import { EmailAgent } from './email.agent';
import { CalendarAgent } from './calendar.agent';
import { PhoneAgent } from './phone.agent';
import { LocalRuntimeAgent } from './local-runtime.agent';

@Module({
  controllers: [AgentsController],
  providers: [
    AgentsService,
    AppBuilderAgent,
    WorkflowAgent,
    DocumentAgent,
    EmailAgent,
    CalendarAgent,
    PhoneAgent,
    LocalRuntimeAgent,
  ],
  exports: [AgentsService],
})
export class AgentsModule {}
import { Module } from '@nestjs/common';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { AppBuilderAgent } from './app-builder.agent';
import { WorkflowAgent } from './workflow.agent';
import { DocumentAgent } from './document.agent';
import { EmailAgent } from './email.agent';
import { CalendarAgent } from './calendar.agent';
import { PhoneAgent } from './phone.agent';
import { LocalRuntimeAgent } from './local-runtime.agent';

@Module({
  controllers: [AgentsController],
  providers: [
    AgentsService,
    AppBuilderAgent,
    WorkflowAgent,
    DocumentAgent,
    EmailAgent,
    CalendarAgent,
    PhoneAgent,
    LocalRuntimeAgent,
  ],
  exports: [AgentsService],
})
export class AgentsModule {}
import { Injectable, BadRequestException } from '@nestjs/common';
import { AppBuilderAgent } from './app-builder.agent';
import { WorkflowAgent } from './workflow.agent';
import { DocumentAgent } from './document.agent';
import { EmailAgent } from './email.agent';
import { CalendarAgent } from './calendar.agent';
import { PhoneAgent } from './phone.agent';
import { LocalRuntimeAgent } from './local-runtime.agent';

@Injectable()
export class AgentsService {
  constructor(
    private readonly appBuilder: AppBuilderAgent,
    private readonly workflow: WorkflowAgent,
    private readonly documents: DocumentAgent,
    private readonly email: EmailAgent,
    private readonly calendar: CalendarAgent,
    private readonly phone: PhoneAgent,
    private readonly runtime: LocalRuntimeAgent,
  ) {}

  async runAgent(agent: string, input: any, orgId: string) {
    const map: Record<string, any> = {
      app_builder: this.appBuilder,
      workflow: this.workflow,
      documents: this.documents,
      email: this.email,
      calendar: this.calendar,
      phone: this.phone,
      runtime: this.runtime,
    };

    const selected = map[agent];
    if (!selected) throw new BadRequestException('Unknown agent');

    return selected.run(input, orgId);
  }
}
export class AppBuilderAgent {
  async run(input: any, orgId: string) {
    return {
      agent: 'app_builder',
      orgId,
      result: `Generated app with config: ${JSON.stringify(input)}`,
    };
  }
}
export class WorkflowAgent {
  async run(input: any, orgId: string) {
    return {
      agent: 'workflow',
      orgId,
      result: `Executed workflow: ${JSON.stringify(input)}`,
    };
  }
}
export class DocumentAgent {
  async run(input: any, orgId: string) {
    return {
      agent: 'documents',
      orgId,
      result: `Generated document: ${input.title || 'Untitled'}`,
    };
  }
}
export class EmailAgent {
  async run(input: any, orgId: string) {
    return {
      agent: 'email',
      orgId,
      result: `Processed email task: ${JSON.stringify(input)}`,
    };
  }
}
export class CalendarAgent {
  async run(input: any, orgId: string) {
    return {
      agent: 'calendar',
      orgId,
      result: `Calendar action: ${JSON.stringify(input)}`,
    };
  }
}
export class PhoneAgent {
  async run(input: any, orgId: string) {
    return {
      agent: 'phone',
      orgId,
      result: `Phone action: ${JSON.stringify(input)}`,
    };
  }
}
export class LocalRuntimeAgent {
  async run(input: any, orgId: string) {
    return {
      agent: 'runtime',
      orgId,
      result: `Executed local runtime task: ${JSON.stringify(input)}`,
    };
  }
}
import { AgentsModule } from './agents/agents.module';
AgentsModule,
import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
import { Injectable } from '@nestjs/common';

interface StoredFile {
  id: string;
  orgId: string;
  fileName: string;
  size: number;
  url: string;
}

@Injectable()
export class StorageService {
  private files: StoredFile[] = [];

  upload(orgId: string, fileName: string, fileContent: string) {
    const file: StoredFile = {
      id: crypto.randomUUID(),
      orgId,
      fileName,
      size: fileContent.length,
      url: `/storage/${orgId}/${fileName}`, // stub URL
    };

    this.files.push(file);
    return file;
  }
}
import { StorageModule } from './storage/storage.module';
StorageModule,
