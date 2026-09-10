import { getSetting } from './settings';

export interface AgentNotificationPayload {
  type: 'NEW_BOOKING' | 'NEW_MESSAGE' | 'NEW_PARTNER';
  title: string;
  description: string;
  fields?: Array<{ label: string; value: string }>;
  actionId?: string;
}

/**
 * Sender interaktive varsler og kort direkte til damenes kanal på Slack, Teams eller Discord.
 */
export async function sendAgentNotification(payload: AgentNotificationPayload): Promise<void> {
  const slackUrl = await getSetting('slack_webhook_url');
  const teamsUrl = await getSetting('teams_webhook_url');
  const discordUrl = await getSetting('discord_webhook_url');

  // 1. Slack (støtter interaktive handlingsknapper)
  if (slackUrl && slackUrl.startsWith('http')) {
    try {
      await fetch(slackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🔔 *${payload.title}*\n${payload.description}`,
          blocks: [
            {
              type: 'header',
              text: { type: 'plain_text', text: payload.title, emoji: true },
            },
            {
              type: 'section',
              text: { type: 'mrkdwn', text: payload.description },
              fields: payload.fields?.map((f) => ({
                type: 'mrkdwn',
                text: `*${f.label}:*\n${f.value}`,
              })),
            },
            ...(payload.actionId
              ? [
                  {
                    type: 'actions',
                    elements: [
                      {
                        type: 'button',
                        text: { type: 'plain_text', text: '✅ Godkjenn', emoji: true },
                        style: 'primary',
                        value: `approve_${payload.actionId}`,
                        action_id: 'approve_booking',
                      },
                      {
                        type: 'button',
                        text: { type: 'plain_text', text: '❌ Avslå', emoji: true },
                        style: 'danger',
                        value: `reject_${payload.actionId}`,
                        action_id: 'reject_booking',
                      },
                    ],
                  },
                ]
              : []),
          ],
        }),
      });
    } catch (err) {
      console.error('[Notification] Slack dispatch error:', err);
    }
  }

  // 2. Microsoft Teams (Adaptive Card format)
  if (teamsUrl && teamsUrl.startsWith('http')) {
    try {
      await fetch(teamsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '@type': 'MessageCard',
          '@context': 'http://schema.org/extensions',
          themeColor: '1E3A5F',
          summary: payload.title,
          sections: [
            {
              activityTitle: payload.title,
              activitySubtitle: 'Tønsberglivet Autonom Agent',
              text: payload.description,
              facts: payload.fields?.map((f) => ({ name: f.label, value: f.value })),
            },
          ],
        }),
      });
    } catch (err) {
      console.error('[Notification] Teams dispatch error:', err);
    }
  }

  // 3. Discord (Rich Embed)
  if (discordUrl && discordUrl.startsWith('http')) {
    try {
      await fetch(discordUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🔔 **${payload.title}**\n${payload.description}`,
          embeds: [
            {
              title: payload.title,
              description: payload.description,
              color: 0x1e3a5f,
              fields: payload.fields?.map((f) => ({ name: f.label, value: f.value, inline: true })),
              footer: { text: 'Tønsberglivet Agent' },
            },
          ],
        }),
      });
    } catch (err) {
      console.error('[Notification] Discord dispatch error:', err);
    }
  }
}
