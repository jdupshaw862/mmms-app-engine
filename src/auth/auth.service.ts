import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  async login(email: string, password: string) {
    const userId = 'mock-user-id'; // TODO: validate via UsersService
    const accessToken = this.jwt.sign({ sub: userId, email });
    const refreshToken = this.jwt.sign(
      { sub: userId, email, type: 'refresh' },
      { expiresIn: '30d' },
    );
    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken);
      if (payload.type !== 'refresh') throw new Error();
      const accessToken = this.jwt.sign({ sub: payload.sub, email: payload.email });
      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
