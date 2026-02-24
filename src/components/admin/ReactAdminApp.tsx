"use client"

import { Admin, Resource, Layout, AppBar, CustomRoutes, Menu } from 'react-admin';
import { lightGreenTheme } from '@/lib/admin/theme';
import { authProvider } from '@/lib/admin/authProvider';
import { dataProvider } from '@/lib/admin/dataProvider';
import { i18nProvider } from '@/lib/admin/i18nProvider';
import { Box, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';

import users from '@/components/admin/users';
import courses from '@/components/admin/courses';
import lessons from '@/components/admin/lessons';
import appcontents from '@/components/admin/content';
import aitrainings from '@/components/admin/ai';
import faqs from '@/components/admin/faq';
import { chatmessages, coursechats } from '@/components/admin/chats';
import announcements from '@/components/admin/announcements';
import consultations from '@/components/admin/consultations';
import automations from '@/components/admin/automations';
import { AiAnalytics } from '@/components/admin/automations';
import feedbacks from '@/components/admin/feedback';
import { Dashboard } from '@/components/admin/dashboard/Dashboard';
import { SystemSettings } from '@/components/admin/SystemSettings';
import { Route } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';

// Custom AppBar — light green branding
const CustomAppBar = (props: any) => (
    <AppBar {...props} elevation={0}>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', ml: 1 }}>
            <Typography variant="h6" sx={{ fontFamily: 'var(--font-spectral), serif', fontWeight: 800, letterSpacing: '-0.02em', mr: 2, color: '#114539' }}>
                Baxtli Men
            </Typography>
            <Typography variant="caption" sx={{ color: '#0a8069', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Boshqaruv paneli
            </Typography>
        </Box>
    </AppBar>
);

const CustomLayout = (props: any) => (
    <Layout {...props} appBar={CustomAppBar} menu={CustomMenu} />
);

// Custom Menu with Dashboard and Settings links
const CustomMenu = (props: any) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isDashboardActive = location.pathname === '/' || location.pathname === '';
    const isSettingsActive = location.pathname.includes('/system-settings');
    return (
        <Menu {...props}>
            <Menu.Item
                to="/"
                primaryText="📊 Dashboard"
                leftIcon={<DashboardIcon />}
                onClick={() => navigate('/')}
                selected={isDashboardActive}
            />
            <Menu.ResourceItems />
            <Menu.Item
                to="/system-settings"
                primaryText="⚙️ Sozlamalar"
                leftIcon={<SettingsIcon />}
                onClick={() => navigate('/system-settings')}
                selected={isSettingsActive}
            />
        </Menu>
    );
};

export const ReactAdminApp = () => (
    <Admin
        dashboard={Dashboard}
        dataProvider={dataProvider}
        authProvider={authProvider}
        theme={lightGreenTheme}
        i18nProvider={i18nProvider}
        layout={CustomLayout}
        requireAuth
    >
        <Resource name="users" {...users} options={{ label: 'Foydalanuvchilar' }} />
        <Resource name="courses" {...courses} options={{ label: 'Kurslar' }} />
        <Resource name="lessons" {...lessons} options={{ label: 'Darslar' }} />
        <Resource name="consultations" {...consultations} options={{ label: 'Konsultatsiyalar' }} />
        <Resource name="announcements" {...announcements} options={{ label: "E'lonlar" }} />
        <Resource name="feedbacks" {...feedbacks} options={{ label: 'Fikr-mulohazalar' }} />
        <Resource name="appcontents" {...appcontents} options={{ label: 'Kontent' }} />
        <Resource name="aitrainings" {...aitrainings} options={{ label: 'AI sozlamalar' }} />
        <Resource name="faqs" {...faqs} options={{ label: 'Savol-javoblar' }} />
        <Resource name="chatmessages" {...chatmessages} options={{ label: 'Xabarlar' }} />
        <Resource name="coursechats" {...coursechats} options={{ label: 'Kurs chatlari' }} />
        <Resource name="automations" {...automations} options={{ label: 'Avtomatizatsiya' }} />
        <Resource name="triggers" />
        <Resource name="automationsteps" />
        <Resource name="userautomationqueue" />
        <Resource name="purchases" />
        <Resource name="subscriptions" />
        <Resource name="modules" />
        <CustomRoutes>
            <Route path="/ai-analytics" element={<AiAnalytics />} />
            <Route path="/system-settings" element={<SystemSettings />} />
        </CustomRoutes>
    </Admin>
);
