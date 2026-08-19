import { Injectable } from '@nestjs/common';

@Injectable()
export class CreditsService {
  getCredits() {
    return { message: 'Credits service working' };
  }
}
