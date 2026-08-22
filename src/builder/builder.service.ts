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
