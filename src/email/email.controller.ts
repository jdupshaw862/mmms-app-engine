import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly email: EmailService) {}

  @Post('provision')
  provision(
    @Body()
    body: {
      orgId: string;
      domain: string;
      inbox: string;
    },
  ) {
    return this.email.provisionEmail(body);
  }
}
