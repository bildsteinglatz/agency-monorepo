import { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export function useCollection() {
  const [collection, setCollection] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Clean up previous doc listener if any
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = null;
      }

      if (user) {
        setUserId(user.uid);
        // Subscribe to real-time updates of the user's collection
        unsubDoc = onSnapshot(doc(db, 'users', user.uid), 
          (doc) => {
            if (doc.exists()) {
              setCollection(doc.data().collection || []);
            }
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching collection:", error);
            setLoading(false);
          }
        );
      } else {
        setUserId(null);
        setCollection([]);
        setLoading(false);
      }
    });

    return () => {
      if (unsubDoc) unsubDoc();
      unsubscribeAuth();
    };
  }, []);

  const addToCollection = async (artworkId: string) => {
    if (!userId) return; // Or trigger login modal
    try {
      await updateDoc(doc(db, 'users', userId), {
        collection: arrayUnion(artworkId)
      });
    } catch (error) {
      console.error("Error adding to collection:", error);
    }
  };

  const removeFromCollection = async (artworkId: string) => {
    if (!userId) return;
    try {
      await updateDoc(doc(db, 'users', userId), {
        collection: arrayRemove(artworkId)
      });
    } catch (error) {
      console.error("Error removing from collection:", error);
    }
  };

  const isCollected = (artworkId: string) => collection.includes(artworkId);

  return { collection, addToCollection, removeFromCollection, isCollected, loading, userId };
}
