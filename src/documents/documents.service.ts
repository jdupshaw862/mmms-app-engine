import { Injectable, BadRequestException } from '@nestjs/common';
import { SopService } from './sop/sop.service';
import { ManualsService } from './manuals/manuals.service';
import { PdfService } from './pdf/pdf.service';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly sop: SopService,
    private readonly manuals: ManualsService,
    private readonly pdf: PdfService,
  ) {}

  async generate(orgId: string, type: string, payload: any) {
    switch (type) {
      case 'sop':
        return this.sop.generate(orgId, payload);
      case 'manual':
        return this.manuals.generate(orgId, payload);
      case 'pdf':
        return this.pdf.generate(orgId, payload);
      default:
        throw new BadRequestException('Unknown document type');
    }
  }
}
