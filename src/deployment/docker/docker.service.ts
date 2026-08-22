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
