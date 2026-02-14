import React, { useEffect, useState } from 'react';
import { getAdminDashboardMetrics } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface DashboardMetrics {
    userCount: number;
    activeUserCount: number;
    matchCount: number;
    avgMatchScore: number;
}

const Dashboard = () => {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const data = await getAdminDashboardMetrics();
                setMetrics(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load metrics. Access denied.');
                // Optional: redirect to home if denied, but showing error is also fine for now
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
                    <p className="text-slate-500">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                    <p className="text-slate-500">System Overview & Metrics</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Total Users"
                        value={metrics?.userCount || 0}
                        icon="👥"
                        color="bg-blue-500"
                    />
                    <MetricCard
                        title="Active Users"
                        value={metrics?.activeUserCount || 0}
                        subtitle="Completed Onboarding"
                        icon="✨"
                        color="bg-green-500"
                    />
                    <MetricCard
                        title="Total Matches"
                        value={metrics?.matchCount || 0}
                        icon="❤️"
                        color="bg-rose-500"
                    />
                    <MetricCard
                        title="Avg Match Score"
                        value={metrics?.avgMatchScore || 0}
                        icon="📊"
                        color="bg-purple-500"
                    />
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, subtitle, icon, color }: { title: string, value: string | number, subtitle?: string, icon: string, color: string }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex items-start justify-between">
        <div>
            <p className="text-slate-400 font-medium text-sm uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">{value}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-lg ${color} bg-opacity-10 flex items-center justify-center text-2xl`}>
            {icon}
        </div>
    </div>
);

export default Dashboard;
