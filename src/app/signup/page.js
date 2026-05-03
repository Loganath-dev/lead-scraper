import AuthPage from '@/components/AuthPage';
import { Suspense } from 'react';

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthPage type="signup" />
    </Suspense>
  );
}
