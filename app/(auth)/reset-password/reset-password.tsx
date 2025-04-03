"use client";
import ButtonLoader from "@/components/button-loader";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
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
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/lib/actions/reset";
import {
  resetSchema,
  ResetSchema,
  signInDefaultValues,
} from "@/lib/validators/auth.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

export default function ResetForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const form = useForm<ResetSchema>({
    mode: "all",
    resolver: zodResolver(resetSchema),
    defaultValues: signInDefaultValues,
  });
  const onSubmit: SubmitHandler<ResetSchema> = async (values) => {
    setError("");
    setSuccess("");
    startTransition(() => {
      resetPassword(values).then((data) => {
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="eg: smm@gmail.com"
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
          {isPending ? <ButtonLoader /> : "Reset send email"}
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
