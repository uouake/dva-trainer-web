import { Controller, Get } from '@nestjs/common';

// Very small health endpoint.
//
// This is useful for:
// - quickly checking the backend is up
// - wiring the frontend to a stable endpoint

@Controller('api/health')
export class HealthController {
  @Get()
  health() {
    return { ok: true };
  }
}
