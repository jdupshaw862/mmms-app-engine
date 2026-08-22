import { Controller, Get, Param } from '@nestjs/common';
import { CreditsService } from './credits.service';

@Controller('credits')
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get(':userId')
  getCredits(@Param('userId') userId: string) {
    return this.creditsService.getCredits(userId);
  }
}
