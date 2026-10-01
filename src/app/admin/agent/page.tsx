'use client';

import { TonsbergAgentChat } from '@/components/admin/TonsbergAgentChat';

export default function AgentPage() {
  return (
    <div className="w-full h-[calc(100dvh-8.5rem)] lg:h-[calc(100vh-6.5rem)] flex flex-col">
      <TonsbergAgentChat
        className="w-full h-full flex-1"
        userName="Cecilie"
      />
    </div>
  );
}
