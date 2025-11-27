import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database
vi.mock('@/lib/db', () => ({
    db: {
        userSettings: {
            findFirst: vi.fn(),
        },
    },
}));

// Mock nodemailer
vi.mock('@/lib/nodemailer', () => ({
    sendMail: vi.fn(),
}));

// Mock tokens
vi.mock('@/lib/tokens', () => ({
    generatePasswordResetToken: vi.fn(),
}));

// Mock user data
vi.mock('@/data/user', () => ({
    getUserByEmail: vi.fn(),
}));

// Import after mocks are set up
import { db } from '@/lib/db';
import { sendMail } from '@/lib/nodemailer';
import { generatePasswordResetToken } from '@/lib/tokens';
import { getUserByEmail } from '@/data/user';
import { resetPassword } from './reset';

describe('resetPassword action', () => {
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
        const result = await resetPassword({ email: 'test@example.com' });

        // Assert
        expect(result.success).toBe(false);
        expect(result.error).toBe('Password reset is currently disabled. Please contact support.');
        expect(getUserByEmail).not.toHaveBeenCalled();
        expect(sendMail).not.toHaveBeenCalled();
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

        vi.mocked(getUserByEmail).mockResolvedValue({
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            password: 'hashedpassword',
            role: 'USER',
            emailVerified: new Date(),
            image: null,
            balance: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            isTwoFactorEnabled: false,
            apiKey: null,
            timezone: null,
            currency: 'USD',
            isActive: true,
            isSwitchedUser: false,
            originalAdminId: null,
        });

        vi.mocked(generatePasswordResetToken).mockResolvedValue({
            id: '1',
            email: 'test@example.com',
            token: 'test-token',
            expires: new Date(Date.now() + 3600000),
        });

        vi.mocked(sendMail).mockResolvedValue(undefined);

        // Act
        const result = await resetPassword({ email: 'test@example.com' });

        // Assert
        expect(result.success).toBe(true);
        expect(result.message).toBe('Reset password link email sent');
        expect(getUserByEmail).toHaveBeenCalledWith('test@example.com');
        expect(generatePasswordResetToken).toHaveBeenCalledWith('test@example.com');
        expect(sendMail).toHaveBeenCalled();
    });

    it('should default to enabled when setting is null', async () => {
        // Arrange
        vi.mocked(db.userSettings.findFirst).mockResolvedValue(null);

        vi.mocked(getUserByEmail).mockResolvedValue({
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            password: 'hashedpassword',
            role: 'USER',
            emailVerified: new Date(),
            image: null,
            balance: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            isTwoFactorEnabled: false,
            apiKey: null,
            timezone: null,
            currency: 'USD',
            isActive: true,
            isSwitchedUser: false,
            originalAdminId: null,
        });

        vi.mocked(generatePasswordResetToken).mockResolvedValue({
            id: '1',
            email: 'test@example.com',
            token: 'test-token',
            expires: new Date(Date.now() + 3600000),
        });

        vi.mocked(sendMail).mockResolvedValue(undefined);

        // Act
        const result = await resetPassword({ email: 'test@example.com' });

        // Assert
        expect(result.success).toBe(true);
        expect(getUserByEmail).toHaveBeenCalledWith('test@example.com');
        expect(generatePasswordResetToken).toHaveBeenCalledWith('test@example.com');
        expect(sendMail).toHaveBeenCalled();
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
        const result = await resetPassword({ email: 'test@example.com' });

        // Assert
        expect(result.error).toContain('contact support');
    });
});
