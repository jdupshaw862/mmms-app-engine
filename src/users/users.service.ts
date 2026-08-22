import { Injectable } from '@nestjs/common';

interface User {
  id: string;
  email: string;
  passwordHash: string;
  orgId: string;
  role: string;
}

@Injectable()
export class UsersService {
  private users: User[] = [];

  getById(id: string) {
    return this.users.find((u) => u.id === id) || null;
  }

  create(data: Omit<User, 'id'>) {
    const user: User = { id: crypto.randomUUID(), ...data };
    this.users.push(user);
    return user;
  }
}
