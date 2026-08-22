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
