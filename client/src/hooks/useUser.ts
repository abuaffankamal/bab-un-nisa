import { User } from "@shared/schema";
import { useAuth } from "./use-auth.tsx";

interface AuthUser extends Omit<User, 'preferences'> {
  preferences?: User['preferences'] | null;
}

export function useUser() {
  const { user, isLoading, error } = useAuth();
  return { user: user as AuthUser | null, isLoading, error };
}
