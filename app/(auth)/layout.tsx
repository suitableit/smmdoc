import Footer from '@/components/frontend/footer';
import Header from '@/components/frontend/header';

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <main className="flex-center min-h-screen w-full">{children}</main>
      <Footer />
    </>
  );
}
