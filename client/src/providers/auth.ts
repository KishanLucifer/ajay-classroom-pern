import type { AuthProvider } from "@refinedev/core";
import { User, SignUpPayload } from "@/types";
import { authClient } from "@/lib/auth-client";
import { BACKEND_BASE_URL } from "@/constants";

let cachedUser: User | null = null;
let cachedUserRaw: string | null = null;
let sessionCache: { user: User | null; fetchedAt: number } | null = null;
const SESSION_CACHE_TTL_MS = 10_000;

const getCachedUser = (): User | null => {
  const raw = localStorage.getItem("user");
  if (!raw) {
    cachedUser = null;
    cachedUserRaw = null;
    return null;
  }

  if (raw === cachedUserRaw && cachedUser) {
    return cachedUser;
  }

  try {
    cachedUser = JSON.parse(raw) as User;
    cachedUserRaw = raw;
    return cachedUser;
  } catch {
    cachedUser = null;
    cachedUserRaw = null;
    return null;
  }
};

const setCachedUser = (user: User) => {
  const raw = JSON.stringify(user);
  cachedUser = user;
  cachedUserRaw = raw;
  sessionCache = {
    user,
    fetchedAt: Date.now(),
  };
  localStorage.setItem("user", raw);
};

const clearCachedUser = () => {
  cachedUser = null;
  cachedUserRaw = null;
  sessionCache = null;
  localStorage.removeItem("user");
};

const fetchSession = async (): Promise<User | null> => {
  if (
    sessionCache &&
    Date.now() - sessionCache.fetchedAt < SESSION_CACHE_TTL_MS
  ) {
    return sessionCache.user;
  }

  const response = await fetch(`${BACKEND_BASE_URL}/api/auth/get-session`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as
    | { user?: User | null; session?: unknown }
    | null;
  const user = payload?.user ?? null;
  sessionCache = {
    user,
    fetchedAt: Date.now(),
  };
  return user;
};

export const authProvider: AuthProvider = {
  register: async ({
    email,
    password,
    name,
    role,
    image,
    imageCldPubId,
  }: SignUpPayload) => {
    try {
      const { data, error } = await authClient.signUp.email({
        name,
        email,
        password,
        image,
        role,
        imageCldPubId,
      } as SignUpPayload);

      if (error) {
        return {
          success: false,
          error: {
            name: "Registration failed",
            message:
              error?.message || "Unable to create account. Please try again.",
          },
        };
      }

      // Store user data
      setCachedUser(data.user as User);

      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        error: {
          name: "Registration failed",
          message: "Unable to create account. Please try again.",
        },
      };
    }
  },
  login: async ({ email, password }) => {
    try {
      const { data, error } = await authClient.signIn.email({
        email: email,
        password: password,
      });

      if (error) {
        console.error("Login error from auth client:", error);
        return {
          success: false,
          error: {
            name: "Login failed",
            message: error?.message || "Please try again later.",
          },
        };
      }

      // Store user data
      setCachedUser(data.user as User);

      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error) {
      console.error("Login exception:", error);
      return {
        success: false,
        error: {
          name: "Login failed",
          message: "Please try again later.",
        },
      };
    }
  },
  logout: async () => {
    const { error } = await authClient.signOut();

    if (error) {
      console.error("Logout error:", error);
      return {
        success: false,
        error: {
          name: "Logout failed",
          message: "Unable to log out. Please try again.",
        },
      };
    }

    clearCachedUser();

    return {
      success: true,
      redirectTo: "/login",
    };
  },
  onError: async (error) => {
    if (error.response?.status === 401) {
      return {
        logout: true,
      };
    }

    return { error };
  },
  check: async () => {
    try {
      const sessionUser = await fetchSession();

      if (sessionUser) {
        setCachedUser(sessionUser);
        return {
          authenticated: true,
        };
      }

      clearCachedUser();
    } catch (error) {
      console.error("Session check failed:", error);
      clearCachedUser();
    }

    return {
      authenticated: false,
      logout: true,
      redirectTo: "/login",
      error: {
        name: "Unauthorized",
        message: "Check failed",
      },
    };
  },
  getPermissions: async () => {
    const parsedUser = getCachedUser();

    if (!parsedUser) return null;

    return {
      role: parsedUser.role,
    };
  },
  getIdentity: async () => {
    const parsedUser = getCachedUser();

    if (!parsedUser) return null;

    return {
      id: parsedUser.id,
      name: parsedUser.name,
      email: parsedUser.email,
      image: parsedUser.image,
      role: parsedUser.role,
      imageCldPubId: parsedUser.imageCldPubId,
    };
  },
};
