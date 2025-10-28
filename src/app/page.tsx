/**
 * Simple Finance - Home Page
 * Redirects to dashboard
 * @module app/page
 */

import { redirect } from 'next/navigation';

/**
 * Home page - redirects to dashboard
 */
export default function Home() {
  redirect('/dashboard');
}
