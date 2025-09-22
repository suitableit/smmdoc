'use client';

export default function DatabaseErrorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="database-error-layout">
      {children}
    </div>
  );
}