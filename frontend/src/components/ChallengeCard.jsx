import React from 'react';
import { useAppContext } from '../contexts/AppContext.jsx';
import { Link } from 'react-router-dom';

function Badge({ children }) {
  return (
    <span className="ml-2 px-1 text-xs rounded bg-accent-green text-white">
      {children}
    </span>
  );
}

function ChallengeCard({ challenge }) {
  const { progress, bookmarks, setBookmarks } = useAppContext();
  const completed = progress[challenge.id];
  const bookmarked = bookmarks.includes(challenge.id);

  const toggleBookmark = (e) => {
    e.preventDefault();
    if (bookmarked) {
      setBookmarks(bookmarks.filter((id) => id !== challenge.id));
    } else {
      setBookmarks([...bookmarks, challenge.id]);
    }
  };

  return (
    <Link
      to={`/challenge/${challenge.id}`}
      className="relative block bg-bg-secondary text-text-primary p-4 rounded border border-border-default shadow hover:border-accent-blue"
    >
      <button
        onClick={toggleBookmark}
        className="absolute top-2 right-2 text-yellow-400 text-xl"
      >
        {bookmarked ? '★' : '☆'}
      </button>
      <h2 className="text-xl font-semibold mb-2">
        {challenge?.title}
        {completed && <Badge>Done</Badge>}
      </h2>
      <p className="text-text-secondary text-sm line-clamp-3">
        {challenge?.description}
      </p>
    </Link>
  );
}

export default ChallengeCard;
