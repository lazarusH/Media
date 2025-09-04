import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, User, Calendar, Activity, MapPin, Clock, FileText } from 'lucide-react';
import { formatCompleteEthiopianDate, formatEthiopianTime } from '@/utils/ethiopianCalendar';

interface Profile {
  id: string;
  office_name: string;
  role: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface MediaRequest {
  id: string;
  coverage_date: string;
  coverage_time: string;
  location: string;
  agenda: string;
  status: string;
  admin_reason?: string;
  created_at: string;
  reviewed_at?: string;
}

export default function AdminUserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [requests, setRequests] = useState<MediaRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch user's media requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('media_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;
      setRequests(requestsData || []);
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'በመጠባበቅ ላይ';
      case 'approved':
        return 'ተቀባይነት አግኝቷል';
      case 'rejected':
        return 'ውድቅ ሆኗል';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/admin/users')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              ተመለስ
            </Button>
            <h1 className="text-3xl font-bold">ተጠቃሚ አልተገኘም</h1>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/users')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            ተመለስ
          </Button>
          <h1 className="text-3xl font-bold">የተጠቃሚ ዝርዝር</h1>
        </div>

        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              የተጠቃሚ መረጃ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">የጽህፈት ቤት ስም</label>
                <p className="text-lg font-semibold">{profile.office_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">ሚና</label>
                <div className="mt-1">
                  <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                    {profile.role === 'admin' ? 'አስተዳዳሪ' : 'ጽህፈት ቤት'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">የተቀላቀለበት ቀን</label>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatCompleteEthiopianDate(profile.created_at)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">የመጨረሻ ማሻሻያ</label>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatCompleteEthiopianDate(profile.updated_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              የእንቅስቃሴ ማጠቃለያ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{requests.length}</div>
                <div className="text-sm text-muted-foreground">ጠቅላላ ጥያቄዎች</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {requests.filter(r => r.status === 'pending').length}
                </div>
                <div className="text-sm text-muted-foreground">በመጠባበቅ ላይ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {requests.filter(r => r.status === 'approved').length}
                </div>
                <div className="text-sm text-muted-foreground">ተቀባይነት ያገኙ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {requests.filter(r => r.status === 'rejected').length}
                </div>
                <div className="text-sm text-muted-foreground">ውድቅ የሆኑ</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              የሚዲያ ሽፋን ጥያቄዎች
            </CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">ምንም የሚዲያ ሽፋን ጥያቄ አልተገኘም</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <Card key={request.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getStatusBadgeVariant(request.status)}>
                              {getStatusText(request.status)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                ሽፋን የሚሰጥበት ቀን: {formatCompleteEthiopianDate(request.coverage_date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                ሰዓት: {formatEthiopianTime(request.coverage_time)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">ቦታ: {request.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                የቀረበበት ቀን: {formatCompleteEthiopianDate(request.created_at)}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <label className="text-sm font-medium text-muted-foreground">አጀንዳ:</label>
                            <p className="text-sm mt-1">{request.agenda}</p>
                          </div>
                          {request.admin_reason && (
                            <div className="mt-3 p-3 bg-muted rounded-md">
                              <label className="text-sm font-medium text-muted-foreground">
                                የአስተዳዳሪ አስተያየት:
                              </label>
                              <p className="text-sm mt-1">{request.admin_reason}</p>
                            </div>
                          )}
                          {request.reviewed_at && (
                            <div className="mt-2">
                              <span className="text-xs text-muted-foreground">
                                የተገመገመበት ቀን: {formatCompleteEthiopianDate(request.reviewed_at)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}