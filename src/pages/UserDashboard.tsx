import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Stats {
  totalRequests: number;
  pendingRequests: number;
  acceptedRequests: number;
  rejectedRequests: number;
}

export default function UserDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalRequests: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
    rejectedRequests: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('media_requests')
        .select('status')
        .eq('user_id', user?.id);

      if (error) throw error;

      const stats = data.reduce((acc, request) => {
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
        rejectedRequests: 0
      });

      setStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'ጠቅላላ ጥያቄዎች',
      value: stats.totalRequests,
      icon: FileText,
      color: 'text-primary'
    },
    {
      title: 'በመጠባበቅ ላይ',
      value: stats.pendingRequests,
      icon: Clock,
      color: 'text-warning'
    },
    {
      title: 'የተቀበሉ',
      value: stats.acceptedRequests,
      icon: CheckCircle,
      color: 'text-success'
    },
    {
      title: 'የተከለከሉ',
      value: stats.rejectedRequests,
      icon: XCircle,
      color: 'text-destructive'
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">እንኳን በደህና መጡ</h1>
          <Button onClick={() => navigate('/request')}>
            አዲስ ጥያቄ ያስገቡ
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>የሚድያ ሽፋን ጠይቅ</CardTitle>
              <CardDescription>
                አዲስ የሚድያ ሽፋን ጥያቄ ያስገቡ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/request')}
                className="w-full"
              >
                አዲስ ጥያቄ ያስገቡ
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ታሪክ</CardTitle>
              <CardDescription>
                ያለፉትን ጥያቄዎች እና ሁኔታዎች ይመልከቱ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline"
                onClick={() => navigate('/history')}
                className="w-full"
              >
                ታሪክ ይመልከቱ
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}