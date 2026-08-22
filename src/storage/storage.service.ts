import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {
  async upload(body: {
    orgId: string;
    fileName: string;
    mimeType: string;
    data: string; // base64
  }) {
    return {
      id: crypto.randomUUID(),
      url: `https://files.mmms.app/${body.orgId}/${body.fileName}`,
    };
  }
}
