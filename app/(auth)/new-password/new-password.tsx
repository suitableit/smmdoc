"use client";
import ButtonLoader from "@/components/button-loader";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { newPasswordValues } from "@/lib/actions/newPassword";
import {
  newPasswordDefaultValues,
  newPasswordSchema,
  NewPasswordSchema,
} from "@/lib/validators/auth.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

export default function NewPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const form = useForm<NewPasswordSchema>({
    mode: "all",
    resolver: zodResolver(newPasswordSchema),
    defaultValues: newPasswordDefaultValues,
  });
  const onSubmit: SubmitHandler<NewPasswordSchema> = async (values) => {
    setError("");
    setSuccess("");
    startTransition(() => {
      newPasswordValues(values, token).then((data) => {
        setError(data?.error);
        setSuccess(data?.message);
      });
    });
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Passowd</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="e.g: ********"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage className="-mt-3" />
            </FormItem>
          )}
        />
        <FormError message={error} />
        <FormSuccess message={success} />
        <Button
          disabled={isPending}
          className="w-full inline-flex items-center cursor-pointer"
          type="submit"
        >
          {isPending ? <ButtonLoader /> : "Reset Password"}
        </Button>
      </form>
      <div className="text-center grid grid-cols-1 pt-2 gap-2">
        <Button size="sm" variant="link" className="px-0 font-normal" asChild>
          <Link href="/sign-in" className="text-blue-500 hover:text-blue-700">
            Back to login
          </Link>
        </Button>
      </div>
    </Form>
  );
}
