import { client } from "@/sanity/client";
import { redirect } from "next/navigation";

export const revalidate = 60;

export default async function StaffPage({
    searchParams,
}: {
    searchParams: { email?: string };
}) {
    const email = searchParams.email;

    if (!email) {
        // If no email, we could show the login form or redirect
        // For now, let's assume they need to come from the login
        return (
            <main className="min-h-screen bg-black text-white p-12 flex items-center justify-center">
                <div className="max-w-md w-full">
                    <h1 className="text-6xl font-black uppercase mb-12 text-center">Access Denied</h1>
                    <p className="text-xl mb-8 text-center">Please login via the Privacy page or contact an administrator.</p>
                </div>
            </main>
        );
    }

    // Check if staff exists
    const staff = await client.fetch(
        `*[_type == "staff" && email == $email && showOnWebsite != false][0]`,
        { email }
    );

    if (!staff) {
        return (
            <main className="min-h-screen bg-black text-white p-12 flex items-center justify-center">
                <div className="max-w-md w-full text-center">
                    <h1 className="text-6xl font-black uppercase mb-8">Unauthorized</h1>
                    <p className="text-xl mb-8">The email {email} is not registered as staff.</p>
                    <a href="/visitor-checkin" className="inline-block border-4 border-white p-4 font-black uppercase hover:bg-white hover:text-black transition-all">
                        Back to Register
                    </a>
                </div>
            </main>
        );
    }

    // Fetch visitors
    const visitors = await client.fetch(`*[_type == "visitor"] | order(_createdAt desc)`);

    return (
        <main className="min-h-screen bg-white text-black p-8 md:p-24">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                    <div>
                        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
                            Staff Dashboard
                        </h1>
                        <p className="text-2xl font-bold mt-4">
                            Welcome back, {staff.name} ({staff.role})
                        </p>
                    </div>
                    <div className="bg-black text-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,255,0,1)]">
                        <p className="text-4xl font-black">{visitors.length}</p>
                        <p className="uppercase font-bold">Total Visitors</p>
                    </div>
                </div>

                <div className="overflow-x-auto border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black text-white uppercase text-xl">
                                <th className="p-6 border-r-4 border-white">Name</th>
                                <th className="p-6 border-r-4 border-white">Email</th>
                                <th className="p-6 border-r-4 border-white">DSVGO</th>
                                <th className="p-6 border-r-4 border-white">Newsletter</th>
                                <th className="p-6">Registered</th>
                            </tr>
                        </thead>
                        <tbody className="text-lg font-bold">
                            {visitors.map((visitor: any) => (
                                <tr key={visitor._id} className="border-b-4 border-black hover:bg-yellow-50 transition-colors">
                                    <td className="p-6 border-r-4 border-black">{visitor.name}</td>
                                    <td className="p-6 border-r-4 border-black">{visitor.email}</td>
                                    <td className="p-6 border-r-4 border-black">
                                        <span className={visitor.dsvgoAccepted ? "text-green-600" : "text-red-600"}>
                                            {visitor.dsvgoAccepted ? "✓ YES" : "✗ NO"}
                                        </span>
                                    </td>
                                    <td className="p-6 border-r-4 border-black">
                                        <span className={visitor.newsletterSubscribed ? "text-blue-600" : "text-red-600"}>
                                            {visitor.newsletterSubscribed ? "✓ YES" : "✗ NO"}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        {new Date(visitor._createdAt).toLocaleDateString('de-DE')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
