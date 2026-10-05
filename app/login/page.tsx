import { Suspense } from "react";
import LoginForm from "@/app/ui/login-form";

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
