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
