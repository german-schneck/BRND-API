import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import { CastResponse } from './types';
import { getConfig } from '../../security/config';
import { Channel, SearchedUser } from '@neynar/nodejs-sdk/build/neynar-api/v2';
import { User } from '@neynar/nodejs-sdk/build/neynar-api/v1';

export default class NeynarService {
  private client: NeynarAPIClient;

  constructor() {
    const config = getConfig();
    this.client = new NeynarAPIClient(config.neynar.apiKey);
  }

  getTrendingCastInAChannel = async (
    channel: string,
  ): Promise<CastResponse[]> => {
    const response: CastResponse[] = [];

    try {
      const channelInfo: Channel = (
        await this.client.lookupChannel(channel.slice(1))
      ).channel;
      const feed = await this.client.fetchFeedByChannelIds([channelInfo.id], {
        limit: 5,
      });

      for (const cast of feed.casts) {
        let image = '';
        if (cast.embeds.length > 0) {
          const embed = cast.embeds[0];
          if (embed) {
            const metadata = embed['metadata'];
            if (metadata) {
              const contentType = metadata['content_type'];
              if (contentType && contentType.includes('image/'))
                image = embed['url'];
            }
          }
        }

        response.push({
          creator: cast.author.display_name,
          creatorPfp: cast.author.pfp_url,
          creatorPowerBadge: cast.author.power_badge,
          text: cast.text,
          image,
          warpcastUrl: `https://warpcast.com/${cast.author.username}/${cast.hash.slice(0, 10)}`,
        });
      }
    } catch (e) {
      console.log(e);
    }

    return response;
  };

  getTrendingCastInAProfile = async (
    profile: string,
  ): Promise<CastResponse[]> => {
    const response: CastResponse[] = [];

    try {
      const users = (await this.client.searchUser(profile.slice(1))).result
        .users;
      let selectedProfile: SearchedUser = undefined;
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        if (user.username === profile.slice(1)) {
          selectedProfile = user;
        }
      }

      if (selectedProfile !== undefined) {
        const result = await this.client.fetchAllCastsCreatedByUser(
          selectedProfile.fid,
          {
            limit: 5,
          },
        );

        const casts = result.result.casts;
        for (const cast of casts) {
          const author = cast.author as unknown as User;
          let image = '';

          if (cast.embeds.length > 0) {
            const embed = cast.embeds[0];
            if (embed) {
              const metadata = embed['metadata'];
              if (metadata) {
                const contentType = metadata['content_type'];
                if (contentType && contentType.includes('image/'))
                  image = embed['url'];
              }
            }
          }

          response.push({
            creator: author['displayName'],
            creatorPfp: author['pfp']?.url,
            creatorPowerBadge: author['powerBadge'],
            text: cast.text,
            image,
            warpcastUrl: `https://warpcast.com/${author.username}/${cast.hash.slice(0, 10)}`,
          });
        }
      }
    } catch (e) {
      console.log(e);
    }

    return response;
  };
}
