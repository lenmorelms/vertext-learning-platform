import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      {/* Clerk reads the URL, which is request data under cacheComponents. */}
      <Suspense fallback={null}>
        <SignUp />
      </Suspense>
    </div>
  );
}
