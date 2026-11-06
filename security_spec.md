# Security Specification & Threat Model for Trí Tuệ Phản Biện

## 1. Data Invariants
1. **User Identity Invariant**: A student document in `/users/{userId}` can only be created, read, or modified if `request.auth.uid == userId`.
2. **PII Isolation Invariant**: Full user profiles containing Google email are strictly restricted to `request.auth.uid == userId`. The public leaderboard is hosted in `/leaderboard/{userId}` without email.
3. **Anti-Tampering Invariant for XP & Badges**: Clients cannot arbitrarily increment or mutate `xp`, `level`, `debatesWon`, or `fallaciesIdentified`. Client updates cannot modify `xp` (`incoming().xp == existing().xp`).
4. **Relational Subcollection Invariant**: Any debate match in `/users/{userId}/matches/{matchId}` must belong to the authenticated owner (`incoming().userId == userId`). Matches are append-only (immutable once created).
5. **Path Variable Hardening**: Document IDs must conform to `isValidId(id)` (`id.size() <= 128` and matching alphanumeric/dashes).

## 2. The Dirty Dozen Test Payloads
1. **Payload 1 (Identity Spoofing - Create User)**: Attacker with UID `alice` attempts to create `/users/bob` with `id: "bob"`. (Expect: PERMISSION_DENIED)
2. **Payload 2 (PII Snooping - Read User Profile)**: User `bob` attempts to `get` `/users/alice` containing Alice's Google email. (Expect: PERMISSION_DENIED)
3. **Payload 3 (Blanket Query Scraping - List Users)**: Attacker attempts to list all documents in `/users`. (Expect: PERMISSION_DENIED)
4. **Payload 4 (XP Self-Award Injection - Update XP)**: Authenticated user `alice` attempts an update to `/users/alice` changing `xp` from 80 to 99999. (Expect: PERMISSION_DENIED)
5. **Payload 5 (Level Escalation - Update Level)**: Authenticated user `alice` attempts an update to `/users/alice` changing `level` from 1 to 10. (Expect: PERMISSION_DENIED)
6. **Payload 6 (Shadow Field Injection)**: Authenticated user `alice` attempts to inject a ghost field `isAdmin: true` into `/users/alice`. (Expect: PERMISSION_DENIED)
7. **Payload 7 (Orphaned Match Injection)**: User `alice` attempts to write a match into `/users/bob/matches/match_123`. (Expect: PERMISSION_DENIED)
8. **Payload 8 (Match History Mutation)**: User `alice` attempts to update an existing match record in `/users/alice/matches/match_123` to rewrite history. (Expect: PERMISSION_DENIED)
9. **Payload 9 (Denial of Wallet - Oversized String)**: Attacker attempts to create a user profile with a 2MB `displayName`. (Expect: PERMISSION_DENIED)
10. **Payload 10 (Path Traversal / Malicious ID)**: Attacker attempts to write a document with an invalid ID like `../users/root` or a 2KB string. (Expect: PERMISSION_DENIED)
11. **Payload 11 (Unauthenticated Write)**: Unauthenticated visitor attempts to write to `/users/anon` or `/leaderboard/anon`. (Expect: PERMISSION_DENIED)
12. **Payload 12 (Leaderboard XP Tampering)**: User `alice` attempts to update `/leaderboard/alice` with `xp: 50000`. (Expect: PERMISSION_DENIED)
