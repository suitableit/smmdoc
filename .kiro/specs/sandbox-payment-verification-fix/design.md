# Design Document

## Overview

The sandbox payment verification system currently has a critical bug where payment status updates are not being properly applied. When users complete a sandbox payment and verify it through the verification page, the transaction remains stuck in "Processing" status instead of updating to the selected status ("Success", "Pending", or "Failed").

**Root Cause Analysis:**
After examining the current implementation, the sandbox webhook handler (`app/api/payment/sandbox-webhook/route.ts`) correctly processes the `response_type` parameter and maps it to the appropriate payment status. However, there are several areas that need improvement:

1. **Insufficient logging**: The current implementation lacks detailed logging of state transitions (previous vs. new status, previous vs. new balance)
2. **Limited error context**: Database errors don't provide enough information about which operation failed
3. **Missing validation**: No verification that the database transaction actually committed successfully
4. **Weak response validation**: The verification page doesn't validate the webhook response structure thoroughly

**Design Goals:**
This design addresses these issues by:
- Enhancing logging to capture all state transitions
- Improving error handling with contextual information
- Adding post-transaction verification
- Ensuring proper status updates and balance modifications
- Providing clear user feedback throughout the verification flow

## Architecture

The sandbox payment flow consists of three main components:

1. **Verify Payment Page** (`app/(protected)/verify-payment/page.tsx`): Frontend form where users input transaction details and select response type
2. **Sandbox Webhook API** (`app/api/payment/sandbox-webhook/route.ts`): Backend endpoint that processes verification requests and updates payment status
3. **Database Layer** (Prisma): Handles transaction updates and user balance modifications

```
User fills form → Submit verification → Sandbox Webhook API → Update AddFunds record → Update User balance (if Success) → Return response → Redirect to transactions page
```

## Components and Interfaces

### 1. Verify Payment Page Component

**Location**: `app/(protected)/verify-payment/page.tsx`

**Responsibilities**:
- Display payment information (invoice ID, amount, payment method)
- Collect verification details (transaction ID, phone number, response type)
- Submit verification request to sandbox webhook
- Handle response and redirect user appropriately

**Interface**:
```typescript
interface VerifyFormValues {
  transactionId: string;
  phoneNumber: string;
  responseType: 'Pending' | 'Success' | 'Failed';
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Upay';
}
```

### 2. Sandbox Webhook API

**Location**: `app/api/payment/sandbox-webhook/route.ts`

**Responsibilities**:
- Validate sandbox mode is enabled
- Verify invoice_id exists
- Map response_type to payment status
- Update payment record in database
- Update user balance if payment is successful
- Return updated payment information

**Request Interface**:
```typescript
interface SandboxWebhookRequest {
  invoice_id: string;
  transaction_id?: string;
  phone_number?: string;
  response_type: 'Pending' | 'Success' | 'Failed';
  payment_method?: string;
}
```

**Response Interface**:
```typescript
interface SandboxWebhookResponse {
  success: boolean;
  message: string;
  data: {
    invoice_id: string;
    status: string;
    transaction_id: string;
    payment_method: string;
    amount: number;
  };
}
```

### 3. Status Mapping Logic

The webhook maps response types to database statuses:

| Response Type | Payment Status | UddoktaPay Status |
|--------------|----------------|-------------------|
| Success      | Success        | COMPLETED         |
| Pending      | Processing     | PENDING           |
| Failed       | Failed         | FAILED            |

## Data Models

### AddFunds Model

```prisma
model AddFunds {
  Id               Int       @id @default(autoincrement())
  userId           Int
  name             String?
  email            String
  phoneNumber      String?
  invoiceId        String    @unique
  transactionId    String?
  usdAmount        Float
  bdtAmount        Float?
  currency         String?   @default("USD")
  gatewayFee       Float?
  status           String?   @default("Processing")
  paymentGateway   String?
  paymentMethod    String?
  transactionDate  DateTime  @default(now())
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  user             Users     @relation(fields: [userId], references: [id])
}
```

