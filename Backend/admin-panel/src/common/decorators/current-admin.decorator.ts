import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentAdminPayload {
  id: string;
  sub: string;
  email: string;
  fullName: string;
  role: string;
}

export const CurrentAdmin = createParamDecorator(
  (data: keyof CurrentAdminPayload | undefined, ctx: ExecutionContext): CurrentAdminPayload | any => {
    const request = ctx.switchToHttp().getRequest();
    const admin = request.admin || request.user;
    if (!admin) return null;
    return data ? admin[data] : admin;
  },
);
