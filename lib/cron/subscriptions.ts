import { PrismaClient } from '@prisma/client';
import { stripe } from '../payments/stripe';
import { env } from '../../env.mjs';
import logger from '../monitoring/logger';

const prisma = new PrismaClient();

export async function checkAndRenewSubscriptions() {
  logger.info('Starting subscription renewal job');
  try {
    // Get subscriptions expiring in the next 7 days
    const expiringSubs = await prisma.subscription.findMany({
      where: {
        status: 'active',
        currentPeriodEnd: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          gte: new Date() // After now
        }
      },
      include: {
        user: true
      }
    });

    for (const sub of expiringSubs) {
      try {
        // Attempt to renew subscription
        const paymentMethod = await stripe.paymentMethods.list({
          customer: sub.user.id,
          type: 'card'
        });

        if (paymentMethod.data.length > 0) {
          // Create new payment intent
          const paymentIntent = await stripe.paymentIntents.create({
            amount: 1500, // $15.00 in cents
            currency: 'usd',
            customer: sub.user.id,
            payment_method: paymentMethod.data[0].id,
            confirm: true,
            description: `Renewal for ${sub.id}`
          });

          if (paymentIntent.status === 'succeeded') {
            // Update subscription in database
            await prisma.subscription.update({
              where: { id: sub.id },
              data: {
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 more days
                updatedAt: new Date()
              }
            });
          }
        }
      } catch (err) {
        console.error(`Failed to renew subscription ${sub.id}:`, err);
        // Mark as expired if payment fails
        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            status: 'expired',
            updatedAt: new Date()
          }
        });
      }
    }
  } catch (err) {
    logger.error('Subscription renewal job failed:', err);
    throw err; // Re-throw for scheduler to handle
  } finally {
    await prisma.$disconnect();
    logger.info('Finished subscription renewal job');
  }
}