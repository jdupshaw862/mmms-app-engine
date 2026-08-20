import { Injectable } from '@nestjs/common';

@Injectable()
export class CreditsService {
  getCredits() {
    return { message: 'Credits endpoint working' };
  }
}
