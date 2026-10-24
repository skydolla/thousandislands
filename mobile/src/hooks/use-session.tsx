import { createContext, use, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface SessionState {
  session: Session | null;
  /** False until the saved session has been read from the Keychain. */
  ready: boolean;
}

const SessionContext = createContext<SessionState>({ session: null, ready: false });

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ session: null, ready: false });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setState({ session: data.session, ready: true }));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setState({ session, ready: true }));
    return () => data.subscription.unsubscribe();
  }, []);

  return <SessionContext value={state}>{children}</SessionContext>;
}

/** The signed-in owner's session, or null. Sign-ups are disabled, so anyone signed in is the owner. */
export const useSession = () => use(SessionContext);
