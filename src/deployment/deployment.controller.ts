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
