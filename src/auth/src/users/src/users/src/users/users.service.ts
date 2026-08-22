import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  getUser(id: string) {
    return {
      id,
      email: `user${id}@example.com`,
      name: `User ${id}`,
    };
  }
}
