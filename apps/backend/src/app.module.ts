import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { ExercisesModule } from './exercises/exercises.module';
import { GroupsModule } from './groups/groups.module';
import { MediaModule } from './media/media.module';
import { PostsModule } from './posts/posts.module';
import { ProgramsModule } from './programs/programs.module';
import { RoutinesModule } from './routines/routines.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url:
          configService.get<string>('DATABASE_URL') ??
          'postgres://system_resources:system_resources@localhost:5432/system_resources',
        autoLoadEntities: true,
        synchronize: true, // TODO: replace with migrations in production
      }),
    }),
    AuthModule,
    AdminModule,
    UsersModule,
    GroupsModule,
    PostsModule,
    MediaModule,
    CommentsModule,
    SubscriptionsModule,
    ExercisesModule,
    RoutinesModule,
    ProgramsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
