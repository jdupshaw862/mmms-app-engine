1. package.json
json
{
  "name": "mmms-app-generator-backend",
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
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1",
    "stripe": "^14.0.0",
    "axios": "^1.7.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "typescript": "^5.4.0"
  }
}
2. tsconfig.json
json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": false,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "es2017",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true
  },
  "exclude": ["node_modules", "dist"]
}
3. src/main.ts
ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
4. src/app.module.ts
ts
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
  ],
})
export class AppModule {}
AUTH MODULE (src/auth/*)
ts
// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
ts
// src/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password);
  }

  @Post('refresh')
  refresh(@Body() body: { refreshToken: string }) {
    return this.auth.refresh(body.refreshToken);
  }
}
ts
// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  async login(email: string, password: string) {
    const userId = 'mock-user-id'; // TODO: validate via UsersService
    const accessToken = this.jwt.sign({ sub: userId, email });
    const refreshToken = this.jwt.sign(
      { sub: userId, email, type: 'refresh' },
      { expiresIn: '30d' },
    );
    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken);
      if (payload.type !== 'refresh') throw new Error();
      const accessToken = this.jwt.sign({ sub: payload.sub, email: payload.email });
      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
ts
// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
USERS MODULE (src/users/*)
ts
// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
ts
// src/users/users.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get(':id')
  get(@Param('id') id: string) {
    return this.users.getById(id);
  }

  @Post()
  create(
    @Body()
    body: { email: string; passwordHash: string; orgId: string; role: string },
  ) {
    return this.users.create(body);
  }
}
ts
// src/users/users.service.ts
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

  getById(id: string) {
    return this.users.find((u) => u.id === id) || null;
  }

  create(data: Omit<User, 'id'>) {
    const user: User = { id: crypto.randomUUID(), ...data };
    this.users.push(user);
    return user;
  }
}
BILLING MODULE (src/billing/*)
ts
// src/billing/billing.module.ts
import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';

@Module({
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
ts
// src/billing/billing.controller.ts
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
ts
// src/billing/billing.service.ts
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
CREDITS MODULE (src/credits/*)
ts
// src/credits/credits.module.ts
import { Module } from '@nestjs/common';
import { CreditsController } from './credits.controller';
import { CreditsService } from './credits.service';

@Module({
  controllers: [CreditsController],
  providers: [CreditsService],
  exports: [CreditsService],
})
export class CreditsModule {}
ts
// src/credits/credits.controller.ts
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
ts
// src/credits/credits.service.ts
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
APP BUILDER MODULE (src/builder/*)
ts
// src/builder/builder.module.ts
import { Module } from '@nestjs/common';
import { BuilderController } from './builder.controller';
import { BuilderService } from './builder.service';
import { UiService } from './ui/ui.service';
import { DbService } from './database/db.service';
import { ApiService } from './api/api.service';
import { DeployService } from './deploy/deploy.service';
import { TemplatesService } from './templates/templates.service';

@Module({
  controllers: [BuilderController],
  providers: [
    BuilderService,
    UiService,
    DbService,
    ApiService,
    DeployService,
    TemplatesService,
  ],
  exports: [BuilderService],
})
export class BuilderModule {}
ts
// src/builder/builder.controller.ts
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
      workflows: any;
      apis: any;
    },
  ) {
    return this.builder.generateApp(body);
  }
}
ts
// src/builder/builder.service.ts
import { Injectable } from '@nestjs/common';
import { UiService } from './ui/ui.service';
import { DbService } from './database/db.service';
import { ApiService } from './api/api.service';
import { DeployService } from './deploy/deploy.service';
import { TemplatesService } from './templates/templates.service';

@Injectable()
export class BuilderService {
  constructor(
    private readonly ui: UiService,
    private readonly db: DbService,
    private readonly api: ApiService,
    private readonly deploy: DeployService,
    private readonly templates: TemplatesService,
  ) {}

  async generateApp(config: any) {
    const uiBuild = await this.ui.generateUi(config.ui);
    const dbBuild = await this.db.generateDatabase(config.database);
    const apiBuild = await this.api.generateApi(config.apis);
    const templateBuild = await this.templates.applyTemplates(config);

    const deployment = await this.deploy.deployApp({
      orgId: config.orgId,
      appName: config.appName,
      uiBuild,
      dbBuild,
      apiBuild,
      templateBuild,
    });

    return {
      status: 'success',
      appUrl: deployment.url,
      deploymentId: deployment.id,
    };
  }
}
ts
// src/builder/ui/ui.service.ts
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
ts
// src/builder/database/db.service.ts
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
ts
// src/builder/api/api.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiService {
  async generateApi(apiConfig: any) {
    return {
      apiId: crypto.randomUUID(),
      routes: apiConfig,
    };
  }
}
ts
// src/builder/deploy/deploy.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class DeployService {
  async deployApp(build: any) {
    return {
      id: crypto.randomUUID(),
      url: `https://apps.mmms.app/${build.orgId}/${build.appName}`,
      build,
    };
  }
}
ts
// src/builder/templates/templates.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class TemplatesService {
  async applyTemplates(config: any) {
    return {
      templateId: crypto.randomUUID(),
      applied: true,
      config,
    };
  }
}
WORKFLOW MODULE (src/workflow/*)
ts
// src/workflow/workflow.module.ts
import { Module } from '@nestjs/common';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';

@Module({
  controllers: [WorkflowController],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule {}
ts
// src/workflow/workflow.controller.ts
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
ts
// src/workflow/workflow.service.ts
import { Injectable } from '@nestjs/common';
import { HttpNode } from './nodes/http.node';
import { DbNode } from './nodes/db.node';
import { ConditionNode } from './nodes.condition.node';
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
ts
// src/workflow/nodes/http.node.ts
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
ts
// src/workflow/nodes/db.node.ts
export class DbNode {
  async run(config: { query: string; params?: any[] }) {
    return {
      executed: true,
      query: config.query,
      params: config.params || [],
    };
  }
}
ts
// src/workflow/nodes/condition.node.ts
export class ConditionNode {
  async run(config: { if: string; equals: any }, payload: any) {
    const value = payload[config.if];
    return value === config.equals;
  }
}
ts
// src/workflow/nodes/delay.node.ts
export class DelayNode {
  async run(config: { ms: number }) {
    await new Promise((resolve) => setTimeout(resolve, config.ms));
    return { delayed: config.ms };
  }
}
ts
// src/workflow/nodes/ai.node.ts
export class AiNode {
  async run(config: { prompt: string }, payload: any) {
    return {
      aiResponse: `AI processed: ${config.prompt}`,
      payload,
    };
  }
}
ts
// src/workflow/nodes/email.node.ts
export class EmailNode {
  async run(config: { to: string; subject: string; body: string }) {
    return {
      sent: true,
      to: config.to,
      subject: config.subject,
      body: config.body,
    };
  }
}
ts
// src/workflow/nodes/webhook.node.ts
import axios from 'axios';

export class WebhookNode {
  async run(config: { url: string; payload: any }) {
    const response = await axios.post(config.url, config.payload);
    return response.data;
  }
}
DEPLOYMENT MODULE (src/deployment/*)
ts
// src/deployment/deployment.module.ts
import { Module } from '@nestjs/common';
import { DeploymentController } from './deployment.controller';
import { DeploymentService } from './deployment.service';
import { DockerService } from './docker/docker.service';
import { SslService } from './ssl/ssl.service';
import { DnsService } from './dns/dns.service';

@Module({
  controllers: [DeploymentController],
  providers: [DeploymentService, DockerService, SslService, DnsService],
  exports: [DeploymentService],
})
export class DeploymentModule {}
ts
// src/deployment/deployment.controller.ts
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
ts
// src/deployment/deployment.service.ts
import { Injectable } from '@nestjs/common';
import { DockerService } from './docker/docker.service';
import { SslService } from './ssl/ssl.service';
import { DnsService } from './dns/dns.service';

@Injectable()
export class DeploymentService {
  constructor(
    private readonly docker: DockerService,
    private readonly ssl: SslService,
    private readonly dns: DnsService,
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
        : `https://apps.mmms.app/${config.orgId}/${config.appName}`,
      container,
      domainSetup,
    };
  }
}
ts
// src/deployment/docker/docker.service.ts
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
ts
// src/deployment/ssl/ssl.service.ts
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
ts
// src/deployment/dns/dns.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class DnsService {
  async configureDomain(domain: string) {
    return {
      domain,
      records: [
        { type: 'A', value: '123.45.67.89' },
        { type: 'CNAME', value: 'apps.mmms.app' },
      ],
    };
  }
}
EMAIL MODULE (src/email/*)
ts
// src/email/email.module.ts
import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { MxService } from './dns/mx.service';
import { SpfService } from './dns/spf.service';
import { DkimService } from './dns/dkim.service';
import { DmarcService } from './dns/dmarc.service';
import { SmtpService } from './smtp/smtp.service';
import { InboxService } from './inbox/inbox.service';

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
ts
// src/email/email.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly email: EmailService) {}

  @Post('provision')
  provision(
    @Body()
    body: {
      orgId: string;
      domain: string;
      inbox: string;
    },
  ) {
    return this.email.provisionEmail(body);
  }
}
ts
// src/email/email.service.ts
import { Injectable } from '@nestjs/common';
import { MxService } from './dns/mx.service';
import { SpfService } from './dns/spf.service';
import { DkimService } from './dns/dkim.service';
import { DmarcService } from './dns/dmarc.service';
import { SmtpService } from './smtp/smtp.service';
import { InboxService } from './inbox/inbox.service';

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
ts
// src/email/dns/mx.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class MxService {
  async setup(domain: string) {
    return [
      { type: 'MX', priority: 10, value: `mail.${domain}` },
      { type: 'A', value: '123.45.67.89' },
    ];
  }
}
ts
// src/email/dns/spf.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class SpfService {
  async setup(domain: string) {
    return {
      type: 'TXT',
      value: `v=spf1 include:_spf.mmms.app ~all`,
    };
  }
}
ts
// src/email/dns/dkim.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class DkimService {
  async setup(domain: string) {
    return {
      selector: 'mmms',
      publicKey: 'PUBLIC_KEY_PLACEHOLDER',
    };
  }
}
ts
// src/email/dns/dmarc.service.ts
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
ts
// src/email/smtp/smtp.service.ts
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
ts
// src/email/inbox/inbox.service.ts
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
AGENTS MODULE (src/agents/*)
ts
// src/agents/agents.module.ts
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
ts
// src/agents/agents.controller.ts
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
ts
// src/agents/agents.service.ts
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
ts
// src/agents/app-builder-agent/app-builder-agent.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppBuilderAgentService {
  async run(orgId: string, payload: any) {
    return {
      agent: 'app-builder',
      orgId,
      generatedApp: {
        name: payload.name || 'Untitled App',
        ui: payload.ui || {},
        database: payload.database || {},
        workflows: payload.workflows || [],
      },
    };
  }
}
ts
// src/agents/workflow-agent/workflow-agent.service.ts
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
ts
// src/agents/document-agent/document-agent.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class DocumentAgentService {
  async run(orgId: string, payload: any) {
    return {
      agent: 'document',
      orgId,
      document: {
        title: payload.title || 'Untitled Document',
        content: payload.content || '',
      },
    };
  }
}
ts
// src/agents/email-agent/email-agent.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailAgentService {
  async run(orgId: string, payload: any) {
    return {
      agent: 'email',
      orgId,
      email: {
        to: payload.to,
        subject: payload.subject,
        body: payload.body,
      },
    };
  }
}
ts
// src/agents/calendar-agent/calendar-agent.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class CalendarAgentService {
  async run(orgId: string, payload: any) {
    return {
      agent: 'calendar',
      orgId,
      event: {
        title: payload.title,
        date: payload.date,
        attendees: payload.attendees || [],
      },
    };
  }
}
ts
// src/agents/phone-agent/phone-agent.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class PhoneAgentService {
  async run(orgId: string, payload: any) {
    return {
      agent: 'phone',
      orgId,
      call: {
        to: payload.to,
        action: payload.action || 'route',
      },
    };
  }
}
ts
// src/agents/local-runtime-agent/local-runtime-agent.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class LocalRuntimeAgentService {
  async run(orgId: string, payload: any) {
    return {
      agent: 'local-runtime',
      orgId,
      executed: true,
      script: payload.script,
    };
  }
}
DOCUMENTS MODULE (src/documents/*)
ts
// src/documents/documents.module.ts
import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { SopService } from './sop/sop.service';
import { ManualsService } from './manuals/manuals.service';
import { PdfService } from './pdf/pdf.service';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, SopService, ManualsService, PdfService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
ts
// src/documents/documents.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Post('generate')
  generate(
    @Body()
    body: {
      orgId: string;
      type: 'sop' | 'manual' | 'pdf';
      payload: any;
    },
  ) {
    return this.documents.generate(body.orgId, body.type, body.payload);
  }
}
ts
// src/documents/documents.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { SopService } from './sop/sop.service';
import { ManualsService } from './manuals/manuals.service';
import { PdfService } from './pdf/pdf.service';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly sop: SopService,
    private readonly manuals: ManualsService,
    private readonly pdf: PdfService,
  ) {}

  async generate(orgId: string, type: string, payload: any) {
    switch (type) {
      case 'sop':
        return this.sop.generate(orgId, payload);
      case 'manual':
        return this.manuals.generate(orgId, payload);
      case 'pdf':
        return this.pdf.generate(orgId, payload);
      default:
        throw new BadRequestException('Unknown document type');
    }
  }
}
ts
// src/documents/sop/sop.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class SopService {
  async generate(orgId: string, payload: any) {
    return {
      id: crypto.randomUUID(),
      orgId,
      type: 'sop',
      title: payload.title,
      steps: payload.steps,
      createdAt: Date.now(),
    };
  }
}
ts
// src/documents/manuals/manuals.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class ManualsService {
  async generate(orgId: string, payload: any) {
    return {
      id: crypto.randomUUID(),
      orgId,
      type: 'manual',
      category: payload.category,
      content: payload.content,
      createdAt: Date.now(),
    };
  }
}
ts
// src/documents/pdf/pdf.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class PdfService {
  async generate(orgId: string, payload: any) {
    return {
      id: crypto.randomUUID(),
      orgId,
      type: 'pdf',
      html: payload.html,
      createdAt: Date.now(),
    };
  }
}
STORAGE MODULE (src/storage/*)
ts
// src/storage/storage.module.ts
import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
ts
// src/storage/storage.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Post('upload')
  upload(
    @Body()
    body: { orgId: string; fileName: string; mimeType: string; data: string },
  ) {
    return this.storage.upload(body);
  }
}
ts
// src/storage/storage.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {
  async upload(body: {
    orgId: string;
    fileName: string;
    mimeType: string;
    data: string; // base64
  }) {
    return {
      id: crypto.randomUUID(),
      url: `https://files.mmms.app/${body.orgId}/${body.fileName}`,
    };
  }
}
5. Simple Dockerfile (optional)
dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./ 
RUN npm install

COPY tsconfig.json nest-cli.json* ./ 
COPY src ./src

RUN npm run build

EXPOSE 3000
CMD ["node", "dist/main.js"]
