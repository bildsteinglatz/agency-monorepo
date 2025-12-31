import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getTokens } from 'next-firebase-auth-edge';
import { cookies } from 'next/headers';
import { serverConfig } from '@/firebase/server-config';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key', {
    apiVersion: '2025-01-27.acacia' as any, // Bypass strict type check for now or use correct version
});

export async function POST(request: Request) {
    try {
        if (!serverConfig.apiKey) {
            console.error('Firebase API Key is missing in server config');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Verify authentication
        const tokens = await getTokens(await cookies(), {
            apiKey: serverConfig.apiKey,
            cookieName: serverConfig.cookieName,
            cookieSignatureKeys: serverConfig.cookieSignatureKeys,
            serviceAccount: serverConfig.serviceAccount,
        });

        if (!tokens) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { amount, currency = 'eur', metadata } = await request.json();

        if (!amount) {
            return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
        }

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            metadata: {
                userId: tokens.decodedToken.uid,
                email: tokens.decodedToken.email || '',
                ...metadata,
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error: any) {
        console.error('Error creating payment intent:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
