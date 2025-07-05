import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useAppContext } from '../contexts/AppContext.jsx';

function ProgressTracker({ total = 0 }) {
  const { progress, streak } = useAppContext();
  const completed = Object.keys(progress || {}).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-bg-secondary text-text-primary p-4 rounded border border-border-default space-y-4">
      <h3 className="text-lg font-semibold">Progress</h3>
      <div className="flex space-x-4">
        <div className="w-24">
          <CircularProgressbar
            value={percent}
            text={`${percent}%`}
            styles={buildStyles({
              pathColor: '#238636',
              textColor: '#ffffff',
              trailColor: '#30363d',
            })}
          />
          <div className="text-center text-xs mt-1">Completed</div>
        </div>
        <div className="w-24">
          <CircularProgressbar
            value={Math.min(streak, 30)}
            maxValue={30}
            text={`${streak}d`}
            styles={buildStyles({
              pathColor: '#1f6feb',
              textColor: '#ffffff',
              trailColor: '#30363d',
            })}
          />
          <div className="text-center text-xs mt-1">Streak</div>
        </div>
      </div>
    </div>
  );
}

export default ProgressTracker;
