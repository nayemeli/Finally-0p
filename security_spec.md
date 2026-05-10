# Security Specification for Amar Khoroch

## Data Invariants
- A transaction must have an amount > 0.
- `type` must be either 'income' or 'expense'.
- `userId` must strictly match the authenticated user's UID.
- Users can only read, update, or delete their own transactions.
- `createdAt` and `userId` are immutable after creation.

## The Dirty Dozen Payloads
1. Create a transaction with another user's `userId`.
2. Create a transaction without being logged in.
3. Update a transaction's `userId` to a different user.
4. Read transactions belonging to another user.
5. Create a transaction with a negative amount.
6. Create a transaction with an invalid `type` (e.g., 'stolen').
7. Update `createdAt` field on an existing transaction.
8. Delete another user's transaction.
9. Write a transaction with an extremely large note (> 1MB).
10. Query all transactions without filtering by `userId`.
11. Create a transaction with a future `createdAt` timestamp (not using `request.time`).
12. Batch update another user's transactions.

## The Test Runner (firestore.rules.test.ts)
(Logic included in rules implementation)
