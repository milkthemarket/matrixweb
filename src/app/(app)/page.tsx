
import { redirect } from 'next/navigation';

export default function AppRootPage() {
  redirect('/dashboard');
  // return null; // This line is unreachable and can be removed for clarity if desired, but it doesn't harm functionality.
}
