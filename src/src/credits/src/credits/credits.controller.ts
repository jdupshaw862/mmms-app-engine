import { Controller, Get } from '@nestjs/common';

@Controller('credits')
export class CreditsController {
  @Get()
  getCredits() {
    return { message: 'Credits endpoint working' };
  }
}

