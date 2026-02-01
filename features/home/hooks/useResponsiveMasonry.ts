import { useState, useEffect, RefObject } from 'react';

const DESKTOP_GUTTER = 24;
const MOBILE_GUTTER = 16;
const MOBILE_BREAKPOINT = 768;

export function useResponsiveMasonry(containerRef: RefObject<HTMLElement | null>) {
  const [columnConfig, setColumnConfig] = useState({ columnWidth: 280, columnCount: 4, gutter: DESKTOP_GUTTER });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const container = containerRef.current;
    if (!container) return;

    const updateColumnConfig = () => {
      const containerWidth = container.offsetWidth;
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      const targetColumns = isMobile ? 2 : 4;
      const gutter = isMobile ? MOBILE_GUTTER : DESKTOP_GUTTER;

      // Masonic formula: columns = floor((width + gutter) / (colWidth + gutter))
      // Solve for colWidth to guarantee targetColumns:
      // colWidth = ((width + gutter) / targetColumns) - gutter
      const columnWidth = Math.floor(
        (containerWidth + gutter) / targetColumns - gutter
      );

      setColumnConfig({ columnWidth, columnCount: targetColumns, gutter });
    };

    const resizeObserver = new ResizeObserver(updateColumnConfig);
    resizeObserver.observe(container);
    updateColumnConfig();

    return () => resizeObserver.disconnect();
  }, [containerRef]);

  return columnConfig;
}
