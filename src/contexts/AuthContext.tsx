import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { logger } from "../utils/logger";

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false); // A07: сброс loading при любом событии auth
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      logger.error("Ошибка входа", { email, code: error.code });
    } else {
      logger.info("Пользователь вошёл", { email });
    }
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string) => {
    // A02: Password strength validation (OWASP)
    if (password.length < 8) {
      logger.warn("Регистрация отклонена: слабый пароль", { email });
      return { error: "Пароль должен содержать минимум 8 символов" };
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      logger.warn("Регистрация отклонена: слабый пароль", { email });
      return {
        error:
          "Пароль должен содержать строчные, заглавные буквы и цифры",
      };
    }

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      logger.error("Ошибка регистрации", { email, code: error.code });
    } else {
      logger.info("Пользователь зарегистрирован", { email });
    }
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    logger.info("Пользователь вышел");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}