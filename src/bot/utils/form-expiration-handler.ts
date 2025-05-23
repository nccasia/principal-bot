/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Injectable, Logger } from '@nestjs/common';
import { MezonClient } from 'mezon-sdk';
import { TextChannel } from 'mezon-sdk/dist/cjs/mezon-client/structures/TextChannel';
import cache from './shared-cache';
import { ExpiredFormEmbed } from './embed-props';
import { CACHE_DURATION } from './helper';

@Injectable()
export class FormExpirationHandler {
  private static readonly logger = new Logger(FormExpirationHandler.name);
  private static expirationTimers: Map<string, NodeJS.Timeout> = new Map();

  static startExpirationTimer(
    commandId: string,
    userId: string,
    client: MezonClient,
    channelId: string,
  ): void {
    const timerKey = `${commandId}-${userId}`;

    this.clearExpirationTimer(timerKey);

    const timer = setTimeout(async () => {
      try {
        const isFormStillValid = cache.get(
          `valid-user-to-click-button-${timerKey}`,
        );
        if (!isFormStillValid) {
          this.logger.log(
            `Form ${commandId} for user ${userId} already processed, skipping expiration`,
          );
          return;
        }

        this.logger.log(
          `Form ${commandId} for user ${userId} has expired after 5 minutes`,
        );

        try {
          const responseMessageId = cache.get(
            `response-message-${commandId}-${userId}`,
          ) as string;
          const targetMessageId = responseMessageId || commandId;

          this.logger.log(
            `Using message ID ${targetMessageId} to expire form (original: ${commandId}, response: ${responseMessageId || 'not found'})`,
          );

          const channel = await client.channels.fetch(channelId);
          if (!channel) {
            this.logger.error(
              `Could not find channel ${channelId} to expire form`,
            );
            return;
          }

          const message = await (channel as TextChannel).messages.fetch(
            targetMessageId,
          );
          if (!message) {
            this.logger.error(
              `Could not find message ${targetMessageId} to expire form`,
            );
            return;
          }

          await message.update({
            embed: ExpiredFormEmbed,
            components: [],
          });

          cache.del(`valid-user-to-click-button-${timerKey}`);
          cache.del(`cv-attachment-${timerKey}`);
          cache.del(`avatar-${timerKey}`);
          cache.del(`response-message-${commandId}-${userId}`);

          this.logger.log(
            `Successfully expired form ${commandId} for user ${userId}`,
          );
        } catch (error) {
          this.logger.error(
            `Error expiring form ${commandId} for user ${userId}:`,
            error,
          );

          if (error instanceof Error) {
            this.logger.error(`Error message: ${error.message}`);
          }
        }
      } finally {
        this.expirationTimers.delete(timerKey);
      }
    }, CACHE_DURATION.FIVE_MINUTES_MS);

    this.expirationTimers.set(timerKey, timer);

    this.logger.log(
      `Started 5-minute expiration timer for form ${commandId} (user: ${userId})`,
    );
  }

  static clearExpirationTimer(timerKey: string): void {
    const existingTimer = this.expirationTimers.get(timerKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.expirationTimers.delete(timerKey);
      this.logger.log(`Cleared existing expiration timer for ${timerKey}`);
    }
  }

  static clearFormTimer(messageId: string, userId: string): void {
    const timerKey = `${messageId}-${userId}`;
    this.clearExpirationTimer(timerKey);

    cache.del(`response-message-${messageId}-${userId}`);
  }
}
