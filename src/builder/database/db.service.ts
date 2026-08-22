import { Injectable } from '@nestjs/common';

@Injectable()
export class DbService {
  async generateDatabase(dbConfig: any) {
    return {
      schemaId: crypto.randomUUID(),
      schema: dbConfig,
    };
  }
}
