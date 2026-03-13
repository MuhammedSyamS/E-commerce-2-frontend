import { lazy } from 'react';

/**
 * A wrapper for React.lazy that handles "Failed to fetch dynamically imported module" errors.
 * It will attempt to reload the page once if the module fails to load, which usually
 * happens when a new version of the app is deployed and old chunks are removed.
 */
export const lazyWithRetry = (componentImport) =>
    lazy(async () => {
        const pageHasAlreadyBeenReloaded = JSON.parse(
            window.sessionStorage.getItem('page-has-been-reloaded') || 'false'
        );

        try {
            const component = await componentImport();
            window.sessionStorage.setItem('page-has-been-reloaded', 'false');
            return component;
        } catch (error) {
            if (!pageHasAlreadyBeenReloaded) {
                // Attempt to reload the page once
                window.sessionStorage.setItem('page-has-been-reloaded', 'true');
                window.location.reload();
                return; // Return empty to allow reload to happen
            }

            // If we already reloaded and it still fails, throw the error
            throw error;
        }
    });
