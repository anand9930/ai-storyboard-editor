import { useState, useEffect, RefObject } from 'react';

const COLUMN_GUTTER = 16; // 16px for better visual separation
const MOBILE_BREAKPOINT = 768;

export function useResponsiveMasonry(containerRef: RefObject<HTMLElement | null>) {
  const [columnConfig, setColumnConfig] = useState({ columnWidth: 280, columnCount: 4 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const container = containerRef.current;
    if (!container) return;

    const updateColumnConfig = () => {
      const containerWidth = container.offsetWidth;
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      const targetColumns = isMobile ? 2 : 4;

      // Masonic formula: columns = floor((width + gutter) / (colWidth + gutter))
      // Solve for colWidth to guarantee targetColumns:
      // colWidth = ((width + gutter) / targetColumns) - gutter
      const columnWidth = Math.floor(
        (containerWidth + COLUMN_GUTTER) / targetColumns - COLUMN_GUTTER
      );

      setColumnConfig({ columnWidth, columnCount: targetColumns });
    };

    const resizeObserver = new ResizeObserver(updateColumnConfig);
    resizeObserver.observe(container);
    updateColumnConfig();

    return () => resizeObserver.disconnect();
  }, [containerRef]);

  return { ...columnConfig, gutter: COLUMN_GUTTER };
}
