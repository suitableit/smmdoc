import Header from '@/components/dashboard/header';
import SideBar from '@/components/dashboard/sideBar';

export default function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <div className="flex h-screen pt-[64px]">
        <SideBar />
        <main className="w-full">
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">{children}</div>
        </main>
      </div>
    </>
  );
}
