import { Suspense } from 'react';
import LoginWrapper from '../components/LoginWrapper';

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginWrapper />
    </Suspense>
  );
}
