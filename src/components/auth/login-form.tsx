"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginSchema, type LoginFormValues } from "@/lib/schemas";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useState } from "react";
import { Loader2, UserCheck } from "lucide-react";

export function LoginForm() {
  const { login, users, switchUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    const success = await login(values.email, values.password);
    if (success) {
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }

  const handleQuickLogin = (userId: string) => {
    switchUser(userId);
    toast({
      title: "Login Successful",
      description: "Welcome back!",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary">FICA Flow</CardTitle>
          <CardDescription className="text-center">
            Sign in to manage your FICA onboarding.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
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
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </Form>
          <p className="mt-6 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Register here
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Development Quick Login */}
      <Card className="w-full max-w-md shadow-xl border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-lg text-center text-yellow-800">Development Mode</CardTitle>
          <CardDescription className="text-center text-yellow-700">
            Quick login as test users (no password required)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.map((user) => (
              <Button
                key={user.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleQuickLogin(user.id)}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                {user.name} ({user.role})
                <span className="ml-auto text-xs text-muted-foreground">{user.email}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}