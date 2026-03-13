import { useLayoutEffect, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    // useLayoutEffect runs synchronously after all DOM mutations
    useLayoutEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);
    }, [pathname]);

    // Secondary backup for lazy-loaded content or late layout shifts
    useEffect(() => {
        const timeout = setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }, 10); // Reduced delay for faster response
        return () => clearTimeout(timeout);
    }, [pathname]);

    return null;
};

export default ScrollToTop;
