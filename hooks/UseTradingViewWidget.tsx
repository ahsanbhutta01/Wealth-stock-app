'use client'
import React, { useEffect, useRef, useMemo } from 'react'

const useTradingViewWidget = (scriptUrl: string, config: Record<string, unknown>, height = 600) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Memoize config to prevent unnecessary re-renders
  const memoizedConfig = useMemo(() => config, [JSON.stringify(config)]);

  useEffect(() => {
      if (!containerRef.current) return;
      if (containerRef.current.dataset.loaded) return;
      
      // Clear container first
      containerRef.current.innerHTML = '';

      const script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;
      script.innerHTML = JSON.stringify(memoizedConfig);

      containerRef.current.appendChild(script);
      containerRef.current.dataset.loaded = 'true';

      return () => {
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          delete containerRef.current.dataset.loaded;
        }
      }
    },
    [scriptUrl, memoizedConfig, height]
  );
  
  return containerRef;
}

export default useTradingViewWidget