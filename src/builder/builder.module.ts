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
