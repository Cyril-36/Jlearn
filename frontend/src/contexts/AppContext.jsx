import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [progress, setProgress] = useState({});
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    const storedProgress = JSON.parse(localStorage.getItem('progress')) || {};
    const storedBookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    setProgress(storedProgress);
    setBookmarks(storedBookmarks);
  }, []);

  useEffect(() => {
    localStorage.setItem('progress', JSON.stringify(progress));
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [progress, bookmarks]);

  return (
    <AppContext.Provider value={{ progress, setProgress, bookmarks, setBookmarks }}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppContext() {
  return useContext(AppContext);
}
