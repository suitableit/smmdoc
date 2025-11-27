import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database
vi.mock('@/lib/db', () => ({
    db: {
        userSettings: {
            findFirst: vi.fn(),
        },
        users: {
            update: vi.fn(),
        },
        passwordResetTokens: {
            delete: vi.fn(),
        },
    },
}));

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
    default: {
        hash: vi.fn(),
    },
}));

// Mock password reset token data
vi.mock('@/data/password-reset-token', () => ({
    getPasswordResetTokenByToken: vi.fn(),
}));

// Mock user data
vi.mock('@/data/user', () => ({
    getUserByEmail: vi.fn(),
}));

// Import after mocks are set up
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getPasswordResetTokenByToken } from '@/data/password-reset-token';
import { getUserByEmail } from '@/data/user';
import { newPasswordValues } from './newPassword';

describe('newPasswordValues action', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return error when resetPasswordEnabled is false', async () => {
        // Arrange
        vi.mocked(db.userSettings.findFirst).mockResolvedValue({
            id: 1,
            resetPasswordEnabled: false,
            signUpPageEnabled: true,
            nameFieldEnabled: true,
            emailConfirmationEnabled: true,
            resetLinkMax: 3,
            transferFundsPercentage: 0,
            userFreeBalanceEnabled: false,
            freeAmount: 0,
            paymentBonusEnabled: false,
            bonusPercentage: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Act
        const result = await newPasswordValues(
            { password: 'NewPassword123!' },
            'test-token'
        );

        // Assert
        expect(result.success).toBe(false);
        expect(result.error).toBe('Password reset is currently disabled. Please contact support.');
        expect(getPasswordResetTokenByToken).not.toHaveBeenCalled();
        expect(db.users.update).not.toHaveBeenCalled();
    });

    it('should process normally when resetPasswordEnabled is true', async () => {
        // Arrange
        vi.mocked(db.userSettings.findFirst).mockResolvedValue({
            id: 1,
            resetPasswordEnabled: true,
            signUpPageEnabled: true,
            nameFieldEnabled: true,
            emailConfirmationEnabled: true,
            resetLinkMax: 3,
            transferFundsPercentage: 0,
            userFreeBalanceEnabled: false,
            freeAmount: 0,
            paymentBonusEnabled: false,
            bonusPercentage: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        vi.mocked(getPasswordResetTokenByToken).mockResolvedValue({
            id: 1,
            email: 'test@example.com',
            token: 'test-token',
            expires: new Date(Date.now() + 3600000), // Future date
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        vi.mocked(getUserByEmail).mockResolvedValue({
            id: 1,
            email: 'test@example.com',
            name: 'Test User',
            password: 'hashedpassword',
            role: 'user',
            emailVerified: new Date(),
            image: null,
            balance: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            isTwoFactorEnabled: false,
            apiKey: 'test-api-key',
            timezone: 'UTC',
            currency: 'USD',
            status: 'active',
        } as any);

        vi.mocked(bcrypt.hash).mockResolvedValue('newhashed' as never);
        vi.mocked(db.users.update).mockResolvedValue({} as any);
        vi.mocked(db.passwordResetTokens.delete).mockResolvedValue({} as any);

        // Act
        const result = await newPasswordValues(
            { password: 'NewPassword123!' },
            'test-token'
        );

        // Assert
        expect(result.success).toBe(true);
        expect(result.message).toBe('Password updated successfully');
        expect(getPasswordResetTokenByToken).toHaveBeenCalledWith('test-token');
        expect(getUserByEmail).toHaveBeenCalledWith('test@example.com');
        expect(bcrypt.hash).toHaveBeenCalledWith('NewPassword123!', 10);
        expect(db.users.update).toHaveBeenCalled();
        expect(db.passwordResetTokens.delete).toHaveBeenCalledWith({ where: { token: 'test-token' } });
    });

    it('should default to enabled when setting is null', async () => {
        // Arrange
        vi.mocked(db.userSettings.findFirst).mockResolvedValue(null);

        vi.mocked(getPasswordResetTokenByToken).mockResolvedValue({
            id: 1,
            email: 'test@example.com',
            token: 'test-token',
            expires: new Date(Date.now() + 3600000),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        vi.mocked(getUserByEmail).mockResolvedValue({
            id: 1,
            email: 'test@example.com',
            name: 'Test User',
            password: 'hashedpassword',
            role: 'user',
            emailVerified: new Date(),
            image: null,
            balance: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            isTwoFactorEnabled: false,
            apiKey: 'test-api-key',
            timezone: 'UTC',
            currency: 'USD',
            status: 'active',
        } as any);

        vi.mocked(bcrypt.hash).mockResolvedValue('newhashed' as never);
        vi.mocked(db.users.update).mockResolvedValue({} as any);
        vi.mocked(db.passwordResetTokens.delete).mockResolvedValue({} as any);

        // Act
        const result = await newPasswordValues(
            { password: 'NewPassword123!' },
            'test-token'
        );

        // Assert
        expect(result.success).toBe(true);
        expect(getPasswordResetTokenByToken).toHaveBeenCalledWith('test-token');
        expect(getUserByEmail).toHaveBeenCalledWith('test@example.com');
        expect(db.users.update).toHaveBeenCalled();
    });

    it('should have error message that suggests contacting support', async () => {
        // Arrange
        vi.mocked(db.userSettings.findFirst).mockResolvedValue({
            id: 1,
            resetPasswordEnabled: false,
            signUpPageEnabled: true,
            nameFieldEnabled: true,
            emailConfirmationEnabled: true,
            resetLinkMax: 3,
            transferFundsPercentage: 0,
            userFreeBalanceEnabled: false,
            freeAmount: 0,
            paymentBonusEnabled: false,
            bonusPercentage: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Act
        const result = await newPasswordValues(
            { password: 'NewPassword123!' },
            'test-token'
        );

        // Assert
        expect(result.error).toContain('contact support');
    });
});
