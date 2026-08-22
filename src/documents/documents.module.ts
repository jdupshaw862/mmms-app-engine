import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { SopService } from './sop/sop.service';
import { ManualsService } from './manuals/manuals.service';
import { PdfService } from './pdf/pdf.service';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, SopService, ManualsService, PdfService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
