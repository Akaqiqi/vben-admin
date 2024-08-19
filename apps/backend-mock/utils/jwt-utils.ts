import type { EventHandlerRequest, H3Event } from 'h3';

import jwt from 'jsonwebtoken';

import { UserInfo } from './mock-data';

export interface UserPayload extends UserInfo {
  iat: number;
  exp: number;
}

export function generateAccessToken(user: UserInfo) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2h' });
}

export function generateRefreshToken(user: UserInfo) {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '30d',
  });
}

export function verifyAccessToken(
  event: H3Event<EventHandlerRequest>,
): null | Omit<UserInfo, 'password'> {
  const authHeader = getHeader(event, 'Authorization');
  if (!authHeader?.startsWith('Bearer')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
    ) as UserPayload;

    const username = decoded.username;
    const user = MOCK_USERS.find((item) => item.username === username);
    const { password: _pwd, ...userinfo } = user;
    return userinfo;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(
  token: string,
): null | Omit<UserInfo, 'password'> {
  try {
    const decoded = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET,
    ) as UserPayload;
    const username = decoded.username;
    const user = MOCK_USERS.find((item) => item.username === username);
    const { password: _pwd, ...userinfo } = user;
    return userinfo;
  } catch {
    return null;
  }
}