"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthTest() {
  const { data: session } = useSession();

  if (!session) {
    return <button onClick={() => signIn("google")}>Sign in</button>;
  }

  return (
    <div>
      <p>{session.user?.email}</p>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}