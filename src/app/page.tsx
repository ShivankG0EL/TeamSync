'use client'

import { useSearchParams } from 'next/navigation';
import Login from '../components/main/login';

export default function LoginPage() {
  const searchParams = useSearchParams();
  return <Login searchParams={searchParams} />;
}
