import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, FileText, Clock, CheckCircle, XCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { formatCompleteEthiopianDate } from '@/utils/ethiopianCalendar';
import { useNotifications } from '@/hooks/useNotifications';
import { isRequestExpired } from '@/utils/checkExpired';

interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  acceptedRequests: number;
  rejectedRequests: number;
  expiredRequests: number;
  totalUsers: number;
}

export default function AdminDashboard() {
  const { pendingCount } = useNotifications();
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
    rejectedRequests: 0,
    expiredRequests: 0,
    totalUsers: 0
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
        .select('status, created_at, coverage_date, office_name, agenda');

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
            // Check if pending request is expired
            if (isRequestExpired(request.coverage_date, request.status)) {
              acc.expiredRequests++;
            } else {
              acc.pendingRequests++;
            }
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
        expiredRequests: 0,
        totalUsers: profiles?.length || 0
      });

      setStats(stats || {
        totalRequests: 0,
        pendingRequests: 0,
        acceptedRequests: 0,
        rejectedRequests: 0,
        expiredRequests: 0,
        totalUsers: profiles?.length || 0
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
    },
    {
      name: 'ጊዜ አልቋል',
      value: stats.expiredRequests,
      fill: '#dc2626'
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
      title: 'ተቀባይነት ያገኘ',
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
      title: 'ጊዜ አልቋል',
      value: stats.expiredRequests,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'ጽህፈት ቤቶች',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-primary to-primary-glow',
      borderColor: 'border-primary',
      isUnique: true
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
               <Card 
                 key={index}
                 className={stat.isUnique ? `border-2 ${stat.borderColor} shadow-xl rounded-2xl overflow-hidden` : ''}
               >
                 <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-3 ${stat.isUnique ? stat.bgColor : ''}`}>
                   <CardTitle className={`text-sm font-semibold ${stat.isUnique ? 'text-white' : ''}`}>
                     {stat.title}
                   </CardTitle>
                   <div className={`p-3 rounded-xl ${stat.isUnique ? 'bg-white/20 backdrop-blur-sm' : stat.bgColor}`}>
                     <Icon className={`h-5 w-5 ${stat.color}`} />
                   </div>
                 </CardHeader>
                 <CardContent className={`${stat.isUnique ? stat.bgColor : ''} pt-0`}>
                   <div className={`text-3xl font-bold ${stat.color} ${stat.isUnique ? 'drop-shadow-sm' : ''}`}>
                     {loading ? '...' : stat.value}
                   </div>
                   {stat.isUnique && (
                     <div className="text-white/80 text-xs mt-1 font-medium">
                       አጠቃላይ ቁጥር
                     </div>
                   )}
                 </CardContent>
               </Card>
             );
           })}
         </div>

         {/* Status Chart */}
         <div className="grid grid-cols-1 gap-6">
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
         </div>

      </div>
    </Layout>
  );
}