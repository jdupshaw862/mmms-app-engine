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
