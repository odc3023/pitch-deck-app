import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DecksController } from './decks.controller';
import { DecksService } from './decks.service';
import { Deck } from './entities/deck.entity';
import { UsersModule } from '../users/users.module';
import { AiContentModule } from 'src/ai-content/ai-content.module';

@Module({
  imports: [TypeOrmModule.forFeature([Deck]), UsersModule, AiContentModule],
  controllers: [DecksController],
  providers: [DecksService],
  exports: [DecksService],
})
export class DecksModule {}