import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Users, Calendar, Eye, Bell } from 'lucide-react';
import { formatCompleteEthiopianDate } from '@/utils/ethiopianCalendar';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  office_name: string;
  role: string;
  created_at: string;
  user_id: string;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    setupRealtimeSubscription();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'ስህተት',
        description: 'ተጠቃሚዎችን በማምጣት ላይ ችግር ተፈጥሮአል',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('admin-users-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profile update:', payload);
          // Refresh the users list
          fetchUsers();
          
          // Show notification for new users
          if (payload.eventType === 'INSERT') {
            toast({
              title: 'አዲስ ተጠቃሚ',
              description: `${payload.new.office_name} ተቀላቅሏል`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleViewDetails = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">ጽህፈት ቤቶች</h1>
          <Badge variant="outline">
            ጠቅላላ: {profiles.length}
          </Badge>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <Card key={profile.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {profile.office_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    ተቀላቀለ: {formatCompleteEthiopianDate(profile.created_at)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                      {profile.role === 'admin' ? 'አስተዳዳሪ' : 'ጽህፈት ቤት'}
                    </Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleViewDetails(profile.user_id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    ዝርዝር ይመልከቱ
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}