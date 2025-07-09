import { NormalizedEvent } from './event';
import { User } from '@prisma/client';

export interface EventClaimRequest {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  verificationToken?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: User;
  eventId: string;
  event: NormalizedEvent;
}