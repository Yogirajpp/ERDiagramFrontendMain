import { useState, useEffect } from 'react';

// Define a screen width threshold for mobile
const MOBILE_WIDTH = 768;

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_WIDTH);

    useEffect(() => {
        // Function to handle window resize
        const handleResize = () => {
            setIsMobile(window.innerWidth <= MOBILE_WIDTH);
        };

        // Add event listener for window resize
        window.addEventListener('resize', handleResize);

        // Cleanup event listener on unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return isMobile;
}
