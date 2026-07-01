import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "UpKlick",
  description: "UpKlick Creator Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
