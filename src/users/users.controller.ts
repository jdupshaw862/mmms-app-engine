import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get(':id')
  get(@Param('id') id: string) {
    return this.users.getById(id);
  }

  @Post()
  create(
    @Body()
    body: { email: string; passwordHash: string; orgId: string; role: string },
  ) {
    return this.users.create(body);
  }
}
