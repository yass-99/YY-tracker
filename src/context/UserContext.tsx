import React, { createContext, useState, useEffect } from 'react';

export type User = 'yassine' | 'youssef';

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
}

export const UserContext = createContext<UserContextType>({
  user: 'yassine',
  setUser: () => {}
});

const USER_KEY = 'fitness_tracker_user';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return (stored as User) || 'yassine';
  });

  useEffect(() => {
    localStorage.setItem(USER_KEY, user);
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser: setUserState }}>
      {children}
    </UserContext.Provider>
  );
};
