"use client";
import ButtonLoader from "@/components/button-loader";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { PasswordInput } from "@/components/password-input";
import Social from "@/components/social";
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
import { register } from "@/lib/actions/register";
import {
  signUpDefaultValues,
  signUpSchema,
  SignUpSchema,
} from "@/lib/validators/auth.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

export default function SignUpForm() {
  // const { push } = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const form = useForm<SignUpSchema>({
    mode: "all",
    resolver: zodResolver(signUpSchema),
    defaultValues: signUpDefaultValues,
  });
  const onSubmit: SubmitHandler<SignUpSchema> = async (values) => {
    setError("");
    setSuccess("");
    startTransition(() => {
      register(values).then((data) => {
        setError(data.error);
        setSuccess(data.message);
      });
    });
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="eg: Smm" {...field} disabled={isPending} />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage className="-mt-3" />
            </FormItem>
          )}
        />
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
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
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
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
          {isPending ? <ButtonLoader /> : "Sign Up"}
        </Button>
      </form>
      <Social />
      <div className="text-center grid grid-cols-1 pt-2 gap-2">
        <p className="text-sm">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-blue-500 hover:text-blue-700">
            Sign In
          </Link>
        </p>
      </div>
    </Form>
  );
}
