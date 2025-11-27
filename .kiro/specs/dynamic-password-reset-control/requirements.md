# Requirements Document

## Introduction

This feature enables dynamic control of the password reset functionality based on admin settings. When the admin disables password reset in the User Settings panel, the system SHALL hide all password reset UI elements and block access to password reset routes, showing a 404 error page instead.

## Glossary

- **Password Reset System**: The collection of pages, links, and functionality that allows users to reset their forgotten passwords via email
- **Admin Settings Panel**: The administrative interface where system administrators configure user-related settings
- **Reset Password Toggle**: The boolean setting in the User Settings section that enables or disables the password reset functionality
- **Forget Password Link**: The clickable link on the sign-in page that navigates users to the password reset flow
- **Reset Password Route**: The `/reset-password` URL path where users can request a password reset email
- **New Password Route**: The `/new-password` URL path where users set a new password after clicking the email link
- **404 Page**: The error page displayed when a route is not found or is disabled

## Requirements

### Requirement 1

**User Story:** As a system administrator, I want to control whether users can reset their passwords, so that I can manage authentication policies based on organizational needs.

#### Acceptance Criteria

1. WHEN the Reset Password toggle is enabled in Admin Settings THEN the system SHALL display the "Forget Password?" link on the sign-in page
2. WHEN the Reset Password toggle is disabled in Admin Settings THEN the system SHALL hide the "Forget Password?" link from the sign-in page
3. WHEN the Reset Password toggle is disabled AND a user attempts to access `/reset-password` THEN the system SHALL display a 404 error page
4. WHEN the Reset Password toggle is disabled AND a user attempts to access `/new-password` THEN the system SHALL display a 404 error page
5. WHEN the Reset Password toggle state changes THEN the system SHALL reflect the change immediately without requiring application restart

### Requirement 2

**User Story:** As a user, I want clear feedback when password reset is disabled, so that I understand why I cannot access the password reset functionality.

#### Acceptance Criteria

1. WHEN the Reset Password feature is disabled AND a user clicks a cached or bookmarked reset password link THEN the system SHALL redirect to the sign-in page with an informative message
2. WHEN displaying the disabled password reset message THEN the system SHALL suggest contacting support as an alternative
3. WHEN the Reset Password toggle is enabled THEN the system SHALL allow normal access to all password reset routes

### Requirement 3

**User Story:** As a developer, I want the password reset control to be centralized, so that the system maintains consistency across all password reset touchpoints.

#### Acceptance Criteria

1. WHEN checking password reset status THEN the system SHALL query the `userSettings.resetPasswordEnabled` field from the database
2. WHEN the `resetPasswordEnabled` field is NULL THEN the system SHALL default to enabled (true)
3. WHEN rendering the sign-in form THEN the system SHALL check the password reset setting before displaying the "Forget Password?" link
4. WHEN a password reset route is accessed THEN the system SHALL validate the setting on the server side before rendering the page
5. WHEN the password reset setting is disabled THEN the system SHALL prevent all password reset operations including email sending
