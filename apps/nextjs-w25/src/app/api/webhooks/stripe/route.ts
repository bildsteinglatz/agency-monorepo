export async function POST(req: Request) {
  // TODO: Parse Stripe event and update user role to 'premium'
  return new Response("Stripe webhook received");
}
