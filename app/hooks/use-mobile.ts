"use client";

import { useState, useEffect } from 'react';

const MOBILE_WIDTH_THRESHOLD = 768; // Common threshold for md breakpoint

export function useIsMobile(threshold: number = MOBILE_WIDTH_THRESHOLD): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set isMobile state based on current window width
      setIsMobile(window.innerWidth < threshold);
    }

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [threshold]); // Empty array ensures that effect is only run on mount and unmount

  return isMobile;
}
