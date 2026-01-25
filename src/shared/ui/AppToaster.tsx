'use client';

import { Toaster } from 'sonner';

export function AppToaster() {
  return (
    <Toaster
      richColors
      position="top-center"
      duration={3000}
      closeButton
      expand={true}
      visibleToasts={5}
    />
  );
}
