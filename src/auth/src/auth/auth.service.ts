import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  login(email: string, password: string) {
    // TODO: Replace with real authentication logic
    return {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: { email },
    };
  }

  refresh(refreshToken: string) {
    // TODO: Replace with real refresh logic
    return {
      accessToken: 'new-mock-access-token',
      refreshToken: 'new-mock-refresh-token',
    };
  }
}
