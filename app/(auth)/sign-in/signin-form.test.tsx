import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SignInForm from './signin-form';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn(),
    })),
    useSearchParams: vi.fn(() => ({
        get: vi.fn(),
    })),
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
    signIn: vi.fn(),
}));

// Mock the useUserSettings hook
vi.mock('@/hooks/use-user-settings', () => ({
    useUserSettings: vi.fn(),
}));

// Mock the useReCAPTCHA hook
vi.mock('@/hooks/useReCAPTCHA', () => ({
    default: vi.fn(() => ({
        recaptchaSettings: null,
        isEnabledForForm: vi.fn(() => false),
    })),
}));

// Mock the login action
vi.mock('@/lib/actions/login', () => ({
    login: vi.fn(),
}));

// Import after mocks are set up
import { useUserSettings } from '@/hooks/use-user-settings';

describe('SignInForm - Forget Password Link', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should hide "Forget Password?" link when resetPasswordEnabled is false', () => {
        // Arrange
        vi.mocked(useUserSettings).mockReturnValue({
            settings: {
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
            },
            loading: false,
            error: null,
            refetch: vi.fn(),
        });

        // Act
        render(<SignInForm />);

        // Assert
        const forgetPasswordLink = screen.queryByText('Forget Password?');
        expect(forgetPasswordLink).not.toBeInTheDocument();
    });

    it('should show "Forget Password?" link when resetPasswordEnabled is true', () => {
        // Arrange
        vi.mocked(useUserSettings).mockReturnValue({
            settings: {
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
            },
            loading: false,
            error: null,
            refetch: vi.fn(),
        });

        // Act
        render(<SignInForm />);

        // Assert
        const forgetPasswordLink = screen.getByText('Forget Password?');
        expect(forgetPasswordLink).toBeInTheDocument();
        expect(forgetPasswordLink).toHaveAttribute('href', '/reset-password');
    });

    it('should hide link during loading state', () => {
        // Arrange
        vi.mocked(useUserSettings).mockReturnValue({
            settings: null,
            loading: true,
            error: null,
            refetch: vi.fn(),
        });

        // Act
        render(<SignInForm />);

        // Assert
        const forgetPasswordLink = screen.queryByText('Forget Password?');
        expect(forgetPasswordLink).not.toBeInTheDocument();
    });

    it('should show link when settings is null (default enabled)', () => {
        // Arrange
        vi.mocked(useUserSettings).mockReturnValue({
            settings: null,
            loading: false,
            error: null,
            refetch: vi.fn(),
        });

        // Act
        render(<SignInForm />);

        // Assert
        const forgetPasswordLink = screen.getByText('Forget Password?');
        expect(forgetPasswordLink).toBeInTheDocument();
        expect(forgetPasswordLink).toHaveAttribute('href', '/reset-password');
    });

    it('should show link when resetPasswordEnabled is undefined (graceful degradation)', () => {
        // Arrange
        vi.mocked(useUserSettings).mockReturnValue({
            settings: {
                resetPasswordEnabled: undefined as any,
                signUpPageEnabled: true,
                nameFieldEnabled: true,
                emailConfirmationEnabled: true,
                resetLinkMax: 3,
                transferFundsPercentage: 0,
                userFreeBalanceEnabled: false,
                freeAmount: 0,
                paymentBonusEnabled: false,
                bonusPercentage: 0,
            },
            loading: false,
            error: null,
            refetch: vi.fn(),
        });

        // Act
        render(<SignInForm />);

        // Assert
        const forgetPasswordLink = screen.getByText('Forget Password?');
        expect(forgetPasswordLink).toBeInTheDocument();
        expect(forgetPasswordLink).toHaveAttribute('href', '/reset-password');
    });
});
