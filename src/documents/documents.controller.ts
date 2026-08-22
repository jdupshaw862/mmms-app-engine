import { Controller, Post, Body } from '@nestjs/common';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Post('generate')
  generate(
    @Body()
    body: {
      orgId: string;
      type: 'sop' | 'manual' | 'pdf';
      payload: any;
    },
  ) {
    return this.documents.generate(body.orgId, body.type, body.payload);
  }
}
