import { Module } from '@nestjs/common';
import { CreditsModule } from './credits/credits.module';

@Module({
  imports: [CreditsModule],
})
export class AppModule {}
