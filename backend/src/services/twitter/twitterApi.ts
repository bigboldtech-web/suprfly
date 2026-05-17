import { decrypt } from '../encryption.service';
import { logger } from '../../utils/logger';

// X's public web bearer token — same for all users, used alongside cookies
const X_BEARER_TOKEN =
  'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

interface Tweet {
  tweetId: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  fullText: string;
  tweetUrl: string;
  createdAt: Date;
  conversationId?: string;
}

interface TweetResult {
  success: boolean;
  tweetId?: string;
  error?: string;
}

export class TwitterApiClient {
  private cookieString: string;
  private csrfToken: string;

  constructor(encryptedSessionData: string) {
    const cookies = decrypt(encryptedSessionData);
    this.cookieString = Object.entries(cookies)
      .map(([name, data]: [string, any]) => `${name}=${data.value}`)
      .join('; ');

    this.csrfToken = cookies['ct0']?.value || '';
  }

  private get headers(): Record<string, string> {
    return {
      cookie: this.cookieString,
      'x-csrf-token': this.csrfToken,
      authorization: X_BEARER_TOKEN,
      'x-twitter-active-user': 'yes',
      'x-twitter-client-language': 'en',
      'user-agent': USER_AGENT,
      'content-type': 'application/json',
    };
  }

  async getAccountInfo(): Promise<any> {
    const res = await fetch('https://x.com/i/api/1.1/account/settings.json', {
      headers: this.headers,
    });

    if (!res.ok) throw new Error(`Twitter getAccountInfo failed: ${res.status}`);
    return res.json();
  }

  async searchTweets(keyword: string, count = 20): Promise<Tweet[]> {
    const params = new URLSearchParams({
      q: keyword,
      tweet_search_mode: 'live',
      count: String(count),
      query_source: 'typed_query',
      pc: '1',
      spelling_corrections: '1',
    });

    const res = await fetch(
      `https://x.com/i/api/2/search/adaptive.json?${params}`,
      { headers: this.headers }
    );

    if (!res.ok) {
      logger.error(`Twitter searchTweets failed: ${res.status} for "${keyword}"`);
      return [];
    }

    const data: any = await res.json();
    return this.parseSearchResults(data);
  }

  async getUserTweets(userId: string, count = 10): Promise<Tweet[]> {
    const params = new URLSearchParams({
      count: String(count),
      include_reply_count: '1',
      tweet_mode: 'extended',
    });

    const res = await fetch(
      `https://x.com/i/api/2/timeline/profile/${userId}.json?${params}`,
      { headers: this.headers }
    );

    if (!res.ok) {
      logger.error(`Twitter getUserTweets failed: ${res.status} for user ${userId}`);
      return [];
    }

    const data: any = await res.json();
    return this.parseTimelineResults(data);
  }

  async postReply(tweetId: string, replyText: string): Promise<TweetResult> {
    // Using the CreateTweet GraphQL endpoint
    const res = await fetch('https://x.com/i/api/graphql/oB-5XsHNAbjvARJEc8CZFw/CreateTweet', {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        variables: {
          tweet_text: replyText,
          reply: {
            in_reply_to_tweet_id: tweetId,
            exclude_reply_user_ids: [],
          },
          dark_request: false,
          media: {
            media_entities: [],
            possibly_sensitive: false,
          },
          semantic_annotation_ids: [],
        },
        features: {
          communities_web_enable_tweet_community_results_fetch: true,
          c9s_tweet_anatomy_moderator_badge_enabled: true,
          tweetypie_unmention_optimization_enabled: true,
          responsive_web_edit_tweet_api_enabled: true,
          graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
          view_counts_everywhere_api_enabled: true,
          longform_notetweets_consumption_enabled: true,
          responsive_web_twitter_article_tweet_consumption_enabled: true,
          tweet_awards_web_tipping_enabled: false,
          creator_subscriptions_quote_tweet_preview_enabled: false,
          longform_notetweets_rich_text_read_enabled: true,
          longform_notetweets_inline_media_enabled: true,
          articles_preview_enabled: true,
          rweb_video_timestamps_enabled: true,
          rweb_tipjar_consumption_enabled: true,
          responsive_web_graphql_exclude_directive_enabled: true,
          verified_phone_label_enabled: false,
          freedom_of_speech_not_reach_fetch_enabled: true,
          standardized_nudges_misinfo: true,
          tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
          responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
          responsive_web_graphql_timeline_navigation_enabled: true,
          responsive_web_enhance_cards_enabled: false,
        },
        queryId: 'oB-5XsHNAbjvARJEc8CZFw',
      }),
    });

    if (res.ok) {
      const data: any = await res.json();
      const tweetResult =
        data?.data?.create_tweet?.tweet_results?.result;
      return {
        success: true,
        tweetId: tweetResult?.rest_id || tweetResult?.legacy?.id_str,
      };
    }

    const errorText = await res.text();
    logger.error(`Twitter postReply failed: ${res.status} — ${errorText}`);
    return { success: false, error: `${res.status}: ${errorText.substring(0, 200)}` };
  }

  async searchUsers(query: string): Promise<any[]> {
    const params = new URLSearchParams({
      q: query,
      src: 'search_box',
      result_type: 'users',
      count: '10',
    });

    const res = await fetch(
      `https://x.com/i/api/1.1/search/typeahead.json?${params}`,
      { headers: this.headers }
    );

    if (!res.ok) return [];

    const data: any = await res.json();
    return (data.users || []).map((u: any) => ({
      userId: u.id_str,
      name: u.name,
      username: u.screen_name,
      avatarUrl: u.profile_image_url_https,
      followerCount: u.followers_count,
      profileUrl: `https://x.com/${u.screen_name}`,
    }));
  }

  private parseSearchResults(data: any): Tweet[] {
    const tweets: Tweet[] = [];
    const globalTweets = data.globalObjects?.tweets || {};
    const globalUsers = data.globalObjects?.users || {};

    for (const [id, tweet] of Object.entries(globalTweets) as any[]) {
      const user = globalUsers[tweet.user_id_str] || {};

      // Filter out retweets and replies
      if (tweet.retweeted_status_id_str) continue;
      if (tweet.in_reply_to_status_id_str) continue;

      tweets.push({
        tweetId: tweet.id_str,
        authorId: tweet.user_id_str,
        authorName: user.name || '',
        authorUsername: user.screen_name || '',
        fullText: tweet.full_text || tweet.text || '',
        tweetUrl: `https://x.com/${user.screen_name}/status/${tweet.id_str}`,
        createdAt: new Date(tweet.created_at),
        conversationId: tweet.conversation_id_str,
      });
    }

    return tweets;
  }

  private parseTimelineResults(data: any): Tweet[] {
    const tweets: Tweet[] = [];
    const globalTweets = data.globalObjects?.tweets || {};
    const globalUsers = data.globalObjects?.users || {};

    for (const [id, tweet] of Object.entries(globalTweets) as any[]) {
      const user = globalUsers[tweet.user_id_str] || {};

      if (tweet.retweeted_status_id_str) continue;
      if (tweet.in_reply_to_status_id_str) continue;

      tweets.push({
        tweetId: tweet.id_str,
        authorId: tweet.user_id_str,
        authorName: user.name || '',
        authorUsername: user.screen_name || '',
        fullText: tweet.full_text || tweet.text || '',
        tweetUrl: `https://x.com/${user.screen_name}/status/${tweet.id_str}`,
        createdAt: new Date(tweet.created_at),
      });
    }

    return tweets;
  }
}
