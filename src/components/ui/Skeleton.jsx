import React from 'react';

const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={`animate-pulse bg-zinc-100/80 rounded-[1rem] ${className}`}
            {...props}
        />
    );
};

export { Skeleton };
