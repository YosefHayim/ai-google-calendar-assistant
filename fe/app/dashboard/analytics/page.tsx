'use client';

import { useState } from 'react';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import AIAllySidebar from '@/components/AIAllySidebar';

export default function AnalyticsPage() {
    const [isAllySidebarOpen, setIsAllySidebarOpen] = useState(true);

    return (
        <>
            <AnalyticsDashboard />
            <AIAllySidebar isOpen={isAllySidebarOpen} onClose={() => setIsAllySidebarOpen(false)} />
        </>
    );
}