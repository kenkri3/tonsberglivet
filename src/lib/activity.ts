import { prisma } from '@/lib/prisma';
import { SessionUser } from '@/lib/auth';

export interface LogActivityParams {
  user?: SessionUser | null;
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  action: string;
  details: string;
  targetType?: 'Article' | 'BookingRequest' | 'User' | 'Event' | 'Partner' | 'Note' | 'Task' | 'Setting' | 'System';
  targetId?: string | null;
}

/**
 * Logger en administrativ eller redaksjonell handling til felles aktivitetslogg.
 * Kaster aldri feil som avbryter hovedoperasjonen.
 */
export async function logActivity(params: LogActivityParams) {
  try {
    const userId = params.user?.id || params.userId || null;
    const userName = params.user?.name || params.userName || null;
    const userEmail = params.user?.email || params.userEmail || null;
    const userRole = params.user?.role || params.userRole || null;

    return await prisma.activityLog.create({
      data: {
        userId,
        userName,
        userEmail,
        userRole,
        action: params.action,
        details: params.details,
        targetType: params.targetType || null,
        targetId: params.targetId || null,
      },
    });
  } catch (err) {
    console.error('[ActivityLog error]:', err);
    return null;
  }
}
