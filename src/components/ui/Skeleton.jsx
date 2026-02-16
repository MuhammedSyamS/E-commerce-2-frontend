import React from 'react';

const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={`animate-pulse bg-zinc-200 rounded ${className}`}
            {...props}
        />
    );
};

export { Skeleton };
