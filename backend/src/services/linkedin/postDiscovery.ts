import { ConnectedAccount, Keyword, Creator } from '@prisma/client';
import { LinkedInVoyagerClient } from './voyagerApi';
import { prisma } from '../../config/database';
import { checkPostSafety } from '../ai/contentSafety';
import { logger } from '../../utils/logger';

export async function discoverByKeywords(
  account: ConnectedAccount,
  keywords: Keyword[]
): Promise<string[]> {
  const client = new LinkedInVoyagerClient(account.sessionData);
  const newPostIds: string[] = [];

  for (const keyword of keywords) {
    try {
      const posts = await client.searchPosts(keyword.keyword, 20);

      for (const post of posts) {
        // Skip if already discovered
        const existing = await prisma.discoveredPost.findUnique({
          where: { platform_postId: { platform: 'LINKEDIN', postId: post.postId } },
        });
        if (existing) continue;

        // Freshness check: only posts from last 6 hours
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
        if (post.publishedAt < sixHoursAgo) continue;

        // Content safety check
        const safety = checkPostSafety(post.postContent);

        const created = await prisma.discoveredPost.create({
          data: {
            platform: 'LINKEDIN',
            postId: post.postId,
            authorId: post.authorId,
            authorName: post.authorName,
            authorUsername: post.authorUsername,
            postContent: post.postContent,
            postUrl: post.postUrl,
            publishedAt: post.publishedAt,
            matchType: 'KEYWORD',
            matchValue: keyword.keyword,
            isSensitive: !safety.safe,
            sensitiveReason: safety.reason,
          },
        });

        if (safety.safe) {
          newPostIds.push(created.id);
        }
      }

      // Rate limiting delay between keywords
      await delay(2000 + Math.random() * 3000);
    } catch (err) {
      logger.error(`LinkedIn keyword discovery failed for "${keyword.keyword}":`, err);
    }
  }

  return newPostIds;
}

export async function discoverByCreators(
  account: ConnectedAccount,
  creators: Creator[]
): Promise<string[]> {
  const client = new LinkedInVoyagerClient(account.sessionData);
  const newPostIds: string[] = [];

  for (const creator of creators) {
    try {
      const posts = await client.getUserFeed(creator.creatorProfileId, 5);

      for (const post of posts) {
        const existing = await prisma.discoveredPost.findUnique({
          where: { platform_postId: { platform: 'LINKEDIN', postId: post.postId } },
        });
        if (existing) continue;

        // Creator posts: 30 min freshness window (speed matters)
        const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
        if (post.publishedAt < thirtyMinAgo) continue;

        const safety = checkPostSafety(post.postContent);

        const created = await prisma.discoveredPost.create({
          data: {
            platform: 'LINKEDIN',
            postId: post.postId,
            authorId: post.authorId,
            authorName: post.authorName,
            authorUsername: post.authorUsername,
            postContent: post.postContent,
            postUrl: post.postUrl,
            publishedAt: post.publishedAt,
            matchType: 'CREATOR',
            matchValue: creator.creatorName,
            isSensitive: !safety.safe,
            sensitiveReason: safety.reason,
          },
        });

        if (safety.safe) {
          newPostIds.push(created.id);
        }
      }

      // Update last checked
      await prisma.creator.update({
        where: { id: creator.id },
        data: { lastCheckedAt: new Date() },
      });

      await delay(2000 + Math.random() * 3000);
    } catch (err) {
      logger.error(`LinkedIn creator discovery failed for "${creator.creatorName}":`, err);
    }
  }

  return newPostIds;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
