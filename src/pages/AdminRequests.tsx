import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, Clock, Eye, Check, X, Loader2 } from 'lucide-react';

interface MediaRequest {
  id: string;
  user_id: string;
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

export default function AdminRequests() {
  const [requests, setRequests] = useState<MediaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<MediaRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('admin-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media_requests'
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('media_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data || []) as MediaRequest[]);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      const { error } = await supabase
        .from('media_requests')
        .update({
          status: 'accepted',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'ተሳክቷል!',
        description: 'ጥያቄው ተቀባይነት አግኝቷል።',
      });
    } catch (error) {
      toast({
        title: 'ስህተት!',
        description: 'ጥያቄውን መቀበል አልተሳካም።',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: string, reason: string) => {
    setActionLoading(requestId);
    try {
      const { error } = await supabase
        .from('media_requests')
        .update({
          status: 'rejected',
          admin_reason: reason,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'ተሳክቷል!',
        description: 'ጥያቄው ተከልክሏል።',
      });
      
      setShowRejectDialog(false);
      setRejectReason('');
      setSelectedRequest(null);
    } catch (error) {
      toast({
        title: 'ስህተት!',
        description: 'ጥያቄውን መከልከል አልተሳካም።',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectDialog = (request: MediaRequest) => {
    setSelectedRequest(request);
    setShowRejectDialog(true);
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

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const reviewedRequests = requests.filter(r => r.status !== 'pending');

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
          <h1 className="text-3xl font-bold">ሽፋን ጠያቂ</h1>
          <div className="flex gap-2">
            <Badge variant="outline">
              አዲስ: {pendingRequests.length}
            </Badge>
            <Badge variant="outline">
              ጠቅላላ: {requests.length}
            </Badge>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-warning">አዲስ ጥያቄዎች</h2>
            {pendingRequests.map((request) => (
              <Card key={request.id} className="border-warning/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {request.office_name}
                    </CardTitle>
                    <Badge variant={getStatusVariant(request.status)}>
                      {getStatusText(request.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {formatDate(request.coverage_date)} - {formatTime(request.coverage_time)}
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

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleAccept(request.id)}
                      disabled={actionLoading === request.id}
                      className="bg-success hover:bg-success/90"
                    >
                      {actionLoading === request.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 mr-1" />
                      )}
                      ተቀበል
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openRejectDialog(request)}
                      disabled={actionLoading === request.id}
                    >
                      <X className="h-4 w-4 mr-1" />
                      ውድቅ አድርግ
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    ተላከ: {formatDate(request.created_at)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Reviewed Requests */}
        {reviewedRequests.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">የተመለከቱ ጥያቄዎች</h2>
            {reviewedRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {request.office_name}
                    </CardTitle>
                    <Badge variant={getStatusVariant(request.status)}>
                      {getStatusText(request.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {formatDate(request.coverage_date)} - {formatTime(request.coverage_time)}
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
                    ተላከ: {formatDate(request.created_at)}
                    {request.reviewed_at && (
                      <span className="ml-4">
                        ተመለከተ: {formatDate(request.reviewed_at)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {requests.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Eye className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">ምንም ጥያቄ አልተገኘም</h3>
              <p className="text-muted-foreground text-center">
                እስካሁን ድረስ የሚድያ ሽፋን ጥያቄ አልተገኘም።
              </p>
            </CardContent>
          </Card>
        )}

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ጥያቄ ውድቅ አድርግ</DialogTitle>
              <DialogDescription>
                እባክዎ የውድቀት ምክንያት ይግለጹ
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="የውድቀት ምክንያት ይጻፉ..."
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReason('');
                  setSelectedRequest(null);
                }}
              >
                ተመለስ
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedRequest && handleReject(selectedRequest.id, rejectReason)}
                disabled={!rejectReason.trim() || actionLoading === selectedRequest?.id}
              >
                {actionLoading === selectedRequest?.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'ውድቅ አድርግ'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}