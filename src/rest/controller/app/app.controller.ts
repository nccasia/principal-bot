import { Controller, Get } from '@nestjs/common';
import { MezonClient } from 'mezon-sdk';
import { TextChannel } from 'mezon-sdk/dist/cjs/mezon-client/structures/TextChannel';
import { Clan } from 'mezon-sdk/dist/cjs/mezon-client/structures/Clan';
import { AppService } from 'src/rest/services/app.service';

@Controller()
export class AppController {
  private client: MezonClient;
  constructor(private readonly appService: AppService) {
    this.client = new MezonClient('747248656c4c51364d5f547074366678');
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('send-test')
  async sendTest(): Promise<void> {
    await this.client.login();
    const channel = await this.findChannel(
      '1840673714937532416',
      '1840673714920755200',
    );
    const response = await channel.send({
      t: 'Học sinh nghiêmmmmmm, chào cờ. Chào!',
    });
    console.log('Message sent:', response);
  }

  async findClan(clanId?: string): Promise<Clan> {
    if (!clanId) {
      // If no clan specified and bot is only in one clan, use that
      if (this.client.clans.size === 1) {
        return this.client.clans.first();
      }
      // List available clans
      const clanList = Array.from(this.client.clans.values())
        .map((g) => `"${g.name}"`)
        .join(', ');
      throw new Error(
        `Bot is in multiple servers. Please specify server name or ID. Available servers: ${clanList}`,
      );
    }

    // Try to fetch by ID first
    try {
      const clan = await this.client.clans.fetch(clanId);
      if (clan) return clan;
    } catch {
      // If ID fetch fails, search by name
      const clans = this.client.clans.filter(
        (g) => g.name.toLowerCase() === clanId.toLowerCase(),
      );

      if (clans.size === 0) {
        const availableClans = Array.from(this.client.clans.values())
          .map((g) => `"${g.name}"`)
          .join(', ');
        throw new Error(
          `Clan "${clanId}" not found. Available servers: ${availableClans}`,
        );
      }
      if (clans.size > 1) {
        const clanList = clans.map((g) => `${g.name} (ID: ${g.id})`).join(', ');
        throw new Error(
          `Multiple servers found with name "${clanId}": ${clanList}. Please specify the server ID.`,
        );
      }
      return clans.first();
    }
    throw new Error(`Clan "${clanId}" not found`);
  }

  async findChannel(channelId: string, clanId?: string): Promise<TextChannel> {
    const clan = await this.findClan(clanId);

    // First try to fetch by ID
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (channel instanceof TextChannel && channel.clan.id === clan.id) {
        return channel;
      }
    } catch {
      // If fetching by ID fails, search by name in the specified clan
      const channels = clan.channels.cache.filter(
        (channel): channel is TextChannel =>
          channel instanceof TextChannel &&
          (channel.name?.toLowerCase() === channelId.toLowerCase() ||
            channel.name?.toLowerCase() ===
              channelId.toLowerCase().replace('#', '')),
      );

      if (channels.size === 0) {
        const availableChannels = clan.channels.cache
          .filter((c): c is TextChannel => c instanceof TextChannel)
          .map((c) => `"#${c.name}"`)
          .join(', ');
        throw new Error(
          `Channel "${channelId}" not found in server "${clan.name}". Available channels: ${availableChannels}`,
        );
      }
      if (channels.size > 1) {
        const channelList = channels
          .map((c) => `#${c.name} (${c.id})`)
          .join(', ');
        throw new Error(
          `Multiple channels found with name "${channelId}" in server "${clan.name}": ${channelList}. Please specify the channel ID.`,
        );
      }
      return channels.first();
    }
    throw new Error(
      `Channel "${channelId}" is not a text channel or not found in server "${clan.name}"`,
    );
  }
}
