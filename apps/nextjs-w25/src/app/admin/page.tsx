'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, FileText, Check, X, Search, ArrowLeft 
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, getDocs, doc, getDoc, updateDoc 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGodSidebarMargin } from '@/components/GodSidebarMarginContext';

interface UserData {
  uid: string;
  email: string;
  role?: string;
  agbSigned?: boolean;
  agbSignedAt?: any;
  createdAt?: any;
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const sidebarMargin = useGodSidebarMargin();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
          fetchUsers();
        } else {
          router.push('/user-settings');
        }
      } else {
        router.push('/user-settings');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersList: UserData[] = [];
      querySnapshot.forEach((doc) => {
        usersList.push({ uid: doc.id, ...doc.data() } as UserData);
      });
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.uid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <div className="animate-pulse font-owners font-black italic text-xl uppercase">Verifying Clearance...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div 
      className="min-h-screen pt-24 px-4 pb-20"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/user-settings" className="p-2 hover:bg-foreground/10 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="font-owners font-black italic text-4xl uppercase flex items-center gap-3">
              <Shield size={32} className="text-neon-orange" />
              Admin Console
            </h1>
            <p className="text-sm opacity-70 font-mono">System Administration & User Management</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Stats */}
          <div className="lg:col-span-1 space-y-4">
            <div className="border border-foreground p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users size={20} className="opacity-70" />
                <h3 className="font-bold uppercase text-sm">Total Users</h3>
              </div>
              <div className="text-4xl font-owners font-black italic">{users.length}</div>
            </div>
            
            <div className="border border-foreground p-6">
              <div className="flex items-center gap-3 mb-2">
                <FileText size={20} className="opacity-70" />
                <h3 className="font-bold uppercase text-sm">AGB Signed</h3>
              </div>
              <div className="text-4xl font-owners font-black italic text-green-500">
                {users.filter(u => u.agbSigned).length}
              </div>
            </div>

            <div className="border border-foreground p-6">
              <div className="flex items-center gap-3 mb-2">
                <X size={20} className="opacity-70" />
                <h3 className="font-bold uppercase text-sm">Pending AGB</h3>
              </div>
              <div className="text-4xl font-owners font-black italic text-red-500">
                {users.filter(u => !u.agbSigned).length}
              </div>
            </div>
          </div>

          {/* User List */}
          <div className="lg:col-span-3">
            <div className="border border-foreground p-6 min-h-[600px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-owners font-bold italic text-xl uppercase">User Database</h3>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                  <input 
                    type="text" 
                    placeholder="Search users..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border border-foreground pl-10 pr-4 py-2 text-sm focus:outline-none focus:bg-foreground/5 w-64"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-foreground/5">
                    <tr>
                      <th className="px-4 py-3 font-bold">User / Email</th>
                      <th className="px-4 py-3 font-bold">Role</th>
                      <th className="px-4 py-3 font-bold">Joined</th>
                      <th className="px-4 py-3 font-bold">AGB Status</th>
                      <th className="px-4 py-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-foreground/10">
                    {filteredUsers.map((userData) => (
                      <tr key={userData.uid} className="hover:bg-foreground/5 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold">{userData.email}</div>
                          <div className="text-xs opacity-50 font-mono">{userData.uid.slice(0, 8)}...</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-bold uppercase ${userData.role === 'admin' ? 'bg-neon-orange text-black' : 'bg-foreground/10'}`}>
                            {userData.role || 'User'}
                          </span>
                        </td>
                        <td className="px-4 py-3 opacity-70">
                          {userData.createdAt?.seconds ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3">
                          {userData.agbSigned ? (
                            <div className="flex items-center gap-2 text-green-500">
                              <Check size={14} />
                              <span className="text-xs font-bold uppercase">Signed</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-red-500">
                              <X size={14} />
                              <span className="text-xs font-bold uppercase">Pending</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-xs font-bold uppercase hover:text-neon-orange transition-colors">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 opacity-50 uppercase text-sm">
                  No users found matching criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
