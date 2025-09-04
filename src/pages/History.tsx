import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Clock, CheckCircle, XCircle, Calendar, MapPin, FileText } from 'lucide-react';
import { formatCompleteEthiopianDate, formatEthiopianTime } from '@/utils/ethiopianCalendar';

interface MediaRequest {
  id: string;
  office_name: string;
  coverage_date: string;
  coverage_time: string;
  location: string;
  agenda: string;
  status: 'pending' | 'accepted' | 'rejected';
  admin_reason?: string;
  created_at: string;
  reviewed_at?: string;
}

export default function History() {
  const [requests, setRequests] = useState<MediaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchRequests();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('media-requests-user')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'media_requests',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchRequests();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('media_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data || []) as MediaRequest[]);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'በመጠባበቅ ላይ';
      case 'accepted':
        return 'ተቀባይነት አግኝቷል';
      case 'rejected':
        return 'ተከልክሏል';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('am-ET', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('am-ET', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>እየተጫን ነው...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">ታሪክ</h1>
          <Badge variant="outline">
            ጠቅላላ: {requests.length}
          </Badge>
        </div>

        {requests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">ምንም ጥያቄ አልተገኘም</h3>
              <p className="text-muted-foreground text-center">
                እስካሁን ድረስ የሚድያ ሽፋን ጥያቄ አላስገቡም።
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {request.office_name}
                    </CardTitle>
                    <Badge
                      variant={getStatusVariant(request.status)}
                      className="flex items-center gap-1"
                    >
                      {getStatusIcon(request.status)}
                      {getStatusText(request.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        ሽፋን የሚሰጥበት ቀን: {formatCompleteEthiopianDate(request.coverage_date)} - {formatEthiopianTime(request.coverage_time)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{request.location}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">አጀንዳ:</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                      {request.agenda}
                    </p>
                  </div>

                  {request.status === 'rejected' && request.admin_reason && (
                    <div>
                      <h4 className="font-medium mb-2 text-destructive">የውድቀት ምክንያት:</h4>
                      <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                        {request.admin_reason}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    ተላከ: {formatCompleteEthiopianDate(request.created_at)}
                    {request.reviewed_at && (
                      <span className="ml-4">
                        ተመለከተ: {formatCompleteEthiopianDate(request.reviewed_at)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}