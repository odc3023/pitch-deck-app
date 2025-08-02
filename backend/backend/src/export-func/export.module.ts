import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { DecksModule } from '../decks/decks.module';
import { UsersModule } from '../users/users.module'; //  Add users module

@Module({
  imports: [DecksModule, UsersModule], //  
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}