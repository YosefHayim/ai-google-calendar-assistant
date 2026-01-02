'use client';

import { useState } from 'react';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import AIAllySidebar from '@/components/AIAllySidebar';

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