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

  // Contact Messages Methods
  async createContactMessage(data: {
    userId: number;
    subject: string;
    message: string;
    categoryId: number;
    attachments?: string;
  }) {
    try {
      await this.prisma.contactMessage.create({
        data: {
          userId: data.userId,
          subject: data.subject,
          message: data.message,
          categoryId: data.categoryId,
          attachments: data.attachments || null,
          status: 'Unread'
        }
      });
      return true;
    } catch (error) {
      console.error('Error creating contact message:', error);
      return false;
    }
  }

  async countContactMessages(filters: {
    userId?: number;
    status?: string | string[];
  }) {
    try {
      const where: any = {};

      if (filters.userId) {
        where.userId = filters.userId;
      }

      if (filters.status) {
        if (Array.isArray(filters.status)) {
          where.status = { in: filters.status };
        } else {
          where.status = filters.status;
        }
      }

      const count = await this.prisma.contactMessage.count({ where });
      return count;
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
              id: true,
              username: true,
              email: true,
              name: true
            }
          },
          category: {
            select: {
              id: true,
              name: true
            }
          },
          repliedByUser: {
            select: {
              id: true,
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
          repliedAt: new Date(),
          repliedBy,
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

  // Cleanup method
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

// Export singleton instance
export const contactDB = new ContactDB();
