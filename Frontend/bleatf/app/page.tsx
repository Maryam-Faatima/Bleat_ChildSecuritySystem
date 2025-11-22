import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect root path to /login
  redirect('/login');
}
