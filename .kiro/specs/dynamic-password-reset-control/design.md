# Design Document

## Overview

This design implements a fully dynamic password reset control system that responds to admin settings in real-time. The system will conditionally render UI elements and protect routes based on the `resetPasswordEnabled` flag in the database, ensuring that when disabled, users cannot access any password reset functionality through any means (UI links, direct URL access, or bookmarked links).

## Architecture

The solution follows a layered architecture:

1. **Data Layer**: Database field `userSettings.resetPasswordEnabled` as the single source of truth
2. **API Layer**: Public endpoint `/api/public/user-settings` for client-side consumption
3. **Server Component Layer**: Server-side validation in page components before rendering
4. **Client Component Layer**: Conditional rendering based on settings fetched from API
5. **Action Layer**: Server action validation before processing password reset requests

### Key Architectural Decisions

- **Server-side validation first**: All password reset routes perform server-side checks before rendering to prevent unauthorized access
- **Client-side conditional rendering**: Sign-in form conditionally shows/hides the "Forget Password?" link based on settings
- **Graceful degradation**: When settings cannot be fetched, the system defaults to enabled (true) for better user experience
- **Redirect over 404**: Instead of showing a generic 404, redirect to sign-in with an informative message explaining why the feature is disabled

## Components and Interfaces

### 1. Database Schema

The existing `UserSettings` model already contains the required field:

```prisma
model UserSettings {
  id                       Int      @id @default(autoincrement())
  resetPasswordEnabled     Boolean  @default(true)
  // ... other fields
}
```

### 2. API Endpoints

**Existing Endpoint** (no changes needed):
- `GET /api/public/user-settings` - Returns user settings including `resetPasswordEnabled`

### 3. Server Components

**Modified Components**:

1. **`app/(auth)/reset-password/page.tsx`**
   - Currently redirects to sign-in when disabled
   - Will be updated to use Next.js `notFound()` function for proper 404 handling

2. **`app/(auth)/new-password/page.tsx`**
   - Currently redirects to sign-in when disabled
   - Will be updated to use Next.js `notFound()` function for proper 404 handling

### 4. Client Components

**Modified Components**:

1. **`app/(auth)/sign-in/signin-form.tsx`**
   - Already conditionally renders "Forget Password?" link
   - Current implementation is correct and follows best practices

### 5. Server Actions

**Existing Actions** (already protected):
- `lib/actions/reset.ts` - Validates setting before sending reset email
- `lib/actions/newPassword.ts` - Validates setting before allowing password change

## Data Models

### UserSettings Interface

```typescript
interface UserSettings {
  resetPasswordEnabled: boolean;
  signUpPageEnabled: boolean;
  nameFieldEnabled: boolean;
  emailConfirmationEnabled: boolean;
  passwordResetMax: number;
  transferFundsPercentage: number;
  userFreeBalanceEnabled: boolean;
  freeAmount: number;
}
```

### API Response Format

```typescript
interface UserSettingsResponse {
  success: boolean;
  userSettings: UserSettings;
}
```

## Error Handling

### 1. Route Protection

When `resetPasswordEnabled` is `false`:

**Current Behavior**:
- Redirects to `/sign-in?message=password-reset-disabled`
- Shows error message: "Password reset is currently disabled by administrator. Please contact support."

**Improved Behavior**:
- Use Next.js `notFound()` function to trigger 404 page
- Provides cleaner UX and prevents confusion about why redirect occurred

### 2. Client-Side Handling

**Sign-in Form**:
- Fetches settings using `useUserSettings` hook
- Conditionally renders "Forget Password?" link only when `resetPasswordEnabled !== false`
- Shows loading state while settings are being fetched

### 3. Server Action Validation

Both reset password actions validate the setting:

```typescript
const userSettings = await db.userSettings.findFirst();
const resetPasswordEnabled = userSettings?.resetPasswordEnabled ?? true;

if (!resetPasswordEnabled) {
  return { 
    success: false, 
    error: "Password reset is currently disabled. Please contact support." 
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the acceptance criteria analysis, this feature is primarily composed of specific UI behaviors and route protection logic that are best validated through example-based tests rather than property-based tests. The feature involves boolean flag checks and conditional rendering, which don't benefit from generative testing across random inputs.

**Note**: No universal properties were identified for this feature. All acceptance criteria are specific examples or edge cases that will be validated through unit and integration tests.

## Testing Strategy

### Unit Tests

1. **Server Component Tests**
   - Test that `/reset-password` page calls `notFound()` when setting is disabled
   - Test that `/new-password` page calls `notFound()` when setting is disabled
   - Test that pages render normally when setting is enabled
   - Test default behavior when setting is null (should default to enabled)

2. **Client Component Tests**
   - Test that "Forget Password?" link is hidden when `resetPasswordEnabled` is false
   - Test that "Forget Password?" link is shown when `resetPasswordEnabled` is true
   - Test that link is shown during loading state (optimistic rendering)
   - Test that link is shown when settings fetch fails (graceful degradation)

3. **Server Action Tests**
   - Test that `resetPassword` action rejects requests when setting is disabled
   - Test that `newPassword` action rejects requests when setting is disabled
   - Test that actions process normally when setting is enabled
   - Test error messages are user-friendly

### Property-Based Tests

Property-based testing is not applicable for this feature as it involves:
- UI conditional rendering based on boolean flags
- Route protection based on database state
- User experience flows that are not suitable for generative testing

The feature is better suited for example-based unit tests and integration tests that verify specific scenarios.

### Integration Tests

1. **End-to-End Flow Tests**
   - Test complete user journey when password reset is enabled
   - Test that all password reset touchpoints are blocked when disabled
   - Test admin toggle changes reflect immediately in UI
   - Test direct URL access is properly blocked

2. **API Integration Tests**
   - Test `/api/public/user-settings` returns correct `resetPasswordEnabled` value
   - Test API response format matches expected interface
   - Test API handles missing settings gracefully

## Implementation Notes

### Changes Required

1. **Update `/reset-password/page.tsx`**:
   - Replace `redirect()` with `notFound()` when setting is disabled
   - Import `notFound` from `next/navigation`

2. **Update `/new-password/page.tsx`**:
   - Replace `redirect()` with `notFound()` when setting is disabled
   - Import `notFound` from `next/navigation`

3. **No changes needed for**:
   - Sign-in form (already correctly implemented)
   - Server actions (already correctly protected)
   - API endpoints (already working correctly)
   - Database schema (field already exists)

### Why notFound() Instead of Redirect

Using `notFound()` is more appropriate because:
1. **Semantic correctness**: When a feature is disabled, the route effectively doesn't exist
2. **Better UX**: Users see a clear 404 page instead of being redirected with a query parameter
3. **SEO benefits**: Search engines understand the route is not available
4. **Cleaner URLs**: No need for query parameters to pass error messages
5. **Consistent behavior**: Matches how Next.js handles truly non-existent routes

### Backward Compatibility

The changes maintain backward compatibility:
- Existing database records with `resetPasswordEnabled = true` continue to work
- NULL values default to `true` (enabled)
- No migration required
- No breaking changes to API contracts
