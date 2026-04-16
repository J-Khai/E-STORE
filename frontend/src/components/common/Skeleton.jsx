import React from 'react';

// just a simple wrapper to make ghostly loading states easy
const Skeleton = ({ className, width, height, circle = false }) => {
  return (
    <div 
      className={`skeleton ${circle ? 'rounded-full' : ''} ${className}`}
      style={{ width, height }}
    />
  );
};

export default Skeleton;
