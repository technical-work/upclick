import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import GlobalTracking from "@/components/GlobalTracking";

export const metadata = {
  title: "UpKlick",
  description: "UpKlick Creator Platform",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <GlobalTracking />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