**Key Fields**:
- `status`: Current payment status ("Processing", "Success", "Failed", "Cancelled")
- `invoiceId`: Unique identifier for the payment
- `transactionId`: Payment gateway transaction ID
- `usdAmount`: Amount in USD
- `bdtAmount`: Amount in BDT (Bangladesh Taka)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Status mapping consistency

*For any* sandbox verification request with a valid response_type, the resulting payment status in the database should match the expected status mapping (Success → "Success", Pending → "Processing", Failed → "Failed")

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Balance update on success only

*For any* sandbox payment verification, the correct user's balance (the user who initiated the payment) should be incremented by the exact payment amount if and only if the response_type is "Success"

**Validates: Requirements 1.4, 1.5**

### Property 3: Transaction idempotency

*For any* payment that is already marked as "Success", subsequent webhook calls should not modify the user's balance or change the payment status

**Validates: Requirements 1.4**

### Property 4: Response data consistency

*For any* successful webhook processing, the returned response data should contain the invoice_id, updated status, transaction_id, and amount that match the database record

**Validates: Requirements 2.1**

### Property 5: Atomic transaction updates

*For any* sandbox verification that updates both payment status and user balance, either both updates should succeed or both should fail (no partial updates)

**Validates: Requirements 1.4**

## Error Handling

### Validation Errors

1. **Missing invoice_id**: Return 400 Bad Request with error message
2. **Payment not found**: Return 404 Not Found with error message
3. **Not in sandbox mode**: Return 403 Forbidden with error message

### Database Errors

1. **Transaction failure**: Rollback all changes, return 500 Internal Server Error
2. **Concurrent updates**: Use Prisma transactions to prevent race conditions
3. **Connection errors**: Log error details and return 500 with generic message

### Logging Strategy

All errors should be logged with:
- Timestamp
- Invoice ID (if available)
- Error type and message
- Stack trace (for unexpected errors)
- Request payload (sanitized)

## Testing Strategy

### Unit Testing

Unit tests will verify:
1. Status mapping logic (response_type → payment status)
2. Balance calculation logic
3. Error response formatting
4. Request validation

### Property-Based Testing

Property-based tests will use **fast-check** (JavaScript/TypeScript PBT library) to verify:
1. Status mapping consistency across all valid response types
2. Balance updates only occur for "Success" status
3. Idempotency of successful payments
4. Response data consistency
5. Atomic transaction behavior

Each property-based test should run a minimum of 100 iterations to ensure comprehensive coverage.

### Integration Testing

Integration tests will verify:
1. End-to-end flow from verification page to database update
2. Proper redirect behavior based on response type
3. Toast notifications display correctly
4. Transaction list updates after verification

### Test Tagging

All property-based tests must be tagged with the format:
`**Feature: sandbox-payment-verification-fix, Property {number}: {property_text}**`

Example:
```typescript
// **Feature: sandbox-payment-verification-fix, Property 1: Status mapping consistency**
test('status mapping is consistent for all response types', () => {
  // test implementation
});
```

## Implementation Notes

### Current Issues Identified

1. **Logging gaps**: The current implementation logs status updates but doesn't log the previous status or user balance changes in detail
2. **Error context**: Database errors don't include enough context about what operation failed
3. **Response validation**: The verification page doesn't validate the webhook response structure

### Proposed Fixes

1. **Enhanced logging**: Add detailed logs before and after each database operation, including:
   - User ID whose balance is being updated
   - Previous balance and new balance
   - Payment amount being added
   - Previous status and new status
2. **Better error messages**: Include invoice_id and operation context in all error responses
3. **Response validation**: Validate webhook response structure in the verification page
4. **Status verification**: Add a check to ensure the status was actually updated in the database
5. **User verification**: Ensure the payment record's userId matches the user whose balance is being updated

### Performance Considerations

- Database transactions should complete within 1 second
- Webhook endpoint should respond within 2 seconds
- Use database indexes on `invoiceId` field (already exists as unique constraint)

## Security Considerations

1. **Sandbox mode check**: Always verify sandbox mode is enabled before processing
2. **User authorization**: Verify the user making the verification request owns the payment
3. **Input validation**: Validate all input fields (transaction ID, phone number, response type)
4. **SQL injection prevention**: Use Prisma's parameterized queries (already implemented)
