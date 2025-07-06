import { PrismaClient } from '@prisma/client';
import logger from '../monitoring/logger';
import { stripe } from '../payments/stripe';

const prisma = new PrismaClient();

interface RevenueEvent {
  userId: string;
  amount: number;
  currency: string;
  type: 'payment' | 'subscription';
  metadata?: Record<string, any>;
}

export async function trackRevenue(event: RevenueEvent) {
  try {
    // Record revenue event in database
    await prisma.revenueEvent.create({
      data: {
        userId: event.userId,
        amount: event.amount,
        currency: event.currency,
        type: event.type,
        metadata: event.metadata || {}
      }
    });

    logger.info(`Tracked revenue event: ${event.type} for user ${event.userId}`);
  } catch (err) {
    logger.error('Failed to track revenue event:', err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

export async function getRevenueAnalytics(timeframe: 'day' | 'week' | 'month') {
  try {
    const now = new Date();
    let startDate = new Date();

    switch (timeframe) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    const results = await prisma.revenueEvent.groupBy({
      by: ['type'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _sum: {
        amount: true
      },
      _count: {
        _all: true
      }
    });

    return results.map(r => ({
      type: r.type,
      totalAmount: r._sum.amount || 0,
      count: r._count._all
    }));
  } catch (err) {
    logger.error('Failed to get revenue analytics:', err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

// Helper to process Stripe webhook events
export async function processStripeRevenueEvent(event: any) {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const payment = event.data.object;
        await trackRevenue({
          userId: payment.customer,
          amount: payment.amount,
          currency: payment.currency,
          type: 'payment',
          metadata: payment.metadata
        });
        break;

      case 'invoice.paid':
        const invoice = event.data.object;
        await trackRevenue({
          userId: invoice.customer,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          type: 'subscription',
          metadata: invoice.metadata
        });
        break;
    }
  } catch (err) {
    logger.error('Failed to process Stripe revenue event:', err);
    throw err;
  }
}