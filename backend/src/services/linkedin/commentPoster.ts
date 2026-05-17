import { LinkedInVoyagerClient } from './voyagerApi';
import { logger } from '../../utils/logger';

export async function postLinkedInComment(
  encryptedSession: string,
  activityUrn: string,
  commentText: string
): Promise<{ success: boolean; commentId?: string; error?: string }> {
  try {
    const client = new LinkedInVoyagerClient(encryptedSession);
    const result = await client.postComment(activityUrn, commentText);
    return result;
  } catch (err: any) {
    logger.error('LinkedIn comment posting error:', err);
    return { success: false, error: err.message };
  }
}
