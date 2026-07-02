# Yaarana.pk - Firestore Security Specifications

## 1. Data Invariants
- **Authentication**: All users must be authenticated via Firebase Authentication to create/update profiles, view companion lists, or book.
- **Admin Isolation**: Only a bootstrapped administrator can manually add companions, see the full user registration queue, and approve or reject user registrations.
- **Pending Registrations Lock**: A user whose account is `pending` or `rejected` is strictly blocked from reading the `companions` and `bookings` collections, ensuring privacy.
- **Booking Integrity**:
  - A user can only read and write bookings where `userId == request.auth.uid`.
  - Bookings cannot be altered by users after creation, except for a self-cancellation.
  - Payment details (last 4 digits, wallet number) must match positive validation rules.
- **Immutability**: Users cannot update their own `role` or `status` (approval status) directly. Doing so is a Critical Privilege Escalation failure.
- **Timestamp Accuracy**: Document timestamps (`createdAt` and `updatedAt`) must be verified using the database server time `request.time`.

---

## 2. The "Dirty Dozen" Malicious Payloads
Here are 12 specific payloads or access patterns that must be blocked by the `firestore.rules`:

### 1. Self-Promoting User Role Update
- **Target Path**: `/users/attacker-uid`
- **Payload**: `{"role": "admin", "email": "attacker@gmail.com"}`
- **Attempt**: Attacker tries to make themselves an admin to access the admin queue.
- **Result**: `PERMISSION_DENIED`

### 2. Bypass Admin Registration Approval
- **Target Path**: `/users/attacker-uid`
- **Payload**: `{"status": "approved", "email": "attacker@gmail.com"}`
- **Attempt**: Pending user updates their own status to `approved` to browse companions.
- **Result**: `PERMISSION_DENIED`

### 3. Anonymous Companion Scraping
- **Target Path**: `/companions` (list query)
- **State**: Unauthenticated user tries to read companion profiles.
- **Result**: `PERMISSION_DENIED`

### 4. Pending User Reading Companion Details
- **Target Path**: `/companions/companion-123`
- **State**: Logged in but `status == 'pending'` user tries to read a companion.
- **Result**: `PERMISSION_DENIED`

### 5. Hijack Another User's Profile
- **Target Path**: `/users/victim-uid`
- **Payload**: `{"name": "Attacker Hijacker", "phone": "03123456789"}`
- **Attempt**: Attacker tries to write to a victim's user document.
- **Result**: `PERMISSION_DENIED`

### 6. Forge Another User's Booking
- **Target Path**: `/bookings/booking-abc`
- **Payload**: `{"userId": "victim-uid", "companionId": "companion-123", "totalAmount": 1500, "status": "pending_verification"}`
- **Attempt**: Attacker creates a booking on behalf of another user.
- **Result**: `PERMISSION_DENIED`

### 7. Read Booking Logs of Other Users
- **Target Path**: `/bookings` (list query)
- **State**: User tries to fetch all bookings without filtering by their own `userId`.
- **Result**: `PERMISSION_DENIED`

### 8. Malicious Write to Companion Database
- **Target Path**: `/companions/companion-123`
- **Payload**: `{"name": "Hacked Companion", "rate": 0}`
- **Attempt**: Standard user tries to add or edit a companion profile.
- **Result**: `PERMISSION_DENIED`

### 9. Deny-of-Wallet Path Size Abuse
- **Target Path**: `/users/very-long-garbage-string-over-128-chars-to-exhaust-firestore-memory`
- **Attempt**: Attacker injects a massive ID to crash indexing or blow up costs.
- **Result**: `PERMISSION_DENIED`

### 10. Fraudulent Instant Booking Confirmation
- **Target Path**: `/bookings/booking-abc` (update)
- **Payload**: `{"status": "confirmed"}`
- **Attempt**: Customer attempts to directly confirm their booking without sending money or waiting for admin verification.
- **Result**: `PERMISSION_DENIED`

### 11. Poison Booking Timestamps
- **Target Path**: `/bookings/booking-abc`
- **Payload**: `{"createdAt": "2020-01-01T00:00:00Z"}` (client-provided old date)
- **Attempt**: User sets backdated timestamps.
- **Result**: `PERMISSION_DENIED`

### 12. Tampering with Companion Ratings
- **Target Path**: `/companions/companion-123`
- **Payload**: `{"rating": 5.0, "reviewsCount": 1000}`
- **Attempt**: User modifies the rating of a companion directly rather than submitting feedback through a verified workflow.
- **Result**: `PERMISSION_DENIED`

---

## 3. High-Level Rules Structure (firestore.rules)
A complete unit test simulation outline verifying that all of the above payloads fail validation while legitimate actions (registering a user with `pending` status, viewing own profile, booking, and admin management) succeed.
