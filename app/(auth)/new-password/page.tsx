import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NewPasswordForm from "./new-password";

export default function page() {
  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">New Password Form</CardTitle>

          <CardDescription className="text-center">
            Enter your new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
