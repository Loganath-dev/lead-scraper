import AuthPage from '@/components/AuthPage';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthPage type="login" />
    </Suspense>
  );
}
