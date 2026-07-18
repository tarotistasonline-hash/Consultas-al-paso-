# Security Specification & Threat Model (TDD)

This document maps out the Core Data Invariants, the "Dirty Dozen" active threat payloads, and test conditions designed to ensure Zero-Trust Attribute-Based Access Control (ABAC) on our Firestore DB.

## 1. Data Invariants

- **Ownership Locking**: Users can ONLY read and write their own `/users/{userId}` and `/users/{userId}/messages/{messageId}` paths. No cross-user access is permitted under any circumstances.
- **Identity Consistency**: The user's UID from `request.auth.uid` MUST match the path parameter `{userId}` exactly.
- **Immutable Auth Headers**: The `uid` and `email` properties inside `UserProfile` are immutable after creation and must match `request.auth`.
- **Temporal Strictness**: Timestamps (like `updatedAt` for user profiles and `createdAt` for message documents) must use `request.time` exactly.
- **Sanitized Structure**:
  - `theme` must be strictly `"cruda"` or `"sober"`. No other inputs allowed.
  - `role` in message turns can only be `"user"` or `"assistant"`.
  - String sizes must be bounded under realistic limits (e.g., text content under 10,000 chars, theme under 10 chars, emails under 256 chars, IDs under 128 chars) to guard against DB bloat and "Denial of Wallet" resource exhaustion.

---

## 2. The "Dirty Dozen" Payloads

Here are twelve highly malicious payloads designed to test our security rules and force a `PERMISSION_DENIED` outcome:

### [PILLAR: IDENTITY SPOOFING]
1. **Attack 1: Create profile for a different UID**
   - Path: `/users/hacker123`
   - Actor: Authenticated as `victim456`
   - Payload: `{"uid": "hacker123", "email": "hacker@evil.com", "theme": "cruda"}`
2. **Attack 2: Read someone else's stats profile**
   - Path: `/users/victim456`
   - Actor: Authenticated as `attacker789`
   - Action: `get` / `read`
3. **Attack 3: Inject Chat history into another user's message stack**
   - Path: `/users/victim456/messages/msg_999`
   - Actor: Authenticated as `attacker789`
   - Payload: `{"id": "msg_999", "userId": "victim456", "role": "user", "content": "Fake message", "createdAt": "request.time"}`

### [PILLAR: SCHEMATIC POISONING & DATA INTEGRITY]
4. **Attack 4: Override system limits on stats with invalid type**
   - Path: `/users/user_1`
   - Actor: Authenticated as `user_1`
   - Payload: `{"uid": "user_1", "email": "user@gmail.com", "resolvedDilemas": "invalid_string_type", "theme": "cruda"}`
5. **Attack 5: Inject unauthorized role value inside message turns**
   - Path: `/users/user_1/messages/msg_001`
   - Actor: Authenticated as `user_1`
   - Payload: `{"id": "msg_001", "userId": "user_1", "role": "administrator_godmode", "content": "hello", "createdAt": "request.time"}`
6. **Attack 6: Attempt a Denial of Wallet (Resource Exhaustion) via massive string size**
   - Path: `/users/user_1`
   - Actor: Authenticated as `user_1`
   - Payload: `{"uid": "user_1", "email": "user@gmail.com", "theme": "sober_very_long_extra_padding_string_to_exhaust_memory_and_bloat_database_size_attacks_1122334455"}`

### [PILLAR: TEMPORAL SPOOFING & WRITER PRIVILEGES]
7. **Attack 7: Backdate creation timestamps (Temporal Spoofing)**
   - Path: `/users/user_1/messages/msg_002`
   - Actor: Authenticated as `user_1`
   - Payload: `{"id": "msg_002", "userId": "user_1", "role": "user", "content": "old", "createdAt": "2010-01-01T00:00:00Z"}` (instead of `request.time`)
8. **Attack 8: Modify assistant replies (System Integrity violation)**
   - Path: `/users/user_1/messages/assistant_msg`
   - Actor: Authenticated as `user_1` (Trying to edit an already written assistant Response)
   - Action: `update` modifying `content` to say "Approved" or hack prompts.

### [PILLAR: UNAUTHENTICATED GATEKEEPERS]
9. **Attack 9: Anonymous read access on private user profiles**
   - Path: `/users/user_1`
   - Actor: Unauthenticated (Guest visitor)
   - Action: `get`
10. **Attack 10: Path Variable Poisoning check (`isValidId` validation)**
    - Path: `/users/user_1/messages/BAD_ID_$$$_CHARACTERS_THAT_SHOULD_FAIL_VALIDATION_`
    - Actor: Authenticated as `user_1`
    - Payload: `{"id": "BAD_ID", "userId": "user_1", "role": "user", "content": "hijack", "createdAt": "request.time"}`

### [PILLAR: ENFORCE KEY SYNC & SEPARATE ACTION TIERED LOGIC]
11. **Attack 11: Profile creation missing required parameters**
    - Path: `/users/user_1`
    - Actor: Authenticated as `user_1`
    - Payload: `{"theme": "cruda", "resolvedDilemas": 5}` (Lack of `uid` and `email` properties)
12. **Attack 12: Modify read-only Immutable profile keys after creation**
    - Path: `/users/user_1`
    - Actor: Authenticated as `user_1` (Trying to change `email` or `uid` field)
    - Action: `update` on `{"email": "changed@hacker.com"}`

---

## 3. Test Cases (TDD Execution Script)
Our security assertions mandate that all of the above result in a `PERMISSION_DENIED` status. The rules will enforce exact structures to make this mathematical proof absolute.
