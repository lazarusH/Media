import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus } from 'lucide-react';

export default function CreateUser() {
  const [formData, setFormData] = useState({
    officeName: '',
    password: '',
    role: 'office' as 'admin' | 'office'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Generate email from office name for Supabase auth
      const generatedEmail = `${formData.officeName.toLowerCase().replace(/\s+/g, '')}@akaki.gov.et`;
      
      // Create the user with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.admin.createUser({
        email: generatedEmail,
        password: formData.password,
        user_metadata: {
          office_name: formData.officeName,
          role: formData.role
        }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Create profile entry
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            office_name: formData.officeName,
            role: formData.role
          });

        if (profileError) throw profileError;
      }

      toast({
        title: 'ተሳክቷል!',
        description: `${formData.officeName} በተሳካ ሁኔታ ተፈጥሯል።`,
      });

      navigate('/admin/users');
    } catch (error: any) {
      console.error('Error creating user:', error);
      setError('ተጠቃሚ መፍጠር አልተሳካም። እባክዎ እንደገና ይሞክሩ።');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value as 'admin' | 'office'
    }));
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <UserPlus className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">አዲስ ተጠቃሚ መፍጠር</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">አዲስ ጽህፈት ቤት ወይም አስተዳዳሪ መዝግብ</CardTitle>
            <CardDescription>
              እባክዎ አዲስ ተጠቃሚ ለመፍጠር የሚከተሉትን መረጃዎች ይሙሉ
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
                <Label htmlFor="officeName">ጽህፈት ቤት ስም</Label>
                <Input
                  id="officeName"
                  name="officeName"
                  value={formData.officeName}
                  onChange={handleInputChange}
                  placeholder="የጽህፈት ቤቱ ስም ያስገቡ"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">የይለፍ ቃል</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="ጠንካራ የይለፍ ቃል ያስገቡ"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">ሚና</Label>
                <Select value={formData.role} onValueChange={handleRoleChange} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="ምሮጥ ይመርጡ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="office">ጽህፈት ቤት</SelectItem>
                    <SelectItem value="admin">አስተዳዳሪ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/users')}
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
                      እየፈጥራ ነው...
                    </>
                  ) : (
                    'ተጠቃሚ ፍጠር'
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