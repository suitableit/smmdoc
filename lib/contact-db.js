"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactDB = void 0;
const db_1 = require("./db");
// Contact database client using main Prisma client
class ContactDB {
    constructor() {
        this.prisma = db_1.db;
        // Using main Prisma client for all contact operations
    }
    // Contact Settings Methods
    async getContactSettings() {
        try {
            const settings = await this.prisma.contactSettings.findFirst({
                orderBy: { id: 'desc' }
            });
            return settings;
        }
        catch (error) {
            console.error('Error getting contact settings:', error);
            return null;
        }
    }
    async upsertContactSettings(data) {
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
            }
            else {
                await this.prisma.contactSettings.create({
                    data: {
                        contactSystemEnabled: data.contactSystemEnabled,
                        maxPendingContacts: data.maxPendingContacts
                    }
                });
            }
            return true;
        }
        catch (error) {
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
        }
        catch (error) {
            console.error('Error getting contact categories:', error);
            return [];
        }
    }
    async createContactCategory(name) {
        try {
            // Get or create contact settings first
            let settings = await this.prisma.contactSettings.findFirst();
            if (!settings) {
                settings = await this.prisma.contactSettings.create({
                    data: {
                        contactSystemEnabled: true,
                        maxPendingContacts: '3'
                    }
                });
            }
            await this.prisma.contactCategory.create({
                data: {
                    name,
                    contactSettings: {
                        connect: { id: settings.id }
                    }
                }
            });
            return true;
        }
        catch (error) {
            console.error('Error creating contact category:', error);
            return false;
        }
    }
    async updateContactCategory(id, name) {
        try {
            await this.prisma.contactCategory.update({
                where: { id },
                data: { name: name.trim() }
            });
            return true;
        }
        catch (error) {
            console.error('Error updating contact category:', error);
            return false;
        }
    }
    async deleteContactCategory(id) {
        try {
            await this.prisma.contactCategory.delete({
                where: { id }
            });
            return true;
        }
        catch (error) {
            console.error('Error deleting contact category:', error);
            return false;
        }
    }
    // Contact Messages Methods
    async createContactMessage(data) {
        try {
            await this.prisma.contact_messages.create({
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
        }
        catch (error) {
            console.error('Error creating contact message:', error);
            return false;
        }
    }
    async countContactMessages(filters) {
        try {
            const where = {};
            if (filters.userId) {
                where.userId = filters.userId;
            }
            if (filters.status) {
                if (Array.isArray(filters.status)) {
                    where.status = { in: filters.status };
                }
                else {
                    where.status = filters.status;
                }
            }
            const count = await this.prisma.contact_messages.count({ where });
            return count;
        }
        catch (error) {
            console.error('Error counting contact messages:', error);
            return 0;
        }
    }
    async getContactMessages(filters) {
        try {
            // Build WHERE clause for raw SQL
            let whereClause = 'WHERE 1=1';
            const params = [];
            if (filters?.status && filters.status !== 'All') {
                whereClause += ' AND cm.status = ?';
                params.push(filters.status);
            }
            if (filters?.search) {
                whereClause += ' AND (cm.subject LIKE ? OR cm.message LIKE ? OR u.username LIKE ? OR u.email LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }
            // Add LIMIT and OFFSET
            let limitClause = '';
            if (filters?.limit) {
                limitClause = ` LIMIT ${filters.limit}`;
                if (filters?.offset) {
                    limitClause += ` OFFSET ${filters.offset}`;
                }
            }
            const query = `
        SELECT
          cm.*,
          u.username,
          u.email,
          cc.name as categoryName,
          ru.username as repliedByUsername
        FROM contact_messages cm
        LEFT JOIN user u ON cm.userId = u.id
        LEFT JOIN contact_categories cc ON cm.categoryId = cc.id
        LEFT JOIN user ru ON cm.repliedBy = ru.id
        ${whereClause}
        ORDER BY cm.createdAt DESC
        ${limitClause}
      `;
            const messages = await this.prisma.$queryRawUnsafe(query, ...params);
            // Format the response to match expected structure
            const formattedMessages = messages.map((msg) => ({
                id: msg.id,
                userId: msg.userId,
                subject: msg.subject,
                message: msg.message,
                status: msg.status,
                categoryId: msg.categoryId,
                attachments: msg.attachments,
                adminReply: msg.adminReply,
                repliedAt: msg.repliedAt,
                repliedBy: msg.repliedBy,
                createdAt: msg.createdAt,
                updatedAt: msg.updatedAt,
                user: {
                    username: msg.username || 'Unknown User',
                    email: msg.email || 'No Email'
                },
                category: {
                    name: msg.categoryName || 'Unknown Category'
                },
                repliedByUser: msg.repliedByUsername ? {
                    username: msg.repliedByUsername
                } : null
            }));
            return formattedMessages;
        }
        catch (error) {
            console.error('Error getting contact messages:', error);
            return [];
        }
    }
    async getContactMessageById(id) {
        try {
            const query = `
        SELECT
          cm.*,
          u.username,
          u.email,
          cc.name as categoryName,
          ru.username as repliedByUsername
        FROM contact_messages cm
        LEFT JOIN user u ON cm.userId = u.id
        LEFT JOIN contact_categories cc ON cm.categoryId = cc.id
        LEFT JOIN user ru ON cm.repliedBy = ru.id
        WHERE cm.id = ?
      `;
            const messages = await this.prisma.$queryRawUnsafe(query, id);
            const message = messages[0];
            if (!message)
                return null;
            // Format the response to match expected structure
            return {
                id: message.id,
                userId: message.userId,
                subject: message.subject,
                message: message.message,
                status: message.status,
                categoryId: message.categoryId,
                attachments: message.attachments,
                adminReply: message.adminReply,
                repliedAt: message.repliedAt,
                repliedBy: message.repliedBy,
                createdAt: message.createdAt,
                updatedAt: message.updatedAt,
                user: {
                    username: message.username || 'Unknown User',
                    email: message.email || 'No Email'
                },
                category: {
                    name: message.categoryName || 'Unknown Category'
                },
                repliedByUser: message.repliedByUsername ? {
                    username: message.repliedByUsername
                } : null
            };
        }
        catch (error) {
            console.error('Error getting contact message by id:', error);
            return null;
        }
    }
    async getContactMessageCounts() {
        try {
            const total = await this.prisma.contact_messages.count();
            const unread = await this.prisma.contact_messages.count({
                where: { status: 'Unread' }
            });
            const read = await this.prisma.contact_messages.count({
                where: { status: 'Read' }
            });
            const replied = await this.prisma.contact_messages.count({
                where: { status: 'Replied' }
            });
            return { total, unread, read, replied };
        }
        catch (error) {
            console.error('Error getting contact message counts:', error);
            return { total: 0, unread: 0, read: 0, replied: 0 };
        }
    }
    async updateContactMessageStatus(id, status) {
        try {
            await this.prisma.contact_messages.update({
                where: { id },
                data: { status }
            });
            return true;
        }
        catch (error) {
            console.error('Error updating contact message status:', error);
            return false;
        }
    }
    async replyToContactMessage(id, adminReply, repliedBy) {
        try {
            await this.prisma.contact_messages.update({
                where: { id },
                data: {
                    adminReply,
                    repliedAt: new Date(),
                    repliedBy,
                    status: 'Replied'
                }
            });
            return true;
        }
        catch (error) {
            console.error('Error replying to contact message:', error);
            return false;
        }
    }
    async deleteContactMessage(id) {
        try {
            await this.prisma.contact_messages.delete({
                where: { id }
            });
            return true;
        }
        catch (error) {
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
exports.contactDB = new ContactDB();
