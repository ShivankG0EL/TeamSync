'use client'

import { useSearchParams } from 'next/navigation';
import Login from './login';

export default function LoginPage() {
  const searchParams = useSearchParams();
  return <Login searchParams={searchParams} />;
}
