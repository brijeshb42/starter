import passport from 'passport';
import Iron from '@hapi/iron';
import { User } from '@prisma/client';
import GithubStrategy from 'passport-github';

import * as userService from './services/user';
import { IncomingMessage, ServerResponse } from 'http';
import { parse, serialize } from 'cookie';

interface IncomingMessageWithUser extends IncomingMessage {
  user: User;
}

interface AuthUser {
  userId: number;
}

export interface UserSession {
  id: number;
  email: string;
  name: string;
}

passport.serializeUser<User, number>(async (user, done) => {
  done(null, userService.getUserId(user));
});

passport.deserializeUser<any, number>((id, done) => {
  userService.getUserById(id)
  .then(user => done(null, user))
  .catch(err => console.error(err));
});

passport.use(new GithubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  callbackURL: `/api/auth/callback/github`,
}, async (_, _1, profile, doneCb) => {
  try {
    const user = userService.getUserByGithub(profile);
    doneCb(null, user);
  } catch (err) {
    doneCb(err);
  }
}));

export async function handleUserLogin(req: IncomingMessageWithUser, res: ServerResponse) {
  const { id } = req.user;
  const authToken = await Iron.seal({
    userId: id,
  }, process.env.HASH_KEY!, Iron.defaults);
  const maxAge = 60 * 60 * 24 * 30; // 1 month
  const authCookie = serialize('auth.user', authToken, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge,
  });
  res.setHeader('Set-Cookie', authCookie);
  res.writeHead(302, { Location: '/' });
  res.end();
}

export async function getServerSession(req:IncomingMessage): Promise<{ user: UserSession | null }> {
  const token = parse(req.headers.cookie || '')['auth.user'];
  const nullUser = {
    user: null,
  };

  if (!token) {
    return nullUser;
  }
  
  let authUser: AuthUser;
  try {
    authUser = await Iron.unseal(token, process.env.HASH_KEY!, Iron.defaults) as AuthUser;
  } catch (err) {
    return nullUser;
  }

  const user = await userService.getUserById(authUser.userId);
  if (!user) {
    return nullUser;
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
}

export default passport;