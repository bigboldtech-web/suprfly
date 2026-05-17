import { ConnectedAccount, Keyword, Creator } from '@prisma/client';
import { TwitterApiClient } from './twitterApi';
import { prisma } from '../../config/database';
import { checkPostSafety } from '../ai/contentSafety';
import { logger } from '../../utils/logger';

export async function discoverByKeywords(
  account: ConnectedAccount,
  keywords: Keyword[]
): Promise<string[]> {
  const client = new TwitterApiClient(account.sessionData);
  const newPostIds: string[] = [];

  for (const keyword of keywords) {
    try {
      const tweets = await client.searchTweets(keyword.keyword, 20);

      for (const tweet of tweets) {
        const existing = await prisma.discoveredPost.findUnique({
          where: { platform_postId: { platform: 'TWITTER', postId: tweet.tweetId } },
        });
        if (existing) continue;

        // 6-hour freshness window
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
        if (tweet.createdAt < sixHoursAgo) continue;

        const safety = checkPostSafety(tweet.fullText);

        const created = await prisma.discoveredPost.create({
          data: {
            platform: 'TWITTER',
            postId: tweet.tweetId,
            authorId: tweet.authorId,
            authorName: tweet.authorName,
            authorUsername: tweet.authorUsername,
            postContent: tweet.fullText,
            postUrl: tweet.tweetUrl,
            publishedAt: tweet.createdAt,
            matchType: 'KEYWORD',
            matchValue: keyword.keyword,
            isSensitive: !safety.safe,
            sensitiveReason: safety.reason,
          },
        });

        if (safety.safe) newPostIds.push(created.id);
      }

      await delay(2000 + Math.random() * 3000);
    } catch (err) {
      logger.error(`Twitter keyword discovery failed for "${keyword.keyword}":`, err);
    }
  }

  return newPostIds;
}

export async function discoverByCreators(
  account: ConnectedAccount,
  creators: Creator[]
): Promise<string[]> {
  const client = new TwitterApiClient(account.sessionData);
  const newPostIds: string[] = [];

  for (const creator of creators) {
    try {
      const tweets = await client.getUserTweets(creator.creatorProfileId, 5);

      for (const tweet of tweets) {
        const existing = await prisma.discoveredPost.findUnique({
          where: { platform_postId: { platform: 'TWITTER', postId: tweet.tweetId } },
        });
        if (existing) continue;

        // 1-hour freshness for creators on X
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (tweet.createdAt < oneHourAgo) continue;

        const safety = checkPostSafety(tweet.fullText);

        const created = await prisma.discoveredPost.create({
          data: {
            platform: 'TWITTER',
            postId: tweet.tweetId,
            authorId: tweet.authorId,
            authorName: tweet.authorName,
            authorUsername: tweet.authorUsername,
            postContent: tweet.fullText,
            postUrl: tweet.tweetUrl,
            publishedAt: tweet.createdAt,
            matchType: 'CREATOR',
            matchValue: creator.creatorName,
            isSensitive: !safety.safe,
            sensitiveReason: safety.reason,
          },
        });

        if (safety.safe) newPostIds.push(created.id);
      }

      await prisma.creator.update({
        where: { id: creator.id },
        data: { lastCheckedAt: new Date() },
      });

      await delay(2000 + Math.random() * 3000);
    } catch (err) {
      logger.error(`Twitter creator discovery failed for "${creator.creatorName}":`, err);
    }
  }

  return newPostIds;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
