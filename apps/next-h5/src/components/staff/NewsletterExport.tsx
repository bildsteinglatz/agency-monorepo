'use client';

import { useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';

export function NewsletterExport() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      // Query users who have opted in to newsletter
      // Note: This assumes you have a 'newsletter' field in your users collection
      // If not, you might want to export all users or filter differently
      const q = query(collection(db, 'users'), where('newsletter', '==', true));
      const querySnapshot = await getDocs(q);
      
      const users = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          email: data.email,
          name: data.displayName || '',
          role: data.roles ? data.roles.join(',') : 'user',
          joined: data.createdAt ? new Date(data.createdAt).toLocaleDateString('de-DE') : ''
        };
      });

      if (users.length === 0) {
        alert('Keine Newsletter-Abonnenten gefunden.');
        setLoading(false);
        return;
      }

      // Convert to CSV
      const headers = ['Email', 'Name', 'Rolle', 'Beigetreten'];
      const csvContent = [
        headers.join(','),
        ...users.map(u => `${u.email},"${u.name}",${u.role},${u.joined}`)
      ].join('\n');

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `newsletter_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="bg-black text-white px-6 py-3 font-black uppercase hover:bg-[#FF3100] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {loading ? 'Exportiere...' : 'Newsletter CSV Export'}
    </button>
  );
}
