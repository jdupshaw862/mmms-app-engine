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
