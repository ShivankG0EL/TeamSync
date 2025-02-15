'use client'

import { useSearchParams } from 'next/navigation';
import Login from './login';

export default function LoginWrapper() {
  const searchParams = useSearchParams();
  return <Login searchParams={searchParams} />;
}
