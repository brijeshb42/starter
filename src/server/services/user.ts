import { User } from '@prisma/client';
import { Profile as GithubProfile } from 'passport-github';
import prisma from '../db';

export function getUserId(user: User) {
  return user.id;
}

export async function getUserById(id: number) {
  return await prisma.user.findUnique({
    where: {
      id,
    },
  });
}

export async function getUserByGithub(profile: GithubProfile) {
  let email = profile.emails && profile.emails[0].value;
  const avatar = profile.photos && profile.photos[0].value;
  if (!email) {
    email = `github_${profile.id}@placeholder.bitwiser.in`;
  }
  let user = await prisma.user.findUnique({
    where: {
      githubUserId: profile.id,
    },
  });

  if (!user) {
    user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          githubUserId: profile.id,
          avatar,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email,
          name: profile.displayName || profile.username || 'Name',
          githubUserId: profile.id,
          avatar,
        },
      });
    }
  }

  return user;
}