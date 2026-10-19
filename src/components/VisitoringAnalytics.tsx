'use client';

import React from 'react';
import { VisitoringProvider } from 'visitoring';

const TRACKING_KEY = 'vk_SZvnhsMtDUzD_QTRw9zyjXCtvg943OHA';

export default function VisitoringAnalytics({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VisitoringProvider siteKey={TRACKING_KEY}>
      {children}
    </VisitoringProvider>
  );
}
