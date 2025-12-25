# Product Context

## Overview
This monorepo (`my-agency-mono`) serves as the central codebase for multiple agency websites and their respective backends. The goal is to develop different frontends and backends using a unified, scalable, and logic-driven approach.

## Core Projects
### 1. Halle 5 Redesign (H5)
- **Frontend**: `apps/next-h5`
- **Backend**: `apps/studio-h5` (Sanity Studio)
- **Goal**: A visually rich, brutalist redesign for Halle 5.

### 2. Bildstein Glatz Redesign (W25)
- **Frontend**: `apps/nextjs-w25`
- **Backend**: `apps/studio-w25` (Sanity Studio)
- **Goal**: Redesign for the Bildstein Glatz agency.

## Strategic Goals
1. **Unified Development**: Develop different frontends and backends in the same way to maintain consistency and ease of maintenance.
2. **Clean & Safe**: Focus on clean, logical, and type-safe code.
3. **Visual Excellence**: Create visually stunning, "wow" factor user interfaces.
4. **Future Phases**:
   - User interaction (Onboarding).
   - **Automated communication**: Implemented via Resend (Membership inquiries, Visitor registration).
   - Build cleanup and UI/UX polishing.

## Current Status (Dec 2025)
- **AI Concierge**: Upgraded to Gemini 3 Flash with extensive "Halle 5" knowledge base.
- **Email Integration**: Resend integrated for `apps/next-h5`.
  - **Domain**: `mail.halle5.at` (Verification pending).
  - **Sender**: `hello@mail.halle5.at`.
  - **Features**: Automated membership confirmations and visitor registration emails.
- **UI/UX**: Pottery game mobile controls refined (relative touch, horizontal arms).
- **Branding**: Favicon updated to Halle 5 icon.
