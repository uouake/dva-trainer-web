import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserEntity } from '../infrastructure/db/user.entity';
import { env } from '../config/env';

// AuthModule
//
// Module d'authentification GitHub OAuth avec JWT.
// Configure Passport et les stratégies JWT.

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: env('JWT_SECRET') || 'dev-secret-change-in-production',
      signOptions: {
        expiresIn: (env('JWT_EXPIRATION') || '7d') as `${number}d` | `${number}h` | `${number}m`,
      },
    }),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
