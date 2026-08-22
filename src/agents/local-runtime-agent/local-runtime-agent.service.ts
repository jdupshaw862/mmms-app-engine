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
