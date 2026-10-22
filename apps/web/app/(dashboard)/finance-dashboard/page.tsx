import { redirect } from 'next/navigation';

// Legacy role-dashboard slug — the console is now unified under /admin
// (role-adaptive). Redirect so old links/bookmarks keep working.
export default function Page() {
  redirect('/admin');
}
