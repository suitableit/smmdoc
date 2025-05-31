import Header from "@/components/shared/header";
import Footer from "@/components/footer";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <><Header/><main className="flex-center min-h-screen w-full">{children}</main><Footer/></>;
}