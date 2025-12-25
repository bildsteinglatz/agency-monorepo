import axios from 'axios';

const SEVDESK_API_URL = 'https://my.sevdesk.de/api/v1';
const SEVDESK_API_KEY = process.env.SEVDESK_API_KEY || '';

// axios instance with timeout
const http = axios.create({
    baseURL: SEVDESK_API_URL,
    timeout: 10000, // 10s
});

async function requestWithRetry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 500): Promise<T> {
    let lastErr: any;
    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();
        } catch (err) {
            lastErr = err;
            const wait = delayMs * Math.pow(2, i);
            await new Promise((r) => setTimeout(r, wait));
        }
    }
    throw lastErr;
}

interface ContactData {
    name: string;
    email: string;
}

interface MembershipData extends ContactData {
    membershipType: string;
    price: string;
}

interface WorkshopOrderData extends ContactData {
    workshopTitle: string;
    price: string;
}

interface SevDeskContact {
    id: string;
    name: string;
    email: string;
}

interface SevDeskInvoice {
    id: string;
    invoiceNumber: string;
}

/**
 * Search for an existing contact by email in sevDesk
 */
async function findContactByEmail(email: string): Promise<SevDeskContact | null> {
    try {
        const response = await requestWithRetry(() => http.get('/Contact', {
            params: { token: SEVDESK_API_KEY, email }
        }));

        const data = (response as any).data;
        if (data?.objects && data.objects.length > 0) {
            return data.objects[0];
        }
        return null;
    } catch (error) {
        console.error('Error searching for contact:', error);
        return null;
    }
}

/**
 * Create a new contact in sevDesk
 */
async function createContact(contactData: ContactData): Promise<SevDeskContact> {
    try {
        const response = await requestWithRetry(() => http.post('/Contact', {
            name: contactData.name,
            customerNumber: null,
            category: { id: 3, objectName: 'Category' },
            surename: contactData.name.split(' ').pop() || contactData.name,
            familyname: contactData.name.split(' ').slice(0, -1).join(' ') || '',
        }, { params: { token: SEVDESK_API_KEY } }));

        const created = (response as any).data.objects;
        const id = created?.id;

        if (id) {
            await requestWithRetry(() => http.post('/ContactAddress', {
                contact: { id, objectName: 'Contact' },
                key: '2', // Email type
                value: contactData.email,
                category: { id: 3, objectName: 'Category' },
            }, { params: { token: SEVDESK_API_KEY } }));
        }

        return created;
    } catch (error) {
        console.error('Error creating contact:', error);
        throw new Error('Failed to create contact in sevDesk');
    }
}

/**
 * Create an invoice in sevDesk for the membership
 */
async function createInvoice(
    contact: SevDeskContact,
    itemTitle: string,
    itemDescription: string,
    price: string,
    header: string = 'Rechnung Halle 5'
): Promise<SevDeskInvoice> {
    try {
        // Step 1: Create the invoice
        const invoiceResponse = await requestWithRetry(() => http.post('/Invoice', {
            invoiceNumber: null,
            contact: { id: contact.id, objectName: 'Contact' },
            contactPerson: { id: process.env.SEVDESK_CONTACT_PERSON_ID || '0', objectName: 'SevUser' },
            invoiceDate: new Date().toISOString().split('T')[0],
            status: '100', // Draft
            header: header,
            headText: `Vielen Dank für Ihre Unterstützung!`,
            footText: `Mit freundlichen Grüßen\nIhr Halle 5 Team`,
            invoiceType: 'RE',
            currency: 'EUR',
            showNet: false,
            sendType: 'VPR',
            taxRate: '0',
            taxText: 'Steuerfreie Umsätze gem. § 4 Nr. 22 UStG',
            taxType: 'default',
            paymentMethod: { id: '1', objectName: 'PaymentMethod' },
            small: false,
        }, { params: { token: SEVDESK_API_KEY } }));

        const invoice = (invoiceResponse as any).data.objects;

        // Step 2: Add invoice position (line item)
        const priceValue = parseFloat(price.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;

        await requestWithRetry(() => http.post('/InvoicePos', {
            invoice: { id: invoice.id, objectName: 'Invoice' },
            quantity: 1,
            price: priceValue,
            name: itemTitle,
            unity: { id: '1', objectName: 'Unity' },
            taxRate: '0',
            text: itemDescription,
            positionNumber: 1,
        }, { params: { token: SEVDESK_API_KEY } }));

        // Step 3: Set invoice status to Open (200)
        await requestWithRetry(() => http.put(`/Invoice/${invoice.id}`, {
            status: '200',
        }, { params: { token: SEVDESK_API_KEY } }));

        return invoice;
    } catch (error) {
        console.error('Error creating invoice:', error);
        throw new Error('Failed to create invoice in sevDesk');
    }
}

/**
 * Main function: Create or update contact and create invoice for membership
 */
export async function createSevDeskMember(membershipData: MembershipData): Promise<{
    contact: SevDeskContact;
    invoice: SevDeskInvoice;
}> {
    if (!SEVDESK_API_KEY) {
        throw new Error('sevDesk API key is not configured');
    }

    try {
        // Step 1: Find or create contact
        let contact = await findContactByEmail(membershipData.email);
        
        if (!contact) {
            console.log(`Creating new contact for ${membershipData.email}`);
            contact = await createContact({
                name: membershipData.name,
                email: membershipData.email,
            });
        } else {
            console.log(`Found existing contact for ${membershipData.email}`);
        }

        // Step 2: Create invoice
        console.log(`Creating invoice for membership: ${membershipData.membershipType}`);
        const invoice = await createInvoice(
            contact,
            `Jahresbeitrag Halle 5 - ${membershipData.membershipType}`,
            `Mitgliedschaft: ${membershipData.membershipType}`,
            membershipData.price,
            `Mitgliedsbeitrag Halle 5`
        );

        return { contact, invoice };
    } catch (error) {
        console.error('Error in createSevDeskMember:', error);
        throw error;
    }
}

/**
 * Main function: Create or update contact and create invoice for workshop order
 */
export async function createSevDeskWorkshopOrder(orderData: WorkshopOrderData): Promise<{
    contact: SevDeskContact;
    invoice: SevDeskInvoice;
}> {
    if (!SEVDESK_API_KEY) {
        throw new Error('sevDesk API key is not configured');
    }

    try {
        // Step 1: Find or create contact
        let contact = await findContactByEmail(orderData.email);
        
        if (!contact) {
            console.log(`Creating new contact for ${orderData.email}`);
            contact = await createContact({
                name: orderData.name,
                email: orderData.email,
            });
        } else {
            console.log(`Found existing contact for ${orderData.email}`);
        }

        // Step 2: Create invoice
        console.log(`Creating invoice for workshop: ${orderData.workshopTitle}`);
        const invoice = await createInvoice(
            contact,
            `Workshop: ${orderData.workshopTitle}`,
            `Teilnahme am Workshop: ${orderData.workshopTitle}`,
            orderData.price,
            `Workshop-Rechnung Halle 5`
        );

        return { contact, invoice };
    } catch (error) {
        console.error('Error in createSevDeskWorkshopOrder:', error);
        throw error;
    }
}
