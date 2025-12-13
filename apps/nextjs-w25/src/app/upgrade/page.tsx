export default function UpgradePage() {
  return (
    <div className="max-w-lg mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-2">Upgrade to Premium</h1>
      <p className="mb-4">Premium users get access to exclusive content.</p>
      <button className="bg-pink-600 text-white py-2 px-4 rounded mb-2">
        {/* TODO: Connect to Stripe Checkout */}
        Pay with Stripe
      </button>
      <button className="bg-blue-600 text-white py-2 px-4 rounded">
        {/* TODO: Integrate PayPal REST API */}
        Pay with PayPal
      </button>
    </div>
  );
}
