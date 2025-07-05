import { z } from 'zod';
import { UserRole } from '../auth/rbac';

export const profileSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, {
    message: "Username can only contain letters, numbers, and underscores"
  }),
  email: z.string().email(),
  full_name: z.string().min(2).max(100).optional(),
  avatar_url: z.string().url().optional(),
  website: z.string().url().optional(),
  updated_at: z.string().datetime(),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
    .optional()
});

export const profileUpdateSchema = profileSchema.omit({ 
  id: true,
  password: true 
}).partial();

export type Profile = z.infer<typeof profileSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;