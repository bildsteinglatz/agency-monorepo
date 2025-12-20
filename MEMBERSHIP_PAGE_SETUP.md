# Membership Page Setup Guide

The membership page (`/member`) is fully implemented with Sanity CMS integration and Firebase form handling. This guide explains how to configure and use it.

## Architecture Overview

### Components
- **MembershipHero**: Title and introduction section
- **MembershipTier**: Individual membership card with hover effects and drawer trigger
- **MembershipScale**: Price scale grid for professional partnership tiers
- **MembershipProject**: Project funding cards with drawer triggers
- **MembershipDrawer**: Slide-over form for membership registration

### Data Flow
1. Server-side page (`/app/member/page.tsx`) fetches membership data from Sanity
2. Data is serialized and passed to client components
3. User selects a membership tier → MembershipDrawer opens
4. Form submission → Firebase Firestore collection `membership_inquiries`

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create Project"
3. Name it (e.g., "halle5-membership")
4. Enable Google Analytics (optional)

### 2. Add Web App
1. In Firebase console, click "Add App" → Web
2. Copy the Firebase config object

### 3. Create Firestore Database
1. Go to "Firestore Database" in the left menu
2. Click "Create Database"
3. Choose "Start in production mode"
4. Select region closest to your users
5. Click "Enable"

### 4. Set Firestore Security Rules
Navigate to "Firestore Database" → "Rules" and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /membership_inquiries/{document=**} {
      allow create: if request.auth == null;
      allow read, update, delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

### 5. Update Environment Variables
Create/update `.env.local` in `/apps/next-h5/`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Sanity Data Structure

### Membership Document Type
All membership data is stored in Sanity with the following fields:

```typescript
{
  title: string;              // e.g., "Freund*in"
  slug: { current: string };  // URL slug
  category: "private" | "professional" | "projects";
  priceLabel: string;         // e.g., "€ 15"
  description: string;        // Tier description
  benefits: string[];         // Array of benefits
  order: number;              // Display order
  type: "tier" | "project";   // Tier card or project item
  ctaText?: string;          // Custom button text
}
```

### Pre-loaded Tiers
The database includes 9 sample membership tiers:

#### Private (Individual) Memberships
1. **Freund*in** (€15) - Basic support
2. **Unterstützer*in** (€50) - Active community member
3. **Advocate** (€150) - Premium supporter

#### Professional Partnerships
4. **Bronze Partner** (€300) - Logo placement & events
5. **Silber Partner** (€750) - Extended visibility
6. **Gold Partner** (€2000) - Strategic partnership

#### Project Funding
7. **Artist-in-Residence** (€500) - Support residencies
8. **Praktikum** (€300) - Support internship program
9. **Kaffee & Community** (€100) - Support community events

## Form Submission Flow

When a user submits the membership form via the drawer:

1. Form data is validated client-side
2. Data is sent to Firebase Firestore `membership_inquiries` collection
3. Success animation plays (✓ checkmark)
4. User receives confirmation message
5. Drawer closes automatically after 2 seconds

### Stored Data
```typescript
{
  name: string;
  email: string;
  message: string;
  membershipType: string;     // Selected tier name
  createdAt: Timestamp;       // Server timestamp
}
```

## Page Structure

### `/member` Route
- **Hero Section**: "Jetzt Mitglied Werden" headline
- **Private Memberships** (Für Einzelne): 3-column grid
- **Professional Partnerships** (Für Unternehmen): Price scale + 2-column details
- **Project Funding** (Für Projekte): Full-width cards on dark background
- **CTA Footer**: Contact email section

## Design System

All components follow the brutalist aesthetic:
- **Borders**: `border-4` / `border-8` black
- **Shadows**: `shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`
- **Hover Effects**: Scale, rotate, shadow expansion
- **Typography**: Uppercase, bold, Geist Mono for headings
- **Colors**: Black/white with accent `#FF3100` (orange-red)

## Animations
- **Framer Motion** for all interactive elements
- **Spring physics** on cards and buttons
- **Staggered container** animations for lists
- **Scroll-triggered** reveals with `whileInView`

## Editing Membership Tiers

### In Sanity Studio
1. Go to studio-h5 Sanity workspace
2. Add/edit documents of type `membership`
3. Publish changes
4. Changes appear on `/member` page automatically (with page refresh/rebuild)

### Key Fields to Edit
- **Title**: Display name for tier
- **Price Label**: Shows as large number (e.g., "€ 150")
- **Category**: Must be one of: `private`, `professional`, `projects`
- **Benefits**: Array of benefit strings
- **Order**: Controls display position (1-9)
- **Type**: `tier` for membership cards, `project` for funding items

## Testing Locally

1. Install dependencies:
```bash
cd /Users/mbildstein/my-agency-mono
pnpm install
```

2. Start the dev server:
```bash
cd apps/next-h5
pnpm dev
```

3. Open [http://localhost:3000/member](http://localhost:3000/member)

4. Test form submission (requires valid Firebase credentials)

## Deployment Notes

- Firebase config uses `NEXT_PUBLIC_*` prefix (visible in browser - this is intentional for public projects)
- Firestore security rules prevent unauthorized writes
- All form data is stored server-side in Firestore
- No authentication required for form submissions (public access)

## Troubleshooting

### Membership tiers not showing
- Check Sanity has published membership documents
- Verify Sanity `projectId` and `dataset` in `.env.local`
- Check browser console for GROQ query errors

### Form submission fails
- Verify Firebase config environment variables
- Check Firestore security rules allow `create` on `membership_inquiries`
- Check browser console for Firebase errors

### Images/Styling looks broken
- Ensure Tailwind CSS is properly installed
- Run `pnpm install` to get all dependencies
- Clear Next.js cache: `rm -rf .next`

## Future Enhancements

- Email confirmations on form submission
- Admin dashboard to view inquiries
- Automated email notifications to team
- Payment integration for tier upgrades
- User account dashboard
