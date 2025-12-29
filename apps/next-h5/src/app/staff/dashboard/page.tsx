import { requireStaffRole } from '@/lib/auth-admin';
import { WorkshopAttendance } from '@/components/dashboard/WorkshopAttendance';
import { NewsletterExport } from '@/components/staff/NewsletterExport';

export default async function StaffDashboardPage() {
  // 1. Check Auth (Redirects if not staff)
  const user = await requireStaffRole();

  // Example Workshop ID (In a real app, this might come from params or a list selection)
  // For demo purposes, we'll use a placeholder or you can pass a real ID if you have one.
  const demoWorkshopId = "workshop-123"; 

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex justify-between items-end border-b-4 border-black pb-6">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter">Staff Dashboard</h1>
            <p className="mt-2 text-xl font-bold text-gray-600">Willkommen, {user.email}</p>
          </div>
          <div className="bg-black text-white px-4 py-2 font-mono text-sm">
            ADMIN ACCESS
          </div>
        </header>

        <main className="space-y-16">
          {/* Member Management Section */}
          <section>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black uppercase flex items-center gap-3">
                <span className="w-4 h-4 bg-[#FF3100] border border-black block"></span>
                Mitgliederverwaltung
              </h2>
              <NewsletterExport />
            </div>
            
            <div className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="mb-6">
                <input 
                  type="text" 
                  placeholder="Suche nach Mitgliedern..." 
                  className="w-full border-2 border-black p-4 font-bold uppercase placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF3100]"
                />
              </div>
              <div className="text-center py-12 text-gray-500 font-bold italic border-2 border-dashed border-gray-300">
                Mitgliederliste wird geladen... (Platzhalter)
              </div>
            </div>
          </section>

          {/* Workshop Management Section */}
          <section>
            <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-3">
              <span className="w-4 h-4 bg-[#FF3100] border border-black block"></span>
              Workshop Management
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold uppercase mb-4">Pottery Masterclass (Demo)</h3>
                <WorkshopAttendance workshopId={demoWorkshopId} />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
