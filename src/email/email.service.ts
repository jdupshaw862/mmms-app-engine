import { Injectable } from '@nestjs/common';
import { MxService } from './dns/mx.service';
import { SpfService } from './dns/spf.service';
import { DkimService } from './dns/dkim.service';
import { DmarcService } from './dns/dmarc.service';
import { SmtpService } from './smtp/smtp.service';
import { InboxService } from './inbox/inbox.service';

@Injectable()
export class EmailService {
  constructor(
    private readonly mx: MxService,
    private readonly spf: SpfService,
    private readonly dkim: DkimService,
    private readonly dmarc: DmarcService,
    private readonly smtp: SmtpService,
    private readonly inbox: InboxService,
  ) {}

  async provisionEmail(config: { orgId: string; domain: string; inbox: string }) {
    const mxRecords = await this.mx.setup(config.domain);
    const spfRecord = await this.spf.setup(config.domain);
    const dkimRecord = await this.dkim.setup(config.domain);
    const dmarcRecord = await this.dmarc.setup(config.domain);

    const smtpCredentials = await this.smtp.createCredentials(config.domain);
    const inbox = await this.inbox.createInbox(config.orgId, config.domain, config.inbox);

    return {
      status: 'success',
      domain: config.domain,
      inbox,
      dns: {
        mx: mxRecords,
        spf: spfRecord,
        dkim: dkimRecord,
        dmarc: dmarcRecord,
      },
      smtp: smtpCredentials,
    };
  }
}
