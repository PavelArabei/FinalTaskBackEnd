import { Module } from '@nestjs/common';
import { GameService, GameGateway } from './';

@Module({
  providers: [GameService, GameGateway],
  imports: [],
  exports: [GameService],
})
export class GameModule {}
