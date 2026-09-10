import { getSetting } from './settings';

export interface ActionButton {
  label: string;
  actionId: string;
  style?: 'primary' | 'danger' | 'default';
  url?: string;
}

export interface AgentNotificationPayload {
  type?: 'NEW_BOOKING' | 'NEW_MESSAGE' | 'NEW_PARTNER' | 'CRON_SYNC' | 'INFO';
  title: string;
  description?: string;
  message?: string;
  level?: 'info' | 'success' | 'warning' | 'error';
  fields?: Array<{ label: string; value: string }> | Record<string, string | number | undefined>;
  actionId?: string;
  actions?: ActionButton[];
}

/**
 * Sender interaktive varsler og kort direkte til Slack, Microsoft Teams eller Discord.
 */
export async function sendAgentNotification(payload: AgentNotificationPayload): Promise<{ success: boolean; sentViaWebhook: boolean }> {
  const slackUrl = (await getSetting('slack_webhook_url')) || (await getSetting('agent_webhook_url'));
  const teamsUrl = await getSetting('teams_webhook_url');
  const discordUrl = await getSetting('discord_webhook_url');

  const textContent = payload.description || payload.message || '';
  const timestamp = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });

  // Normaliser felter til [{ label, value }]
  let normalizedFields: Array<{ label: string; value: string }> = [];
  if (Array.isArray(payload.fields)) {
    normalizedFields = payload.fields;
  } else if (payload.fields && typeof payload.fields === 'object') {
    normalizedFields = Object.entries(payload.fields)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => ({ label: k, value: String(v) }));
  }

  let sent = false;

  // 1. Slack (støtter interaktive handlingsknapper og Block Kit)
  if (slackUrl && slackUrl.startsWith('http')) {
    try {
      const blocks: any[] = [
        {
          type: 'header',
          text: { type: 'plain_text', text: payload.title, emoji: true },
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: textContent },
        },
      ];

      if (normalizedFields.length > 0) {
        blocks.push({
          type: 'section',
          fields: normalizedFields.slice(0, 10).map((f) => ({
            type: 'mrkdwn',
            text: `*${f.label}:*\n${f.value}`,
          })),
        });
      }

      if (payload.actionId) {
        blocks.push({
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: '✅ Godkjenn', emoji: true },
              style: 'primary',
              value: `approve_${payload.actionId}`,
              action_id: `approve_${payload.actionId}`,
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: '❌ Avslå', emoji: true },
              style: 'danger',
              value: `reject_${payload.actionId}`,
              action_id: `reject_${payload.actionId}`,
            },
          ],
        });
      } else if (payload.actions && payload.actions.length > 0) {
        blocks.push({
          type: 'actions',
          elements: payload.actions.map((a) => ({
            type: 'button',
            text: { type: 'plain_text', text: a.label, emoji: true },
            style: a.style === 'primary' ? 'primary' : a.style === 'danger' ? 'danger' : undefined,
            value: a.actionId,
            action_id: a.actionId,
            url: a.url,
          })),
        });
      }

      const res = await fetch(slackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🔔 *${payload.title}*\n${textContent}`,
          blocks,
        }),
      });

      if (res.ok) sent = true;
    } catch (err) {
      console.error('[Notification] Slack dispatch error:', err);
    }
  }

  // 2. Microsoft Teams (Adaptive / MessageCard)
  if (teamsUrl && teamsUrl.startsWith('http')) {
    try {
      const res = await fetch(teamsUrl, {
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
              activitySubtitle: `Tønsberglivet Agent • ${timestamp}`,
              text: textContent,
              facts: normalizedFields.map((f) => ({ name: f.label, value: f.value })),
            },
          ],
        }),
      });
      if (res.ok) sent = true;
    } catch (err) {
      console.error('[Notification] Teams dispatch error:', err);
    }
  }

  // 3. Discord (Rich Embed)
  if (discordUrl && discordUrl.startsWith('http')) {
    try {
      const res = await fetch(discordUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🔔 **${payload.title}**\n${textContent}`,
          embeds: [
            {
              title: payload.title,
              description: textContent,
              color: 0x1e3a5f,
              fields: normalizedFields.map((f) => ({ name: f.label, value: f.value, inline: true })),
              footer: { text: `Tønsberglivet Agent • ${timestamp}` },
            },
          ],
        }),
      });
      if (res.ok) sent = true;
    } catch (err) {
      console.error('[Notification] Discord dispatch error:', err);
    }
  }

  // Fallback til konsoll dersom ingen webhook er satt opp
  if (!sent) {
    console.log(`\n🔔 [AGENT NOTIFICATION] [${timestamp}] ${payload.title}`);
    console.log(`💬 ${textContent}`);
    if (normalizedFields.length > 0) {
      console.log('📋 Detaljer:', normalizedFields);
    }
  }

  return { success: true, sentViaWebhook: sent };
}
