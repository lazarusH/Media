import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { FileText, Users, BarChart3 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="bg-primary/10 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-primary">
              የሚድያ ሽፋን አስተዳደር
            </h1>
            <Button onClick={() => navigate('/login')}>
              ግባ
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            የሚድያ ሽፋን አስተዳደር ስርዓት
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            ለጽህፈት ቤቶች የሚድያ ሽፋን ጥያቄዎችን ለማስገባት እና ለማስተዳደር የተዘጋጀ ሙሉ ስርዓት
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/login')}
            className="text-lg px-8 py-3"
          >
            ስርዓቱን ይጀምሩ
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>የሚድያ ሽፋን ጥያቄ</CardTitle>
              <CardDescription>
                ጽህፈት ቤቶች የሚድያ ሽፋን ጥያቄዎችን በቀላሉ ማስገባት ይችላሉ
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>አስተዳዳሪ ክፍል</CardTitle>
              <CardDescription>
                አስተዳዳሪዎች ጥያቄዎችን መመልከት እና ማስተዳደር ይችላሉ
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>ዳሽቦርድ</CardTitle>
              <CardDescription>
                የሚድያ ሽፋን ጥያቄዎችን እና ስታቲስቲክስን በቀላሉ መከታተል
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>ዛሬ ይጀመሩ</CardTitle>
              <CardDescription>
                የሚድያ ሽፋን አስተዳደር ስርዓቱን ለመጠቀም ይግቡ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => navigate('/login')}
              >
                ግባ
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 የሚድያ ሽፋን አስተዳደር ስርዓት። ሁሉም መብቶች የተጠበቁ ናቸው።</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;