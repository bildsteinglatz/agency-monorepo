# sevDesk Integration Guide

This document explains the sevDesk API integration for automatic contact and invoice creation when members sign up at Halle 5.

## Overview

When a user submits the membership form:
1. Data is saved to Firebase Firestore (`membership_inquiries` collection)
2. A contact is created (or found) in sevDesk
3. An invoice is automatically generated in sevDesk with the membership details

## Setup Instructions

### 1. Install Dependencies

```bash
cd apps/next-h5
pnpm install
```

This will install the new `axios` dependency needed for sevDesk API calls.

### 2. Get Your sevDesk API Key

1. Log in to [sevDesk](https://my.sevdesk.de/)
2. Go to **Settings** → **User Management** → **API Token**
3. Create a new API token or copy your existing one
4. Save this token securely

### 3. Find Your Contact Person ID

Your Contact Person ID is your user ID in sevDesk. To find it:

**Option A: Via API**
```bash
curl "https://my.sevdesk.de/api/v1/SevUser?token=YOUR_API_KEY"
```

**Option B: Via sevDesk UI**
1. Go to your profile settings
2. The ID is in the URL or can be found in your user details

### 4. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your credentials:

```env
# sevDesk Configuration
SEVDESK_API_KEY=your_actual_api_key_here
SEVDESK_CONTACT_PERSON_ID=your_user_id_here
```

⚠️ **Important**: Never commit `.env.local` to git. It's already in `.gitignore`.

## Architecture

### Files Created

1. **`/src/lib/sevdesk.ts`** - Core sevDesk API utilities
   - `createSevDeskMember()` - Main function to create contact + invoice
   - `findContactByEmail()` - Search for existing contacts
   - `createContact()` - Create new contact with email
   - `createInvoice()` - Generate invoice with line items

2. **`/src/app/api/membership/create/route.ts`** - Next.js API Route
   - Handles form submissions
   - Saves to Firebase
   - Calls sevDesk integration
   - Returns success/error status

3. **Updated: `/src/components/membership/MembershipDrawer.tsx`**
   - Now calls the API route instead of Firebase directly
   - Handles loading states and errors

## How It Works

### Step-by-Step Flow

1. **User submits membership form** with:
   - Name
   - Email
   - Message (optional)
   - Membership tier (e.g., "Freund*in")
   - Price (e.g., "€ 15")

2. **API Route receives request** (`POST /api/membership/create`)
   - Validates required fields
   - Saves to Firebase immediately

3. **sevDesk Integration** (if API key is configured):
   - **Search for contact**: Looks up email in sevDesk
   - **Create contact** (if not found):
     - Creates new contact with name and email
     - Adds email as contact address
   - **Create invoice**:
     - Creates invoice linked to contact
     - Adds line item: "Jahresbeitrag Halle 5 - [Membership Type]"
     - Sets price from membership tier
     - Marks as "Open" (status 200) for bank reconciliation
   - **Update Firebase**: Records sevDesk contact/invoice IDs

4. **Response returned** with:
   - Firebase document ID
   - sevDesk contact ID (if successful)
   - sevDesk invoice ID and number (if successful)

### Error Handling

- If sevDesk API fails, **the membership signup still succeeds**
- Error is logged in Firebase with `sevdeskStatus: 'failed'`
- Error details are saved for manual follow-up
- User sees success message (they don't need to know about sevDesk errors)

## Invoice Details

Each invoice created includes:

- **Header**: "Mitgliedsbeitrag Halle 5"
- **Line Item**: "Jahresbeitrag Halle 5 - [Membership Type]"
- **Price**: From the membership tier selected
- **Tax**: 0% (membership fees are tax-exempt per § 4 Nr. 22 UStG)
- **Status**: Open (200) - ready for bank reconciliation
- **Payment Method**: Bank transfer

## Firebase Data Structure

### Document in `membership_inquiries` collection:

```typescript
{
  name: string;
  email: string;
  message: string;
  membershipType: string;  // e.g., "Freund*in"
  price: string;           // e.g., "€ 15"
  createdAt: Timestamp;
  
  // sevDesk integration fields
  sevdeskStatus: 'pending' | 'success' | 'failed';
  sevdeskContactId?: string;
  sevdeskInvoiceId?: string;
  sevdeskInvoiceNumber?: string;
  sevdeskError?: string;  // Only if failed
}
```

## Testing

### 1. Test Locally

```bash
cd apps/next-h5
pnpm dev
# Open http://localhost:3000/member
```

### 2. Fill Out Membership Form

- Click on any membership tier card
- Fill in the form with test data
- Submit

### 3. Verify Results

**In Firebase Console:**
- Check `membership_inquiries` collection
- Verify `sevdeskStatus` field

**In sevDesk:**
- Go to **Contacts** → Search for test email
- Go to **Invoices** → Check for new invoice
- Verify invoice details and line items

### 4. Test Error Handling

To test without sevDesk (error scenario):
- Remove or invalidate `SEVDESK_API_KEY` in `.env.local`
- Submit form
- Verify Firebase document has `sevdeskStatus: 'failed'`

## Production Deployment

### Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - `SEVDESK_API_KEY`
   - `SEVDESK_CONTACT_PERSON_ID`
4. Deploy

### Monitoring

Check Firebase Console regularly for:
- Documents with `sevdeskStatus: 'failed'`
- Missing sevDesk IDs
- Error messages in `sevdeskError` field

## Troubleshooting

### Common Issues

**Issue**: "sevDesk API key is not configured"
- **Solution**: Add `SEVDESK_API_KEY` to `.env.local`

**Issue**: Invoice created but contact not linked
- **Solution**: Verify `SEVDESK_CONTACT_PERSON_ID` is correct

**Issue**: Email not added to contact
- **Solution**: Check sevDesk API logs, may need to adjust category ID

**Issue**: Wrong tax rate applied
- **Solution**: Verify `taxRate: '0'` and `taxText` in `sevdesk.ts`

### Debug Mode

To enable detailed logging:

```typescript
// In /src/lib/sevdesk.ts
console.log('sevDesk request:', data);
console.log('sevDesk response:', response.data);
```

## API Rate Limits

sevDesk API has rate limits:
- Check your sevDesk plan for specific limits
- Consider implementing retry logic for production
- Cache contact lookups if needed

## Security Notes

- ✅ API key is server-side only (not exposed to client)
- ✅ Environment variables are never committed to git
- ✅ API route validates all inputs
- ✅ Firebase rules should restrict write access
- ⚠️ Consider adding rate limiting to the API route

## Automation & Admin Tools

Automated processing is provided via a secure admin reprocess endpoint:

- **Endpoint**: `POST /api/admin/sevdesk/reprocess`
- **Protection**: Requires header `x-admin-token` set to `SEVDESK_ADMIN_TOKEN` (set in `.env.local`)
- **Behavior**: Reprocesses up to `limit` failed/pending membership documents (or a single `docId` if provided), calling sevDesk and updating the Firestore doc with results.

### CLI helper

A small script `tools/processFailedSevdesk.js` can be used locally or on a server to trigger the endpoint (useful for cron jobs):

```bash
SEVDESK_ADMIN_TOKEN=your_admin_token node tools/processFailedSevdesk.js
```

### Future Enhancements

1. **Email Notifications**
   - Send confirmation email with invoice PDF
   - Notify admin of new memberships

2. **Payment Integration**
   - Link to online payment gateway
   - Auto-update invoice status on payment

3. **Background Worker**
   - Move reprocessing to a scheduled Cloud Function or task queue (Cloud Tasks) for full automation

4. **Admin Dashboard**
   - View all memberships
   - Manually trigger sevDesk sync
   - Export reports

## Support

For issues with:
- **sevDesk API**: Check [sevDesk API Documentation](https://api.sevdesk.de/)
- **Firebase**: Check [Firebase Documentation](https://firebase.google.com/docs)
- **This integration**: Contact the development team

## License

This integration is part of the Halle 5 project.
