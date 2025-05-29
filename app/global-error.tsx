"use client";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { handleError } from "@/lib/utils";
import Image from "next/image";

interface ErrorProps {
  error: Error;
}
export default function GlobalError({ error }: ErrorProps) {
  useEffect(() => {
    handleError(error);
  }, [error]);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Image
        src="/next.svg"
        alt={`${APP_NAME} logo`}
        height={100}
        width={100}
        priority={true}
      />
      <div className="p-6 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-destructive">{error.message}</p>
        <Button
          className="mt-4 ml-2"
          onClick={() => (window.location.href = "/")}
        >
          Back to the home page
        </Button>
        <Button className="mt-4 ml-2" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>
    </div>
  );
}
