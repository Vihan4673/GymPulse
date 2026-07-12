import React, { createContext, useEffect } from 'react'
import { User } from 'firebase/auth'
import { auth } from '@/firebase';

const AuthContext = createContext<{ user: User | null; loading: boolean }>({
  user: null,
  loading: true
})

const AuthProvider = ({children}:{children: React.ReactNode}) => {
    const [user, setUser] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user ?? null                                                                                                                                                                                                                                                                                                                                                                                    );
            setLoading(false);
        });
        return unsubscribe;
    }, []);

  return (
    <AuthContext.Provider value={{user, loading}}>{children}</AuthContext.Provider>
  )
}

export { AuthProvider, AuthContext }