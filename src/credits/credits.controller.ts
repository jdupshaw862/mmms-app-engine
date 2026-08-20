import { Controller, Get } from '@nestjs/common';
import { CreditsService } from './credits.service';

@Controller('credits')
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get()
  getCredits() {
    return this.creditsService.getCredits();
  }
}
