import React, { useEffect, useRef, useState } from 'react';

const Reveal = ({ children, width = "fit-content", delay = 0.2 }) => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Safety fallback to ensure content is eventually shown
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 1000);

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    clearTimeout(timer);
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => {
            clearTimeout(timer);
            if (ref.current) observer.unobserve(ref.current);
        };
    }, []);

    return (
        <div
            ref={ref}
            className={`transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                }`}
            style={{ width, transitionDelay: `${delay}s` }}
        >
            {children}
        </div>
    );
};

export default Reveal;
