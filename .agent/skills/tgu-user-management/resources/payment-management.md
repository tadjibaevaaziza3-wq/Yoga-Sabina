# Payment Management

The Admin Panel MUST include a dedicated **"Payment"** section to monitor and verify all revenue streams for TGU Users.

## Centralized Payment Section: Admin Panel → Payment

This section displays a list of all transactions, pending or completed.

### 1. Automation: Click / Payme
- **Mechanism**: Backend webhook receives `perform` request.
- **Verification**: Signature check + Amount match.
- **Action**: On valid response, the system **AUTOMATICALLY** unlocks the corresponding course and updates `subscription_status = ACTIVE`.
- **Record**: Log the provider's transaction ID and store the "Success" response payload.

### 2. Manual Verification: Screenshots
- **Mechanism**: User uploads a screenshot (proof of bank transfer).
- **Admin Action**: 
    - Admin clicks on the user record in the Payment section.
    - System displays the uploaded screenshot.
    - Admin clicks **"Approve"** after verification.
- **Manual Toggle**: Admin can manually set a user's subscription to `ACTIVE` and select the `startsAt` / `endsAt` dates.

## Revenue Metadata
Every payment record MUST include:
- `user_id` (Link to User)
- `payment_method` (Click vs Transfer)
- `transaction_details` (Click ID or Screenshot path)
- `amount` & `currency`
- `status` (PENDING, PAID, REJECTED)
- `approver_id` (If manual approval)
