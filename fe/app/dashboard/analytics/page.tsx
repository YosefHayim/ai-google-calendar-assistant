'use client';

import { useState } from 'react';
import AnalyticsDashboard from '@/components/dashboard/analytics/AnalyticsDashboard';
import AIAllySidebar from '@/components/dashboard/shared/AIAllySidebar';

export default function AnalyticsPage() {
    const [isAllySidebarOpen, setIsAllySidebarOpen] = useState(false);

    return (
        <>
            <AnalyticsDashboard />
            <AIAllySidebar
                isOpen={isAllySidebarOpen}
                onClose={() => setIsAllySidebarOpen(false)}
                onOpen={() => setIsAllySidebarOpen(true)}
            />
        </>
    );
}