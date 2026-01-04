import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserProfile } from '../../users/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): UserProfile => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
