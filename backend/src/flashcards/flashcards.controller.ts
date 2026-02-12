import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FlashcardsService } from './flashcards.service';

@Controller('api/flashcards')
@UseGuards(JwtAuthGuard)
export class FlashcardsController {
  constructor(private readonly flashcardsService: FlashcardsService) {}

  @Get()
  async findAll() {
    return this.flashcardsService.findAll();
  }

  @Get('random')
  async findRandom(@Query('count') count: string, @Req() req: any) {
    const limit = Math.min(parseInt(count, 10) || 10, 50);
    return this.flashcardsService.findRandom(limit, req.user.id);
  }

  @Get('stats')
  async getStats(@Req() req: any) {
    return this.flashcardsService.getStats(req.user.id);
  }

  @Post('progress')
  async saveProgress(
    @Body() body: { flashcardId: string; known: boolean },
    @Req() req: any,
  ) {
    await this.flashcardsService.saveProgress(req.user.id, body.flashcardId, body.known);
    return { success: true };
  }
}
