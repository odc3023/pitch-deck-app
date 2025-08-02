import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiContentController } from './ai-content.controller';
import { AiContentService } from './ai-content.service';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [ConfigModule, FirebaseModule],
  controllers: [AiContentController],
  providers: [AiContentService],
  exports: [AiContentService],
})
export class AiContentModule {}