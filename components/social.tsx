import { DEFAULT_SIGN_IN_REDIRECT } from "@/lib/routes";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "./ui/button";

export default function Social() {
  const handleClick = async (provider: "google") => {
    await signIn(provider, { callbackUrl: DEFAULT_SIGN_IN_REDIRECT });
  };
  return (
    <div className="mt-2 w-full mb-1">
      <Button
        size="lg"
        className="w-full cursor-pointer"
        variant="outline"
        onClick={() => {
          handleClick("google");
        }}
      >
        <FcGoogle className="h-8 w-8" />
      </Button>
    </div>
  );
}
