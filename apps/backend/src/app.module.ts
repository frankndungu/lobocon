import { Module } from '@nestjs/common';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig, { DatabaseConfig } from './config/database.config';
import { KsmmClauseModule } from './ksmm-clauses/ksmm-clause.module';
import { ProjectModule } from './projects/project.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Use process.cwd() which points to where npm start is run from (apps/backend)
      envFilePath: join(process.cwd(), '../../.env'),
      load: [databaseConfig],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbConfig = config.get<DatabaseConfig>('database')!;

        return {
          type: 'postgres' as const,
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          // Keep __dirname for entities as they're relative to compiled output
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          logging: false,
        };
      },
    }),
    KsmmClauseModule,
    ProjectModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
