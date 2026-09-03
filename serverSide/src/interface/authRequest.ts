import { Request } from 'express';
import { JwtPayload } from './jwtInterface.js';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}