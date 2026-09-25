import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { loginSchema } from './auth.validation';
import { ApiError } from '../../common/utils/ApiError';

export class AuthController {
  static login = asyncHandler(async (req: Request, res: Response) => {
    const validated = loginSchema.parse(req.body);
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await AuthService.login(validated.email, validated.password, ip, userAgent);

    // Set refresh token in httpOnly secure cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  });

  static refresh = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    const result = await AuthService.refresh(token);

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: result,
    });
  });

  static logout = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    if (userId) {
      await AuthService.logout(userId, ip, userAgent);
    }

    res.clearCookie('refreshToken');

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  });

  static me = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const user = await AuthService.getMe(req.user.userId);

    return res.status(200).json({
      success: true,
      data: user,
    });
  });
}
