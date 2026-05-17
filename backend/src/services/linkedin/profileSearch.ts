import { LinkedInVoyagerClient } from './voyagerApi';
import { logger } from '../../utils/logger';

export async function searchLinkedInProfiles(
  encryptedSession: string,
  query: string
): Promise<any[]> {
  try {
    const client = new LinkedInVoyagerClient(encryptedSession);
    return await client.searchProfiles(query, 10);
  } catch (err) {
    logger.error('LinkedIn profile search error:', err);
    return [];
  }
}
