import { Controller, Post, Body } from '@nestjs/common';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Post('upload')
  upload(
    @Body()
    body: { orgId: string; fileName: string; mimeType: string; data: string },
  ) {
    return this.storage.upload(body);
  }
}
