import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserBalanceLocally: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = [
  'apriliansyahazril10@gmail.com',
  'apriliazril67@gmail.com',
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or listen to user profile in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        unsubscribeDoc = onSnapshot(
          userRef,
          async (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data() as UserProfile;
              // Check if auto-promote admin email
              const shouldBeAdmin = ADMIN_EMAILS.includes(currentUser.email?.toLowerCase() || '');
              if (shouldBeAdmin && data.role !== 'admin') {
                try {
                  await setDoc(userRef, { ...data, role: 'admin' }, { merge: true });
                } catch {
                  // ignore
                }
              }
              setUserProfile({
                ...data,
                role: shouldBeAdmin ? 'admin' : (data.role || 'user'),
              });
            } else {
              // Profile not yet created in Firestore, bootstrap it
              const isBootstrappedAdmin = ADMIN_EMAILS.includes(currentUser.email?.toLowerCase() || '');
              const newProfile: UserProfile = {
                uid: currentUser.uid,
                name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
                email: currentUser.email || '',
                balance: 0,
                role: isBootstrappedAdmin ? 'admin' : 'user',
                status: 'active',
                createdAt: new Date().toISOString(),
              };
              try {
                await setDoc(userRef, newProfile);
                setUserProfile(newProfile);
              } catch (err) {
                console.error("Failed creating user doc in Firestore:", err);
                setUserProfile(newProfile);
              }
            }
            setLoading(false);
          },
          (error) => {
            console.error("Firestore user onSnapshot error:", error);
            // Fallback profile if Firestore permission is restricted
            const isBootstrappedAdmin = ADMIN_EMAILS.includes(currentUser.email?.toLowerCase() || '');
            setUserProfile((prev) => prev || {
              uid: currentUser.uid,
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
              email: currentUser.email || '',
              balance: 0,
              role: isBootstrappedAdmin ? 'admin' : 'user',
              status: 'active',
              createdAt: new Date().toISOString(),
            });
            setLoading(false);
          }
        );
      } else {
        if (unsubscribeDoc) {
          unsubscribeDoc();
          unsubscribeDoc = null;
        }
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
    const isBootstrappedAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
    const initialProfile: UserProfile = {
      uid: cred.user.uid,
      name,
      email,
      balance: 0,
      role: isBootstrappedAdmin ? 'admin' : 'user',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'users', cred.user.uid), initialProfile);
      setUserProfile(initialProfile);
    } catch (err) {
      console.warn("Could not immediately set user in firestore:", err);
      setUserProfile(initialProfile);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const updateUserBalanceLocally = (newBalance: number) => {
    if (userProfile) {
      setUserProfile({ ...userProfile, balance: newBalance });
    }
  };

  const isAdmin = Boolean(
    userProfile?.role === 'admin' ||
    (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()))
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAdmin,
        loading,
        loginWithEmail,
        registerWithEmail,
        logout,
        updateUserBalanceLocally,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
