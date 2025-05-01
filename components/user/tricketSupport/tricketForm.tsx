'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DefaultValues,
  tricketSchema,
  TricketSchema,
} from '@/lib/validators/user/tricketsValidator';
import { zodResolver } from '@hookform/resolvers/zod';
import { TriangleAlert } from 'lucide-react';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';

export default function TricketForm() {
  // 1. Define your form.
  const form = useForm<TricketSchema>({
    resolver: zodResolver(tricketSchema),
    defaultValues: DefaultValues,
  });

  // 2. Define a submit handler.
  function onSubmit(values: TricketSchema) {
    console.log(values);
  }
  return (
    <Fragment>
      <Card className="w-full mx-auto max-w-6xl space-y-4 gap-0 text-wrap text-center mb-10">
        <CardHeader className="px-1">
          <CardTitle className="flex items-center gap-2 justify-center font-bold text-sm leading-5 lg:text-2xl">
            <TriangleAlert size={30} className="text-red-600" />
            Use this form to submit a ticket for order support only.
          </CardTitle>
          <CardDescription>
            <p className="text-xs pt-5 lg:text-xl text-muted-foreground">
              Only tickets for order support. Other tickets will remain
              <span className="text-red-600 font-bold"> unanswered</span> or
              <span className="text-red-600 font-bold"> closed</span> without
              respond.
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
      {/*card form */}
      <Card className="w-full mx-auto max-w-6xl space-y-4 gap-0 text-wrap">
        <CardHeader>
          <CardTitle></CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormDescription></FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea placeholder="" {...field} rows={5} />
                    </FormControl>
                    <FormDescription></FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Attach a file (optional){' '}
                      <span className="text-xs">(max 5MB)</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="file" {...field} />
                    </FormControl>
                    <FormDescription>
                      <span className="text-xs">(JPG, JPEG, PNG, PDF)</span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="w-full" type="submit">
                Submit Tricket
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </Fragment>
  );
}
