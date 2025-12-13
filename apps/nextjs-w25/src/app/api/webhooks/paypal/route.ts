export async function POST(req: Request) {
  // TODO: Parse PayPal event and update user role to 'premium'
  return new Response("PayPal webhook received");
}
