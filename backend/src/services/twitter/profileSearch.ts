import { TwitterApiClient } from './twitterApi';
import { logger } from '../../utils/logger';

export async function searchTwitterProfiles(
  encryptedSession: string,
  query: string
): Promise<any[]> {
  try {
    const client = new TwitterApiClient(encryptedSession);
    return await client.searchUsers(query);
  } catch (err) {
    logger.error('Twitter profile search error:', err);
    return [];
  }
}
