import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import Header from "@/components/Header";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (el: HTMLElement, config: Record<string, unknown>) => void;
        };
      };
    };
    FB?: {
      init: (config: Record<string, unknown>) => void;
      login: (callback: (response: { authResponse?: { accessToken: string } }) => void, config: Record<string, unknown>) => void;
    };
    AppleID?: {
      auth: {
        init: (config: Record<string, unknown>) => void;
        signIn: () => Promise<{ authorization: { id_token: string }; user?: { name?: { firstName?: string; lastName?: string } } }>;
      };
    };
  }
}

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    // Google One Tap / Sign In With Google
    // The token comes from the Google Identity Services library
    try {
      const tokenClient = (window as any).google?.accounts?.oauth2?.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
        scope: "email profile",
        callback: async (response: { access_token: string }) => {
          if (response.access_token) {
            await login("google", response.access_token);
            navigate("/");
          }
        },
      });
      tokenClient?.requestAccessToken();
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      window.FB?.login(
        async (response) => {
          if (response.authResponse?.accessToken) {
            await login("facebook", response.authResponse.accessToken);
            navigate("/");
          }
        },
        { scope: "email,public_profile" }
      );
    } catch (err) {
      console.error("Facebook login failed:", err);
    }
  };

  const handleAppleLogin = async () => {
    try {
      const response = await window.AppleID?.auth.signIn();
      if (response) {
        await login("apple", response.authorization.id_token, {
          user: response.user?.name
            ? {
                firstName: response.user.name.firstName || "",
                lastName: response.user.name.lastName || "",
              }
            : undefined,
        });
        navigate("/");
      }
    } catch (err) {
      console.error("Apple login failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center min-h-screen px-6 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              Play<span className="text-primary">ENG</span>
            </h1>
            <p className="text-muted-foreground">
              Jelentkezz be a tanulás folytatásához
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border border-border rounded-2xl text-foreground font-medium hover:bg-gray-50 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Bejelentkezés Google-lal
            </button>

            {/* Facebook */}
            <button
              onClick={handleFacebookLogin}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-[#1877F2] rounded-2xl text-white font-medium hover:bg-[#166FE5] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Bejelentkezés Facebookkal
            </button>

            {/* Apple */}
            <button
              onClick={handleAppleLogin}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-black rounded-2xl text-white font-medium hover:bg-gray-900 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Bejelentkezés Apple-lel
            </button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-8 leading-relaxed">
            A bejelentkezéssel elfogadod a{" "}
            <span className="underline">felhasználási feltételeket</span> és az{" "}
            <span className="underline">adatvédelmi szabályzatot</span>.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
