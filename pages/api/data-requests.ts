import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/auth/supabaseClient';
import { getSession } from 'next-auth/react';

interface UserSession {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req }) as UserSession;
  
  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { dataTypes } = req.body;

  if (!Array.isArray(dataTypes)) {
    return res.status(400).json({ message: 'Invalid data types format' });
  }

  try {
    const { error } = await supabase
      .from('user_data_preferences')
      .upsert(
        { 
          user_id: session.user.id,
          ccpa_opt_out: dataTypes,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id' }
      );

    if (error) throw error;

    return res.status(200).json({ 
      success: true,
      message: 'CCPA data preferences updated'
    });
    
  } catch (error) {
    console.error('CCPA opt-out error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error'
    });
  }
}