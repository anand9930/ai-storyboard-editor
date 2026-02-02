'use client';

import { createContext, useContext } from 'react';

interface ReadOnlyContextValue {
  isReadOnly: boolean;
}

export const ReadOnlyContext = createContext<ReadOnlyContextValue>({
  isReadOnly: false,
});

export const useReadOnly = () => useContext(ReadOnlyContext);
