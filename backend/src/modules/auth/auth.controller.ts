import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import type { SuperAdminUser } from '../../database/entities/super-admin-user.entity';

const REFRESH_COOKIE = 'refresh_token';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateCredentials(
      dto.email,
      dto.password,
    );
    const tokens = await this.authService.issueTokens(user, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
    this.setRefreshCookie(
      res,
      tokens.refreshToken,
      tokens.refreshTokenExpiresAt,
    );
    return {
      accessToken: tokens.accessToken,
      user: this.serializeUser(user),
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (!raw) throw new UnauthorizedException('Missing refresh token');

    const tokens = await this.authService.rotateRefreshToken(raw, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
    this.setRefreshCookie(
      res,
      tokens.refreshToken,
      tokens.refreshTokenExpiresAt,
    );
    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (raw) await this.authService.revokeRefreshToken(raw);
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
    return { success: true };
  }

  @Get('me')
  async me(@CurrentUser() authUser: AuthenticatedUser) {
    // Returns the same shape as /auth/login's `user` field, so the frontend
    // never has to special-case a "refreshed on page load" session.
    const user = await this.authService.getProfile(authUser.userId);
    return this.serializeUser(user);
  }

  private serializeUser(user: SuperAdminUser) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role.name,
      permissions: user.role.permissions,
    };
  }

  private setRefreshCookie(res: Response, token: string, expiresAt: Date) {
    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: this.config.get<string>('nodeEnv') === 'production',
      sameSite: 'lax',
      path: '/api/auth',
      expires: expiresAt,
    });
  }
}
