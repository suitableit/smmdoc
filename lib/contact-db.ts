import { db } from '@/lib/db';

// Contact database client using main database with contact models
class ContactDB {
  private prisma = db;

  // Contact Settings Methods
  async getContactSettings() {
    try {
      const settings = await this.prisma.contactSettings.findFirst({
        orderBy: { id: 'desc' }
      });
      return settings;
    } catch (error) {
      console.error('Error getting contact settings:', error);
      return null;
    }
  }

  async upsertContactSettings(data: {
    contactSystemEnabled: boolean;
    maxPendingContacts: string;
  }) {
    try {
      // Check if settings exist
      const existingSettings = await this.prisma.contactSettings.findFirst();

      if (existingSettings) {
        await this.prisma.contactSettings.update({
          where: { id: existingSettings.id },
          data: {
            contactSystemEnabled: data.contactSystemEnabled,
            maxPendingContacts: data.maxPendingContacts
          }
        });
      } else {
        await this.prisma.contactSettings.create({
          data: {
            contactSystemEnabled: data.contactSystemEnabled,
            maxPendingContacts: data.maxPendingContacts
          }
        });
      }
      return true;
    } catch (error) {
      console.error('Error upserting contact settings:', error);
      return false;
    }
  }

  // Contact Categories Methods
  async getContactCategories() {
    try {
      const categories = await this.prisma.contactCategory.findMany({
        orderBy: { name: 'asc' }
      });
      return categories;
    } catch (error) {
      console.error('Error getting contact categories:', error);
      return [];
    }
  }

  async createContactCategory(name: string) {
    try {
      await this.prisma.contactCategory.create({
        data: { name }
      });
      return true;
    } catch (error) {
      console.error('Error creating contact category:', error);
      return false;
    }
  }

  async updateContactCategory(id: number, name: string) {
    try {
      await this.prisma.contactCategory.update({
        where: { id },
        data: { name }
      });
      return true;
    } catch (error) {
      console.error('Error updating contact category:', error);
      return false;
    }
  }

  async deleteContactCategory(id: number) {
    try {
      await this.prisma.contactCategory.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting contact category:', error);
      return false;
    }
  }

  // Contact Messages Methods (using raw SQL)
  async createContactMessage(data: {
    userId: number;
    subject: string;
    message: string;
    categoryId: number;
    attachments?: string;
  }) {
    try {
      await this.prisma.$executeRaw`
        INSERT INTO contact_messages (userId, subject, message, categoryId, attachments, status, createdAt, updatedAt)
        VALUES (${data.userId}, ${data.subject}, ${data.message}, ${data.categoryId}, ${data.attachments || null}, 'Unread', NOW(), NOW())
      `;
      return true;
    } catch (error) {
      console.error('Error creating contact message:', error);
      return false;
    }
  }

  async countContactMessages(filters: {
    userId?: number;
    status?: string[];
  }) {
    try {
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];

      if (filters.userId) {
        whereClause += ` AND userId = ?`;
        params.push(filters.userId);
      }

      if (filters.status && filters.status.length > 0) {
        const placeholders = filters.status.map(() => '?').join(',');
        whereClause += ` AND status IN (${placeholders})`;
        params.push(...filters.status);
      }

      const result = await this.prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count FROM contact_messages ${whereClause}
      `, ...params);

      return (result as any)[0]?.count || 0;
    } catch (error) {
      console.error('Error counting contact messages:', error);
      return 0;
    }
  }

  async getContactMessages(filters?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const where: any = {};

      if (filters?.status && filters.status !== 'All') {
        where.status = filters.status;
      }

      if (filters?.search) {
        where.OR = [
          { user: { username: { contains: filters.search } } },
          { user: { email: { contains: filters.search } } },
          { subject: { contains: filters.search } },
          { category: { name: { contains: filters.search } } }
        ];
      }

      const messages = await this.prisma.contactMessage.findMany({
        where,
        include: {
          user: {
            select: {
              username: true,
              email: true
            }
          },
          category: {
            select: {
              name: true
            }
          },
          repliedByUser: {
            select: {
              username: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit,
        skip: filters?.offset
      });

      return messages;
    } catch (error) {
      console.error('Error getting contact messages:', error);
      return [];
    }
  }

  async getContactMessageById(id: number) {
    try {
      const message = await this.prisma.contactMessage.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              username: true,
              email: true
            }
          },
          category: {
            select: {
              name: true
            }
          },
          repliedByUser: {
            select: {
              username: true
            }
          }
        }
      });
      return message;
    } catch (error) {
      console.error('Error getting contact message by id:', error);
      return null;
    }
  }

  async updateContactMessageStatus(id: number, status: string) {
    try {
      await this.prisma.contactMessage.update({
        where: { id },
        data: { status }
      });
      return true;
    } catch (error) {
      console.error('Error updating contact message status:', error);
      return false;
    }
  }

  async replyToContactMessage(id: number, adminReply: string, repliedBy: number) {
    try {
      await this.prisma.contactMessage.update({
        where: { id },
        data: {
          adminReply,
          repliedBy,
          repliedAt: new Date(),
          status: 'Replied'
        }
      });
      return true;
    } catch (error) {
      console.error('Error replying to contact message:', error);
      return false;
    }
  }

  async deleteContactMessage(id: number) {
    try {
      await this.prisma.contactMessage.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting contact message:', error);
      return false;
    }
  }

  async getContactMessageCounts() {
    try {
      const total = await this.prisma.contactMessage.count();
      const unread = await this.prisma.contactMessage.count({
        where: { status: 'Unread' }
      });
      const read = await this.prisma.contactMessage.count({
        where: { status: 'Read' }
      });
      const replied = await this.prisma.contactMessage.count({
        where: { status: 'Replied' }
      });

      return { total, unread, read, replied };
    } catch (error) {
      console.error('Error getting contact message counts:', error);
      return { total: 0, unread: 0, read: 0, replied: 0 };
    }
  }

  async getUserPendingContactCount(userId: number) {
    try {
      const count = await this.prisma.contactMessage.count({
        where: {
          userId,
          status: { in: ['Unread', 'Read'] }
        }
      });
      return count;
    } catch (error) {
      console.error('Error getting user pending contact count:', error);
      return 0;
    }
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

// Export singleton instance
export const contactDB = new ContactDB();
