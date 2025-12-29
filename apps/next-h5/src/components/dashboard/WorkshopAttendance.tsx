'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface Booking {
  id: string;
  name: string;
  email: string;
  paymentStatus?: 'paid' | 'pending';
  status: string;
  timestamp: any;
}

interface WorkshopAttendanceProps {
  workshopId: string;
}

export function WorkshopAttendance({ workshopId }: WorkshopAttendanceProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Query bookings where eventId matches the Sanity workshop ID
    const q = query(
      collection(db, 'bookings'),
      where('eventId', '==', workshopId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Booking[];
      
      // Sort client-side to avoid needing a composite index immediately
      bookingsData.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      
      setBookings(bookingsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [workshopId]);

  const togglePayment = async (bookingId: string, currentStatus: string | undefined) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    const bookingRef = doc(db, 'bookings', bookingId);
    
    try {
      await updateDoc(bookingRef, {
        paymentStatus: newStatus
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status');
    }
  };

  if (loading) {
    return <div className="p-8 font-bold uppercase animate-pulse">Lade Teilnehmerliste...</div>;
  }

  return (
    <div className="w-full bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
      <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
        <h3 className="text-2xl font-black uppercase">Teilnehmerliste</h3>
        <div className="bg-black text-white px-4 py-1 font-bold uppercase text-sm">
          Gesamt: {bookings.length}
        </div>
      </div>

      {bookings.length === 0 ? (
        <p className="text-gray-500 italic font-bold">Keine Anmeldungen gefunden.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="py-3 px-4 font-black uppercase text-sm tracking-wider">Name</th>
                <th className="py-3 px-4 font-black uppercase text-sm tracking-wider">E-Mail</th>
                <th className="py-3 px-4 font-black uppercase text-sm tracking-wider">Status</th>
                <th className="py-3 px-4 font-black uppercase text-sm tracking-wider text-right">Bezahlung</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black/10">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4 font-bold">{booking.name}</td>
                  <td className="py-4 px-4 font-mono text-sm">{booking.email}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-2 py-1 text-xs font-black uppercase border border-black ${
                      booking.status === 'confirmed' ? 'bg-green-200' : 'bg-yellow-200'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => togglePayment(booking.id, booking.paymentStatus)}
                      className={`
                        relative inline-flex h-6 w-11 items-center border-2 border-black transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
                        ${booking.paymentStatus === 'paid' ? 'bg-[#FF3100]' : 'bg-gray-200'}
                      `}
                    >
                      <span
                        className={`
                          inline-block h-3 w-3 transform bg-black transition-transform
                          ${booking.paymentStatus === 'paid' ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                    <span className="ml-2 text-xs font-bold uppercase w-16 inline-block text-center">
                      {booking.paymentStatus === 'paid' ? 'BEZAHLT' : 'OFFEN'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
