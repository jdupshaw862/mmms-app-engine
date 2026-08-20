import { Module } from '@nestjs/common';
import { EngineService } from './engine.service';
import { EngineRegistry } from './engine.registry';
import { EngineLoader } from './engine.loader';

@Module({
  providers: [EngineService, EngineRegistry, EngineLoader],
  exports: [EngineService],
})
export class EngineModule {}
