import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { pushSubscriptions: true }
  })

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get user's notification keywords
        if (!user.pushSubscriptions?.[0]?.keywords) {
          return res.status(200).json({ keywords: [] })
        }
        
        return res.status(200).json({ keywords: user.pushSubscriptions[0].keywords })

      case 'POST':
        // Add new keyword
        const { keyword } = req.body
        
        if (!keyword || typeof keyword !== 'string') {
          return res.status(400).json({ error: 'Invalid keyword' })
        }

        await prisma.pushSubscription.updateMany({
          where: { userId: user.id },
          data: {
            keywords: {
              push: keyword
            }
          }
        })

        return res.status(200).json({ success: true })

      case 'DELETE':
        // Remove keyword
        const { keyword: keywordToRemove } = req.body
        
        if (!keywordToRemove || typeof keywordToRemove !== 'string') {
          return res.status(400).json({ error: 'Invalid keyword' })
        }

        await prisma.pushSubscription.updateMany({
          where: { userId: user.id },
          data: {
            keywords: {
              set: user.pushSubscriptions[0].keywords.filter((k: string) => k !== keywordToRemove)
            }
          }
        })

        return res.status(200).json({ success: true })

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('Notification keywords error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}