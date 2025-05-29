import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import Link from "next/link";

export default function ErrorCard() {
  return (
    <Card className="w-[400px] text-center">
      <CardHeader>Oops! Something went wrong!</CardHeader>
      <CardFooter className="flex justify-center">
        <Button asChild variant={"destructive"} className="animate-pulse">
          <Link href="/sign-in">Go back to sign in</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
