/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Injectable, Logger } from '@nestjs/common';
import { MezonClient } from 'mezon-sdk';
import { TextChannel } from 'mezon-sdk/dist/cjs/mezon-client/structures/TextChannel';
import { ExpiredFormEmbed } from './embed-props';
import { CACHE_DURATION } from './helper';
import { CachingService } from 'src/common/services/caching.service';

@Injectable()
export class FormExpirationHandler {
  private static readonly logger = new Logger(FormExpirationHandler.name);
  private static expirationTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(private readonly cachingService: CachingService) {}

  startExpirationTimer(
    commandId: string,
    userId: string,
    client: MezonClient,
    channelId: string,
  ): void {
    const timerKey = `${commandId}-${userId}`;

    this.clearExpirationTimer(timerKey);

    const timer = setTimeout(async () => {
      try {
        const isFormStillValid = await this.cachingService.get(
          `valid-user-to-click-button-${timerKey}`,
        );
        if (!isFormStillValid) {
          FormExpirationHandler.logger.log(
            `Form ${commandId} for user ${userId} already processed, skipping expiration`,
          );
          return;
        }

        FormExpirationHandler.logger.log(
          `Form ${commandId} for user ${userId} has expired after 5 minutes`,
        );

        try {
          const responseMessageId = (await this.cachingService.get(
            `response-message-${commandId}-${userId}`,
          )) as string;
          const targetMessageId = responseMessageId || commandId;

          FormExpirationHandler.logger.log(
            `Using message ID ${targetMessageId} to expire form (original: ${commandId}, response: ${responseMessageId || 'not found'})`,
          );

          const channel = await client.channels.fetch(channelId);
          if (!channel) {
            FormExpirationHandler.logger.error(
              `Could not find channel ${channelId} to expire form`,
            );
            return;
          }

          const message = await (channel as TextChannel).messages.fetch(
            targetMessageId,
          );
          if (!message) {
            FormExpirationHandler.logger.error(
              `Could not find message ${targetMessageId} to expire form`,
            );
            return;
          }

          await message.update({
            embed: ExpiredFormEmbed,
            components: [],
          });

          await this.cachingService.del(
            `valid-user-to-click-button-${timerKey}`,
          );
          await this.cachingService.del(`cv-attachment-${timerKey}`);
          await this.cachingService.del(`avatar-${timerKey}`);
          await this.cachingService.del(
            `response-message-${commandId}-${userId}`,
          );

          FormExpirationHandler.logger.log(
            `Successfully expired form ${commandId} for user ${userId}`,
          );
        } catch (error) {
          FormExpirationHandler.logger.error(
            `Error expiring form ${commandId} for user ${userId}:`,
            error,
          );

          if (error instanceof Error) {
            FormExpirationHandler.logger.error(
              `Error message: ${error.message}`,
            );
          }
        }
      } finally {
        FormExpirationHandler.expirationTimers.delete(timerKey);
      }
    }, CACHE_DURATION.FIVE_MINUTES_MS);

    FormExpirationHandler.expirationTimers.set(timerKey, timer);

    FormExpirationHandler.logger.log(
      `Started 5-minute expiration timer for form ${commandId} (user: ${userId})`,
    );
  }

  clearExpirationTimer(timerKey: string): void {
    const existingTimer = FormExpirationHandler.expirationTimers.get(timerKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
      FormExpirationHandler.expirationTimers.delete(timerKey);
      FormExpirationHandler.logger.log(
        `Cleared existing expiration timer for ${timerKey}`,
      );
    }
  }

  async clearFormTimer(messageId: string, userId: string): Promise<void> {
    const timerKey = `${messageId}-${userId}`;
    this.clearExpirationTimer(timerKey);

    await this.cachingService.del(`response-message-${messageId}-${userId}`);
  }
}
