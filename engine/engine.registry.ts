import { Injectable } from '@nestjs/common';

@Injectable()
export class EngineRegistry {
  private modules = new Map<string, any>();

  registerModules(modules: any[]) {
    modules.forEach((m) => {
      const key = (m && m.name) || String(m);
      this.modules.set(key, m);
    });
  }

  getModules() {
    return Array.from(this.modules.values());
  }

  clear() {
    this.modules.clear();
  }
}
