import AdminTabView from '@/components/dashboard/AdminTabView';

// /admin — the console overview. With no <tab> segment, AdminTabView renders the
// default (DashboardView), which is role-adaptive so each role lands on its home.
export default function Page() {
  return <AdminTabView />;
}
