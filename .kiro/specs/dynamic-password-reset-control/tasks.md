# Implementation Plan

- [x] 1. Update reset password page to show 404 when disabled




  - Modify `app/(auth)/reset-password/page.tsx` to use `notFound()` instead of `redirect()`
  - Import `notFound` from `next/navigation`
  - Ensure server-side validation happens before any rendering
  - _Requirements: 1.3, 2.1_

- [x] 1.1 Write unit tests for reset password page protection


  - Test that page calls `notFound()` when `resetPasswordEnabled` is false
  - Test that page renders normally when `resetPasswordEnabled` is true
  - Test that page defaults to enabled when setting is null
  - _Requirements: 1.3, 2.3, 3.2_

- [x] 2. Update new password page to show 404 when disabled





  - Modify `app/(auth)/new-password/page.tsx` to use `notFound()` instead of `redirect()`
  - Import `notFound` from `next/navigation`
  - Ensure server-side validation happens before any rendering
  - _Requirements: 1.4, 2.1_

- [x] 2.1 Write unit tests for new password page protection


  - Test that page calls `notFound()` when `resetPasswordEnabled` is false
  - Test that page renders normally when `resetPasswordEnabled` is true
  - Test that page defaults to enabled when setting is null
  - _Requirements: 1.4, 2.3, 3.2_

- [x] 3. Verify sign-in form conditional rendering





  - Review `app/(auth)/sign-in/signin-form.tsx` to confirm "Forget Password?" link logic is correct
  - Ensure link is hidden when `resetPasswordEnabled` is false
  - Ensure link is shown when `resetPasswordEnabled` is true or during loading
  - No code changes needed if current implementation is correct
  - _Requirements: 1.1, 1.2_

- [x] 3.1 Write unit tests for sign-in form conditional rendering


  - Test that "Forget Password?" link is hidden when `resetPasswordEnabled` is false
  - Test that "Forget Password?" link is shown when `resetPasswordEnabled` is true
  - Test that link is shown during loading state (graceful degradation)
  - _Requirements: 1.1, 1.2_

- [x] 4. Verify server actions are protected





  - Review `lib/actions/reset.ts` to confirm it validates `resetPasswordEnabled` before processing
  - Review `lib/actions/newPassword.ts` to confirm it validates `resetPasswordEnabled` before processing
  - Ensure error messages are user-friendly and suggest contacting support
  - No code changes needed if current implementation is correct
  - _Requirements: 3.5, 2.2_

- [x] 4.1 Write unit tests for server action protection


  - Test that `resetPassword` action returns error when `resetPasswordEnabled` is false
  - Test that `newPassword` action returns error when `resetPasswordEnabled` is false
  - Test that actions process normally when `resetPasswordEnabled` is true
  - Test that error messages suggest contacting support
  - _Requirements: 3.5, 2.2_

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
