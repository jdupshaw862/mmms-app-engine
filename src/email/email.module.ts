import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { MxService } from './dns/mx.service';
import { SpfService } from './dns/spf.service';
import { DkimService } from './dns/dkim.service';
import { DmarcService } from './dns/dmarc.service';
import { SmtpService } from './smtp/smtp.service';
import { InboxService } from './inbox/inbox.service';

@Module({
  controllers: [EmailController],
  providers: [
    EmailService,
    MxService,
    SpfService,
    DkimService,
    DmarcService,
    SmtpService,
    InboxService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
