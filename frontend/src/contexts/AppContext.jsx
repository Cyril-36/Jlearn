import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [progress, setProgress] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('progress') || '{}');
    } catch {
      return {};
    }
  });
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bookmarks') || '[]');
    } catch {
      return [];
    }
  });
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('history') || '[]');
    } catch {
      return [];
    }
  });
  const [streak, setStreak] = useState(() => {
    const val = localStorage.getItem('streak');
    return val ? parseInt(val, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('progress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('streak', String(streak));
  }, [streak]);

  const value = {
    progress,
    setProgress,
    history,
    setHistory,
    streak,
    setStreak,
    bookmarks,
    setBookmarks,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppContext = () => useContext(AppContext);
