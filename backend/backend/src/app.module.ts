import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { FirebaseModule } from './firebase/firebase.module';
import { DecksModule } from './decks/decks.module';
import { AiContentModule } from './ai-content/ai-content.module';
import { ExportModule } from './export-func/export.module';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USERNAME', 'postgres'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME', 'pitch_deck_db'),
        autoLoadEntities: true,
        synchronize: configService.get('NODE_ENV') !== 'production', // Only sync in development
        logging: configService.get('NODE_ENV') === 'development', // Log queries in development
      }),
      inject: [ConfigService],
    }),

    UsersModule,
    FirebaseModule,
    DecksModule,
    AiContentModule,
    ExportModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
