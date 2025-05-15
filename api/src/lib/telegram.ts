import { Telegram } from "telegraf";

// Initialize the Telegram client with bot token from environment variables
const telegram = new Telegram(process.env.TELEGRAM_BOT_TOKEN || "");

// Default users to notify about graduation (comma-separated usernames without @ symbol)
const usersToNotify = (process.env.TELEGRAM_NOTIFY_USERS || "")
  .split(",")
  .map(username => username.trim())
  .filter(Boolean);

// Main group chat ID where graduation announcements are sent
const mainGroupChatId = process.env.TELEGRAM_MAIN_GROUP_ID || "";

// Community group ID (existing group where users will be invited)
const communityGroupId = process.env.TELEGRAM_COMMUNITY_GROUP_ID || "";

/**
 * Handles DEX graduation Telegram notifications
 */
export async function handleDexGraduation(
  brokerName: string,
  brokerId: string,
  makerFee: number,
  takerFee: number,
  walletAddress: string
): Promise<{
  inviteLink?: string;
}> {
  let inviteLink;

  try {
    if (communityGroupId) {
      try {
        inviteLink = await telegram.exportChatInviteLink(communityGroupId);
      } catch (error) {
        console.error("Error generating Telegram invite link:", error);
      }
    }

    console.log("usersToNotify", usersToNotify);
    if (usersToNotify.length > 0) {
      await notifyUsers(
        brokerName,
        brokerId,
        makerFee,
        takerFee,
        walletAddress
      );
    }

    if (mainGroupChatId) {
      try {
        await telegram.sendMessage(
          mainGroupChatId,
          `*New DEX Graduated!*\n\n` +
            `Env: Prod & Staging\n` +
            `Broker ID: \`${brokerId}\`\n` +
            `Broker Name: \`${brokerName}\`\n` +
            `Default Taker Fee: \`${takerFee} bps\` (${(takerFee * 0.01).toFixed(2)}%)\n` +
            `Default Maker Fee: \`${makerFee} bps\` (${(makerFee * 0.01).toFixed(2)}%)\n` +
            `Tier: public\n` +
            `Staking wallet: \`${walletAddress}\``,
          { parse_mode: "Markdown" }
        );
      } catch (error) {
        console.error("Error sending message to main group:", error);
      }
    }

    return {
      inviteLink,
    };
  } catch (error) {
    console.error("Error in DEX graduation Telegram handling:", error);
    return {
      inviteLink,
    };
  }
}

/**
 * Sends DMs to configured users about a new DEX graduation
 */
export async function notifyUsers(
  brokerName: string,
  brokerId: string,
  makerFee: number,
  takerFee: number,
  walletAddress: string
): Promise<void> {
  try {
    const message =
      `🔔 *DEX Graduation Notification* 🔔\n\n` +
      `A new DEX has graduated on Orderly Network:\n\n` +
      `Name: *${brokerName}*\n` +
      `ID: \`${brokerId}\`\n` +
      `Maker Fee: \`${makerFee} bps\` (${(makerFee * 0.01).toFixed(2)}%)\n` +
      `Taker Fee: \`${takerFee} bps\` (${(takerFee * 0.01).toFixed(2)}%)\n` +
      `Wallet: \`${walletAddress}\`\n` +
      `\nPlease reach out to welcome them to the ecosystem!`;

    // For DMs, use hardcoded chat IDs instead of trying to find them
    // Mapping of usernames to chat IDs must be configured manually
    const userChatIds: Record<string, string> = JSON.parse(
      process.env.TELEGRAM_USER_CHAT_IDS || "{}"
    );

    await Promise.allSettled(
      usersToNotify.map(async username => {
        try {
          const chatId = userChatIds[username];

          if (!chatId) {
            throw new Error(`Chat ID not configured for user ${username}`);
          }

          await telegram.sendMessage(chatId, message, {
            parse_mode: "Markdown",
          });
          return true;
        } catch (error) {
          console.error(`Failed to notify user ${username}:`, error);
          return false;
        }
      })
    );
  } catch (error) {
    console.error("Error notifying users about DEX graduation:", error);
  }
}
