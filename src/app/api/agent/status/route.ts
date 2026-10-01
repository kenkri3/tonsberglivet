import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasAgentApi = !!process.env.AGENT_API || !!process.env.NEXT_PUBLIC_AGENT_API;
  const botId =
    process.env.AGENT_API ||
    process.env.NEXT_PUBLIC_AGENT_API ||
    "";

  return NextResponse.json({
    success: true,
    status: "active",
    environmentConfigured: hasAgentApi,
    maskedBotId: botId.slice(0, 4) + "..." + botId.slice(-4),
    features: {
      iframeEmbedding: true,
      webWidget: true,
      autonomousDispatch: true,
      multiChannelReady: true,
    },
    timestamp: new Date().toISOString(),
  });
}
