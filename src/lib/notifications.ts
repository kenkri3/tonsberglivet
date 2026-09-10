import { getSetting } from './settings';

export interface ActionButton {
  label: string;
  actionId: string;
  style?: 'primary' | 'danger' | 'default';
  url?: string;
}

export interface AgentNotificationPayload {
  title: string;
  message: string;
  level?: 'info' | 'success' | 'warning' | 'error';
  fields?: Record<string, string | number | undefined>;
  actions?: ActionButton[];
  channel?: string;
}

/**
 * Sender interaktive varsler og handlingskort til Slack / Microsoft Teams / Discord.
 * Logger til konsoll dersom ingen webhook URL er konfigurert.
 */
export async function sendAgentNotification(payload: AgentNotificationPayload): Promise<{ success: boolean; sentViaWebhook: boolean }> {
  const webhookUrl =
    (await getSetting('agent_webhook_url')) ||
    (await getSetting('slack_webhook_url')) ||
    process.env.AGENT_WEBHOOK_URL ||
    process.env.SLACK_WEBHOOK_URL;

  const timestamp = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
  const icon =
    payload.level === 'success' ? '✅' :
    payload.level === 'warning' ? '⚠️' :
    payload.level === 'error' ? '🚨' : '📢';

  // Dersom ingen webhook er satt opp, logg defensivt og returner suksess
  if (!webhookUrl || webhookUrl.trim() === '') {
    console.log(`\n🔔 [AGENT VARSLING] [${timestamp}] ${icon} ${payload.title}`);
    console.log(`💬 ${payload.message}`);
    if (payload.fields && Object.keys(payload.fields).length > 0) {
      console.log('📋 Detaljer:', payload.fields);
    }
    if (payload.actions && payload.actions.length > 0) {
      console.log('🔘 Handlinger:', payload.actions.map(a => `[${a.label} -> ${a.actionId}]`).join(' | '));
    }
    return { success: true, sentViaWebhook: false };
  }

  try {
    // Bygg Slack Block Kit kompatibel payload
    const blocks: any[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${icon} ${payload.title}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: payload.message,
        },
      },
    ];

    // Legg til felter dersom angitt
    if (payload.fields && Object.keys(payload.fields).length > 0) {
      const fieldBlocks = Object.entries(payload.fields)
        .filter(([_, val]) => val !== undefined)
        .map(([key, val]) => ({
          type: 'mrkdwn',
          text: `*${key}:*\n${val}`,
        }));

      if (fieldBlocks.length > 0) {
        blocks.push({
          type: 'section',
          fields: fieldBlocks.slice(0, 10), // Slack limit per section
        });
      }
    }

    // Legg til interaktive knapper
    if (payload.actions && payload.actions.length > 0) {
      blocks.push({
        type: 'actions',
        elements: payload.actions.map((act) => ({
          type: 'button',
          text: {
            type: 'plain_text',
            text: act.label,
            emoji: true,
          },
          action_id: act.actionId,
          value: act.actionId,
          style: act.style === 'primary' ? 'primary' : act.style === 'danger' ? 'danger' : undefined,
          url: act.url,
        })),
      });
    }

    // Legg til footer tidsstempel
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Tønsberglivet Autonom Agent • ${timestamp}`,
        },
      ],
    });

    const bodyPayload = {
      text: `${icon} *${payload.title}*: ${payload.message}`,
      blocks,
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
    });

    if (!res.ok) {
      console.warn(`[Agent Notification] Webhook returnerte status ${res.status}`);
      return { success: false, sentViaWebhook: false };
    }

    return { success: true, sentViaWebhook: true };
  } catch (error) {
    console.error('[Agent Notification] Feil ved sending til webhook:', error);
    return { success: false, sentViaWebhook: false };
  }
}
