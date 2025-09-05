import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatCompleteEthiopianDate } from '@/utils/ethiopianCalendar';
import { useNotifications } from '@/hooks/useNotifications';
import { PWATest } from '@/components/PWATest';
import { PWADebugger } from '@/components/PWADebugger';
import { InstallPromptTrigger } from '@/components/InstallPromptTrigger';

interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  acceptedRequests: number;
  rejectedRequests: number;
  totalUsers: number;
  recentRequests: any[];
}

export default function AdminDashboard() {
  const { pendingCount } = useNotifications();
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
    rejectedRequests: 0,
    totalUsers: 0,
    recentRequests: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time subscription for new requests
    const channel = supabase
      .channel('admin-dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media_requests'
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch requests stats
      const { data: requests, error: requestsError } = await supabase
        .from('media_requests')
        .select('status, created_at, office_name, agenda');

      if (requestsError) throw requestsError;

      // Fetch users count
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('role', 'office');

      if (profilesError) throw profilesError;

      // Process stats
      const stats = requests?.reduce((acc, request) => {
        acc.totalRequests++;
        switch (request.status) {
          case 'pending':
            acc.pendingRequests++;
            break;
          case 'accepted':
            acc.acceptedRequests++;
            break;
          case 'rejected':
            acc.rejectedRequests++;
            break;
        }
        return acc;
      }, {
        totalRequests: 0,
        pendingRequests: 0,
        acceptedRequests: 0,
        rejectedRequests: 0,
        totalUsers: profiles?.length || 0,
        recentRequests: requests?.slice(-5) || []
      });

      setStats(stats || {
        totalRequests: 0,
        pendingRequests: 0,
        acceptedRequests: 0,
        rejectedRequests: 0,
        totalUsers: profiles?.length || 0,
        recentRequests: []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    {
      name: 'በመጠባበቅ',
      value: stats.pendingRequests,
      fill: '#f59e0b'
    },
    {
      name: 'ተቀባይነት አግኝቷል',
      value: stats.acceptedRequests,
      fill: '#10b981'
    },
    {
      name: 'ተከልክሏል',
      value: stats.rejectedRequests,
      fill: '#ef4444'
    }
  ];

  const statCards = [
    {
      title: 'ጠቅላላ ጥያቄዎች',
      value: stats.totalRequests,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'በመጠባበቅ ላይ',
      value: stats.pendingRequests,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'ተቀባይነት የአግኘ',
      value: stats.acceptedRequests,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'የተከለከሉ',
      value: stats.rejectedRequests,
      icon: XCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    },
    {
      title: 'ጽህፈት ቤቶች',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">ዳሽቦርድ</h1>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 text-warning">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{pendingCount} አዲስ ጥያቄ</span>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {loading ? '...' : stat.value}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle>የጥያቄዎች ሁኔታ</CardTitle>
              <CardDescription>
                ጥያቄዎች በሁኔታ ተከፋፍለው
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Requests */}
          <Card>
            <CardHeader>
              <CardTitle>የቅርብ ጊዜ ጥያቄዎች</CardTitle>
              <CardDescription>
                በቅርብ ጊዜ የተላኩ ጥያቄዎች
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentRequests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    የቅርብ ጊዜ ጥያቄ የለም
                  </p>
                ) : (
                  stats.recentRequests.slice(0, 5).map((request, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{request.office_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.agenda?.substring(0, 50)}...
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatCompleteEthiopianDate(request.created_at)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PWA Test Component */}
        <div className="mt-8">
          <PWATest />
        </div>

        {/* Install Prompt Trigger */}
        <div className="mt-8">
          <InstallPromptTrigger />
        </div>

        {/* PWA Debugger Component */}
        <div className="mt-8">
          <PWADebugger />
        </div>
      </div>
    </Layout>
  );
}