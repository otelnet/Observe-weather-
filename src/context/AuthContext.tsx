import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { LocationInfo } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  favorites: LocationInfo[];
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  addFavorite: (location: LocationInfo) => Promise<void>;
  removeFavorite: (locationId: string) => Promise<void>;
  isFavorite: (locationId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<LocationInfo[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Create/Update User Profile in Firestore
        try {
          await setDoc(doc(db, 'users', currentUser.uid), {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.error('Error saving user profile to Firestore:', err);
        }
      } else {
        setFavorites([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to User Favorites from Firestore
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }

    const favsRef = collection(db, 'users', user.uid, 'favorites');
    const unsubscribe = onSnapshot(favsRef, (snapshot) => {
      const favList: LocationInfo[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        favList.push({
          id: data.id,
          name: data.name,
          region: data.region || 'Saved',
          country: data.country || 'Custom',
          lat: data.lat,
          lon: data.lon,
          elevation: data.elevation ?? 10,
          isHKO: data.isHKO || false
        });
      });
      setFavorites(favList);
    }, (err) => {
      console.error('Error fetching favorites from Firestore:', err);
    });

    return () => unsubscribe();
  }, [user]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.code === 'auth/popup-blocked'
      ) {
        console.log('Google Sign-In popup closed or cancelled by user.');
        return;
      }
      console.error('Google Sign-in failed:', err);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const addFavorite = async (loc: LocationInfo) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'favorites', loc.id), {
        id: loc.id,
        name: loc.name,
        region: loc.region,
        country: loc.country,
        lat: loc.lat,
        lon: loc.lon,
        elevation: loc.elevation || 10,
        isHKO: loc.isHKO || false,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to add favorite to Firestore:', err);
      throw err;
    }
  };


  const removeFavorite = async (locationId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'favorites', locationId));
    } catch (err) {
      console.error('Failed to remove favorite from Firestore:', err);
      throw err;
    }
  };

  const isFavorite = (locationId: string) => {
    return favorites.some(f => f.id === locationId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        favorites,
        signInWithGoogle,
        logout,
        addFavorite,
        removeFavorite,
        isFavorite
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
