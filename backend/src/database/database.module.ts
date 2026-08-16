import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './entities.list';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        // Managed hosts (Render, Railway, Heroku-style) inject a single
        // DATABASE_URL — prefer it when present. Local/.env setups keep
        // using the discrete DB_HOST/PORT/... vars below.
        ...(config.get<string>('database.url')
          ? { url: config.get<string>('database.url') }
          : {
              host: config.get<string>('database.host'),
              port: config.get<number>('database.port'),
              username: config.get<string>('database.username'),
              password: config.get<string>('database.password'),
              database: config.get<string>('database.name'),
            }),
        ssl: config.get<boolean>('database.ssl')
          ? { rejectUnauthorized: false }
          : false,
        entities,
        // Never true in production — use `npm run migration:run` instead.
        synchronize: config.get<boolean>('database.synchronize'),
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
