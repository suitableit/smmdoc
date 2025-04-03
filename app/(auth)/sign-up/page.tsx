import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import SignUpForm from "./signup-form";

export default function page() {
  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader>
          <div className="flex justify-center gap-5 items-center">
            <Link
              href="/sign-in"
              className="cursor-pointer animate-pulse duration-1000 hover:bg-amber-500 hover:bg-opacity-10 p-1 rounded-full"
            >
              <ArrowLeft size={28} />
            </Link>
            <CardTitle className="text-center">Sign Up</CardTitle>
          </div>
          <CardDescription className="text-center">
            Enter your details below to sign up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
      </Card>
    </div>
  );
}
