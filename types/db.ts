import { Event as PrismaEvent, User as PrismaUser } from '@prisma/client';

export interface Event extends PrismaEvent {
  organizer?: User;
  category?: Category;
  attendees?: UserAttendingEvent[];
  promotions?: Promotion[];
  claimRequests?: EventClaimRequest[];
}

export interface User extends PrismaUser {
  organizedEvents?: Event[];
  eventsAttending?: UserAttendingEvent[];
  eventClaimRequests?: EventClaimRequest[];
  pushSubscriptions?: PushSubscription[];
}

export interface Category {
  id: string;
  name: string;
  events?: Event[];
}

export interface UserAttendingEvent {
  userId: string;
  user: User;
  eventId: string;
  event: Event;
  createdAt: Date;
}

export interface EventClaimRequest {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  verificationToken?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: User;
  eventId: string;
  event: Event;
}

export interface Promotion {
  id: string;
  eventId: string;
  event: Event;
  stripeChargeId: string;
  promotionTier: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface PushSubscription {
  id: string;
  userId: string;
  user: User;
  endpoint: string;
  keys: any;
  createdAt: Date;
}