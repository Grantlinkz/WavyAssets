import { Controller, Get, Head, HttpCode, HttpStatus } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Head()
  @HttpCode(HttpStatus.OK)
  root(): { status: string; service: string; timestamp: string } {
    return {
      status: 'ok',
      service: 'wavyassets-user-dashboard',
      timestamp: new Date().toISOString(),
    };
  }
}
