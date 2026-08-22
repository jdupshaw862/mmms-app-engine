import { Injectable } from '@nestjs/common';

@Injectable()
export class CalendarAgentService {
  async run(orgId: string, payload: any) {
    return {
      agent: 'calendar',
      orgId,
      event: {
        title: payload.title,
        date: payload.date,
        attendees: payload.attendees || [],
      },
    };
  }
}
