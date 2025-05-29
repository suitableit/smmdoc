"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
interface WrapperProps {
  children: React.ReactNode;
}
const ErrorSimulator = ({
  message = "An error occurred",
}: {
  message?: string;
}) => {
  const [error, setError] = useState(false);
  if (error) throw new Error(message);
  return (
    <Button
      title="Simulate an error"
      className="bg-red-300 text-red-700 rounded p-3 leading-none font-semibold text-sm hover:bg-red-600 hover:text-red-50 transition"
      onClick={() => setError(true)}
    >
      Error Simulator
    </Button>
  );
};
export const ErrorWrapper = ({ children }: WrapperProps) => {
  return (
    <div className="flex flex-col rounded-lg mt-8 relative p-4 border border-gray-300">
      <div className="absolute top-0 left-4 -translate-y-1/2">
        <ErrorSimulator message="Simulated error in root layout" />
      </div>
      {children}
    </div>
  );
};
