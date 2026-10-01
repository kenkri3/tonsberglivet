'use client';

import { useEffect } from 'react';

interface AgentWebWidgetProps {
  botId?: string;
  enabled?: boolean;
}

export function AgentWebWidget({
  botId = process.env.NEXT_PUBLIC_AGENT_API || '',
  enabled = true,
}: AgentWebWidgetProps) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Unngå duplikat initialisering
    if ((window as any).webbot && (window as any).webbot.invoked) {
      return;
    }

    try {
      const w = window as any;
      w.webbot = w.webbot || [];
      if (!w.webbot.init) {
        w.webbot.load = function (token: string) {
          const s = document.createElement('script');
          s.type = 'text/javascript';
          s.async = true;
          s.crossOrigin = 'anonymous';
          s.src = `https://agentic.botsify.com/web-bot/script/frame/${token}/webbot.js`;
          const firstScript = document.getElementsByTagName('script')[0];
          if (firstScript && firstScript.parentNode) {
            firstScript.parentNode.insertBefore(s, firstScript);
          } else {
            document.head.appendChild(s);
          }
        };
      }

      if (typeof w.webbot.load === 'function') {
        w.webbot.load(botId);
      }
    } catch (err) {
      console.warn('Kunne ikke laste agent webbot:', err);
    }
  }, [botId, enabled]);

  return null;
}
