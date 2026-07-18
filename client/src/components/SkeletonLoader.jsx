import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const items = Array.from({ length: count });

  if (type === 'chart') {
    return (
      <div className="glass-card rounded-2xl p-6 border border-zinc-800/50 animate-pulse w-full h-[300px] flex flex-col justify-between">
        <div className="h-6 w-1/3 bg-zinc-800 rounded mb-4"></div>
        <div className="flex items-end justify-between flex-grow h-48 gap-3">
          <div className="h-2/3 bg-zinc-800 rounded w-full"></div>
          <div className="h-4/5 bg-zinc-800 rounded w-full"></div>
          <div className="h-1/2 bg-zinc-800 rounded w-full"></div>
          <div className="h-5/6 bg-zinc-800 rounded w-full"></div>
          <div className="h-3/4 bg-zinc-800 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3 w-full">
        {items.map((_, idx) => (
          <div key={idx} className="glass-card rounded-xl p-4 border border-zinc-800/50 animate-pulse flex items-center justify-between">
            <div className="flex items-center gap-3 flex-grow">
              <div className="h-10 w-10 bg-zinc-800 rounded-full"></div>
              <div className="space-y-2 flex-grow">
                <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
                <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
              </div>
            </div>
            <div className="h-6 bg-zinc-800 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {items.map((_, idx) => (
        <div key={idx} className="glass-card rounded-2xl p-6 border border-zinc-800/50 animate-pulse space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-zinc-800 rounded w-1/3"></div>
            <div className="h-8 w-8 bg-zinc-800 rounded-full"></div>
          </div>
          <div className="h-8 bg-zinc-800 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-3 bg-zinc-800 rounded w-full"></div>
            <div className="h-3 bg-zinc-800 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
