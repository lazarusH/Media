import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function RequestForm() {
  const [formData, setFormData] = useState({
    coverageDate: '',
    coverageTime: '',
    location: '',
    agenda: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('media_requests')
        .insert({
          user_id: user?.id,
          office_name: profile?.office_name || '',
          coverage_date: formData.coverageDate,
          coverage_time: formData.coverageTime,
          location: formData.location,
          agenda: formData.agenda
        });

      if (error) throw error;

      toast({
        title: 'ተሳክቷል!',
        description: 'የሚድያ ሽፋን ጥያቄዎ በተሳካ ሁኔታ ተልኳል።',
      });

      navigate('/history');
    } catch (error: any) {
      console.error('Error submitting request:', error);
      setError('ጥያቄውን ማስገባት አልተሳካም። እባክዎ እንደገና ይሞክሩ።');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">የሚድያ ሽፋን ጠይቅ</CardTitle>
            <CardDescription>
              እባክዎ የሚድያ ሽፋን ጥያቄዎን ለማስገባት የሚከተሉትን መረጃዎች ይሙሉ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="office_name">የሚድያ ሽፋን ጠያቂ ጽህፈት ቤት ስም</Label>
                <Input
                  id="office_name"
                  value={profile?.office_name || ''}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coverageDate">ሽፋን የሚሰጥበት ቀን</Label>
                  <Input
                    id="coverageDate"
                    name="coverageDate"
                    type="date"
                    value={formData.coverageDate}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coverageTime">ሰአት</Label>
                  <Input
                    id="coverageTime"
                    name="coverageTime"
                    type="time"
                    value={formData.coverageTime}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">ቦታ</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="የተግባሩ ቦታ"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agenda">አጀንዳ</Label>
                <Textarea
                  id="agenda"
                  name="agenda"
                  value={formData.agenda}
                  onChange={handleInputChange}
                  placeholder="የተግባሩ ዝርዝር አጀንዳ ይግለጹ..."
                  rows={4}
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/history')}
                  disabled={loading}
                  className="flex-1"
                >
                  ተመለስ
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      እየላካ ነው...
                    </>
                  ) : (
                    'ጥያቄ አስገባ'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}