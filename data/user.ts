import { db } from '@/lib/db';

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({ where: { email } });
    return user;
  } catch {
    return null;
  }
};

// Helper function to get user ID mapping from old string ID to new int ID
const getUserIdMapping = async (oldStringId: string): Promise<number | null> => {
  try {
    // Check if it's already a number
    const numericId = parseInt(oldStringId);
    if (!isNaN(numericId)) {
      return numericId;
    }

    // For old string IDs, we need to find the mapping
    // Since we migrated users in creation order, we can try to find by other unique fields
    // This is a temporary solution during the transition period

    // Try to find user by the old string ID pattern in a mapping table or fallback
    // For now, we'll return null for old string IDs that can't be converted
    return null;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string | number) => {
  try {
    let userId: number;

    if (typeof id === 'number') {
      userId = id;
    } else {
      // Try to convert string to number
      const numericId = parseInt(id);
      if (!isNaN(numericId)) {
        userId = numericId;
      } else {
        // For old string IDs, return null (user needs to re-login)
        return null;
      }
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    return user;
  } catch {
    return null;
  }
};
