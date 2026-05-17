import { decrypt } from '../encryption.service';
import { logger } from '../../utils/logger';

interface LinkedInProfile {
  userId: string;
  name: string;
  username: string;
  avatarUrl: string;
}

interface LinkedInPost {
  postId: string;
  activityUrn: string;
  authorId: string;
  authorName: string;
  authorUsername?: string;
  postContent: string;
  postUrl: string;
  publishedAt: Date;
}

interface CommentResult {
  success: boolean;
  commentId?: string;
  error?: string;
}

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export class LinkedInVoyagerClient {
  private cookieString: string;
  private csrfToken: string;

  constructor(encryptedSessionData: string) {
    const cookies = decrypt(encryptedSessionData);
    this.cookieString = Object.entries(cookies)
      .map(([name, data]: [string, any]) => `${name}=${data.value}`)
      .join('; ');

    // CSRF token from JSESSIONID (strip quotes)
    const jsessionId = cookies['JSESSIONID']?.value || '';
    this.csrfToken = `ajax:${jsessionId.replace(/"/g, '')}`;
  }

  private get headers(): Record<string, string> {
    return {
      cookie: this.cookieString,
      'csrf-token': this.csrfToken,
      'x-restli-protocol-version': '2.0.0',
      'x-li-lang': 'en_US',
      'user-agent': USER_AGENT,
      accept: 'application/vnd.linkedin.normalized+json+2.1',
      'accept-language': 'en-US,en;q=0.9',
    };
  }

  async getProfile(): Promise<LinkedInProfile> {
    const res = await fetch('https://www.linkedin.com/voyager/api/me', {
      headers: this.headers,
    });

    if (!res.ok) {
      throw new Error(`LinkedIn getProfile failed: ${res.status}`);
    }

    const data: any = await res.json();
    const mini = data.miniProfile || data;

    return {
      userId: mini.entityUrn?.split(':').pop() || '',
      name: `${mini.firstName || ''} ${mini.lastName || ''}`.trim(),
      username: mini.publicIdentifier || '',
      avatarUrl:
        mini.picture?.['com.linkedin.common.VectorImage']?.rootUrl +
          (mini.picture?.['com.linkedin.common.VectorImage']?.artifacts?.[0]
            ?.fileIdentifyingUrlPathSegment || '') || '',
    };
  }

  async searchPosts(keyword: string, count = 20): Promise<LinkedInPost[]> {
    const params = new URLSearchParams({
      q: 'all',
      keywords: keyword,
      filters: 'List(resultType->CONTENT,sortBy->DATE_POSTED)',
      count: String(count),
      start: '0',
      origin: 'GLOBAL_SEARCH_HEADER',
    });

    const res = await fetch(
      `https://www.linkedin.com/voyager/api/search/hits?${params}`,
      { headers: this.headers }
    );

    if (!res.ok) {
      logger.error(`LinkedIn searchPosts failed: ${res.status} for keyword "${keyword}"`);
      return [];
    }

    const data: any = await res.json();
    return this.parseSearchResults(data);
  }

  async getUserFeed(memberUrn: string, count = 10): Promise<LinkedInPost[]> {
    const params = new URLSearchParams({
      profileUrn: `urn:li:fsd_profile:${memberUrn}`,
      q: 'memberShareFeed',
      count: String(count),
    });

    const res = await fetch(
      `https://www.linkedin.com/voyager/api/feed/updatesV2?${params}`,
      { headers: this.headers }
    );

    if (!res.ok) {
      logger.error(`LinkedIn getUserFeed failed: ${res.status} for ${memberUrn}`);
      return [];
    }

    const data: any = await res.json();
    return this.parseFeedResults(data);
  }

  async postComment(activityUrn: string, commentText: string): Promise<CommentResult> {
    const res = await fetch('https://www.linkedin.com/voyager/api/feed/comments', {
      method: 'POST',
      headers: {
        ...this.headers,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        activityUrn,
        attributedText: {
          text: commentText,
          attributes: [],
        },
        parentComment: null,
      }),
    });

    if (res.ok) {
      const data: any = await res.json();
      return { success: true, commentId: data.entityUrn || data.id };
    }

    const errorText = await res.text();
    logger.error(`LinkedIn postComment failed: ${res.status} — ${errorText}`);
    return { success: false, error: `${res.status}: ${errorText.substring(0, 200)}` };
  }

  async searchProfiles(query: string, count = 10): Promise<any[]> {
    const params = new URLSearchParams({
      q: 'all',
      keywords: query,
      filters: 'List(resultType->PEOPLE)',
      count: String(count),
      origin: 'GLOBAL_SEARCH_HEADER',
    });

    const res = await fetch(
      `https://www.linkedin.com/voyager/api/search/hits?${params}`,
      { headers: this.headers }
    );

    if (!res.ok) return [];

    const data: any = await res.json();
    return this.parseProfileResults(data);
  }

  private parseSearchResults(data: any): LinkedInPost[] {
    const posts: LinkedInPost[] = [];
    const included = data.included || [];

    for (const item of included) {
      if (item.$type?.includes('Update') && item.commentary) {
        const activityUrn = item.entityUrn || item['*urn'] || '';
        const postId = activityUrn.split(':').pop() || '';

        posts.push({
          postId,
          activityUrn,
          authorId: item.author?.entityUrn?.split(':').pop() || '',
          authorName: `${item.author?.firstName || ''} ${item.author?.lastName || ''}`.trim(),
          authorUsername: item.author?.publicIdentifier || '',
          postContent: item.commentary?.text || item.commentary || '',
          postUrl: `https://www.linkedin.com/feed/update/${activityUrn}`,
          publishedAt: new Date(item.createdAt || Date.now()),
        });
      }
    }

    return posts;
  }

  private parseFeedResults(data: any): LinkedInPost[] {
    const posts: LinkedInPost[] = [];
    const elements = data.elements || [];

    for (const element of elements) {
      const update = element.value?.['com.linkedin.voyager.feed.render.UpdateV2'] || element;
      const commentary = update.commentary?.text?.text || '';
      if (!commentary) continue;

      const activityUrn = update.updateMetadata?.urn || update.entityUrn || '';
      const postId = activityUrn.split(':').pop() || '';
      const actor = update.actor || {};

      posts.push({
        postId,
        activityUrn,
        authorId: actor.entityUrn?.split(':').pop() || '',
        authorName: actor.name?.text || '',
        authorUsername: actor.navigationUrl?.split('/in/')?.pop()?.replace(/\/$/, '') || '',
        postContent: commentary,
        postUrl: `https://www.linkedin.com/feed/update/${activityUrn}`,
        publishedAt: new Date(update.createdAt || Date.now()),
      });
    }

    return posts;
  }

  private parseProfileResults(data: any): any[] {
    const profiles: any[] = [];
    const included = data.included || [];

    for (const item of included) {
      if (item.$type?.includes('MiniProfile') || item.publicIdentifier) {
        profiles.push({
          userId: item.entityUrn?.split(':').pop() || '',
          name: `${item.firstName || ''} ${item.lastName || ''}`.trim(),
          username: item.publicIdentifier || '',
          headline: item.occupation || '',
          avatarUrl:
            item.picture?.['com.linkedin.common.VectorImage']?.rootUrl || '',
          profileUrl: `https://www.linkedin.com/in/${item.publicIdentifier}`,
        });
      }
    }

    return profiles;
  }

  async getManagedOrganizations(): Promise<Array<{
    orgUrn: string; name: string; logoUrl?: string; vanityName?: string;
  }>> {
    try {
      const res = await fetch(
        'https://www.linkedin.com/voyager/api/organization/organizationalPagesV2?q=viewer',
        { headers: this.headers }
      );
      if (!res.ok) return [];
      const data: any = await res.json();
      const orgs: any[] = data.elements || data.included || [];
      return orgs
        .filter((o) => o.entityUrn?.includes('organization:'))
        .map((o) => ({
          orgUrn: o.entityUrn,
          name: o.name?.localized?.en_US || o.name || 'Company Page',
          logoUrl: o.logo?.['com.linkedin.common.VectorImage']?.rootUrl,
          vanityName: o.universalName || o.vanityName,
        }));
    } catch (err) {
      logger.error('getManagedOrganizations failed', err);
      return [];
    }
  }
}

export async function fetchManagedOrganizations(encryptedSessionData: string) {
  const client = new LinkedInVoyagerClient(encryptedSessionData);
  return client.getManagedOrganizations();
}
