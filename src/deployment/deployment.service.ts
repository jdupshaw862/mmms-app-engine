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
