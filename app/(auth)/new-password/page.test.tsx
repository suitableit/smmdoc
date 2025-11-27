import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notFound } from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    notFound: vi.fn(),
}));

// Mock the database
vi.mock('@/lib/db', () => ({
    db: {
        userSettings: {
            findFirst: vi.fn(),
        },
    },
}));

// Import after mocks are set up
import { db } from '@/lib/db';
import NewPasswordPage from './page';

describe('New Password Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should call notFound() when resetPasswordEnabled is false', async () => {
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
        await NewPasswordPage();

        // Assert
        expect(notFound).toHaveBeenCalledTimes(1);
    });

    it('should render normally when resetPasswordEnabled is true', async () => {
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

        // Act
        const result = await NewPasswordPage();

        // Assert
        expect(notFound).not.toHaveBeenCalled();
        expect(result).toBeDefined();
        expect(result.type).toBe('div');
    });

    it('should default to enabled when setting is null', async () => {
        // Arrange
        vi.mocked(db.userSettings.findFirst).mockResolvedValue(null);

        // Act
        const result = await NewPasswordPage();

        // Assert
        expect(notFound).not.toHaveBeenCalled();
        expect(result).toBeDefined();
        expect(result.type).toBe('div');
    });
});
