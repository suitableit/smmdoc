export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <main className="flex-center min-h-screen w-full">{children}</main>;
}
