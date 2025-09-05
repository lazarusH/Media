# የሚድያ ሽፋን አስተዳደር ሲስተም (Media Coverage Management System)

A comprehensive web application for managing media coverage requests in Ethiopian government offices. This system facilitates the submission, review, and approval of media coverage requests with full support for the Ethiopian calendar system.

## 🌟 Features

### For Office Users
- **Request Submission**: Submit media coverage requests with Ethiopian calendar support
- **Time Validation**: Smart validation ensuring requests are made before 2 PM for next-day coverage
- **Request History**: View complete history of submitted requests
- **Real-time Updates**: Live status updates for request approvals/rejections

### For Administrators
- **Dashboard Analytics**: Comprehensive overview of all requests and statistics
- **Request Management**: Review, approve, or reject pending requests
- **User Management**: Manage office accounts and permissions
- **Real-time Notifications**: Live notification system with pending request counts
- **Ethiopian Calendar Integration**: Full support for Ethiopian date and time formats

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: shadcn/ui components
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Authentication**: Supabase Auth
- **Calendar**: Custom Ethiopian calendar implementation
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Supabase account and project

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd amharic-connect-pwa
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
1. Create a new Supabase project
2. Run the following SQL commands to set up the database schema:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  office_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('office', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create media_requests table
CREATE TABLE media_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  office_name TEXT NOT NULL,
  coverage_date DATE NOT NULL,
  coverage_time TIME NOT NULL,
  location TEXT NOT NULL,
  agenda TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_requests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Media requests policies
CREATE POLICY "Users can view own requests" ON media_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own requests" ON media_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all requests" ON media_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all requests" ON media_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Add constraint for future dates only
ALTER TABLE media_requests ADD CONSTRAINT check_future_date 
CHECK (coverage_date >= CURRENT_DATE + INTERVAL '1 day');
```

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 📱 PWA Features

This application is built as a Progressive Web App (PWA) with:
- **Offline Support**: Service worker for offline functionality
- **Installable**: Can be installed on mobile devices and desktops
- **Responsive Design**: Optimized for all screen sizes
- **Fast Loading**: Optimized bundle size and caching strategies

## 🗓️ Ethiopian Calendar Integration

The system includes comprehensive Ethiopian calendar support:
- **Date Conversion**: Automatic conversion between Gregorian and Ethiopian calendars
- **Time Formatting**: Support for Ethiopian time periods (ጥዋት, ከሰዓት, ማታ)
- **Validation**: Smart validation ensuring requests follow Ethiopian time conventions
- **Display**: All dates and times displayed in Ethiopian format throughout the interface

## 🔐 User Roles

### Office Users
- Submit media coverage requests
- View request history
- Receive status notifications

### Administrators
- Review and manage all requests
- Create and manage office accounts
- Access comprehensive analytics
- Real-time notification system

## 📊 Key Features

### Request Management
- **Smart Validation**: Prevents same-day requests after 2 PM
- **Status Tracking**: Real-time status updates (Pending, Accepted, Rejected)
- **Location & Agenda**: Detailed request information capture

### Analytics Dashboard
- **Request Statistics**: Total, pending, accepted, and rejected counts
- **User Analytics**: Office-wise request distribution
- **Real-time Updates**: Live data refresh without page reload

### Notification System
- **Real-time Alerts**: Instant notifications for new requests
- **Visual Indicators**: Red badge counts for pending requests
- **Mobile Support**: Notifications work across all devices

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

## 🔄 Version History

- **v1.0.0** - Initial release with basic request management
- **v1.1.0** - Added Ethiopian calendar integration
- **v1.2.0** - Implemented real-time notifications
- **v1.3.0** - Enhanced analytics and user management

---

**Built with ❤️ for Ethiopian Government Media Management**