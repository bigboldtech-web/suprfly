import { TwitterApiClient } from './twitterApi';
import { logger } from '../../utils/logger';

export async function postTwitterReply(
  encryptedSession: string,
  tweetId: string,
  replyText: string
): Promise<{ success: boolean; tweetId?: string; error?: string }> {
  try {
    const client = new TwitterApiClient(encryptedSession);
    return await client.postReply(tweetId, replyText);
  } catch (err: any) {
    logger.error('Twitter reply posting error:', err);
    return { success: false, error: err.message };
  }
}
