"use client";

import { motion } from "framer-motion";
import { useForm } from "@tanstack/react-form";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { RippleButton } from "@/components/ui/ripple-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";

type RegisterForm = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
};

export default function RegisterPage() {
  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    } as RegisterForm,
    onSubmit: async ({ value }) => {
      console.log("Register form submitted:", value);
      // TODO: Connect to your backend API
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container relative flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 flex-1">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Logo size="md" animated={false} />
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">"The best calendar assistant I've ever used. It understands my schedule and makes intelligent suggestions."</p>
              <footer className="text-sm">Michael Chen, Software Engineer</footer>
            </blockquote>
          </div>
        </div>

        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex flex-col space-y-2 text-center mb-6">
                <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
                <p className="text-sm text-muted-foreground">Enter your information to get started</p>
              </div>

              <div className="space-y-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                  }}
                  className="space-y-4"
                >
                  <form.Field
                    name="fullName"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value) return "Full name is required";
                        if (value.length < 2) {
                          return "Name must be at least 2 characters";
                        }
                        return undefined;
                      },
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="John Doe"
                          className="h-11"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                        {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>}
                      </div>
                    )}
                  </form.Field>

                  <form.Field
                    name="email"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value) return "Email is required";
                        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                          return "Please enter a valid email address";
                        }
                        return undefined;
                      },
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          className="h-11"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                        {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>}
                      </div>
                    )}
                  </form.Field>

                  <form.Field
                    name="password"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value) return "Password is required";
                        if (value.length < 8) {
                          return "Password must be at least 8 characters";
                        }
                        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                          return "Password must contain uppercase, lowercase, and number";
                        }
                        return undefined;
                      },
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          className="h-11"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                        {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>}
                      </div>
                    )}
                  </form.Field>

                  <form.Field
                    name="confirmPassword"
                    validators={{
                      onChange: ({ value }) => {
                        const password = form.getFieldValue("password");
                        if (!value) return "Please confirm your password";
                        if (value !== password) {
                          return "Passwords do not match";
                        }
                        return undefined;
                      },
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          className="h-11"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                        {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>}
                      </div>
                    )}
                  </form.Field>

                  <form.Field
                    name="agreeToTerms"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value) return "You must agree to the terms";
                        return undefined;
                      },
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <input
                            id="terms"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 mt-1"
                            checked={field.state.value}
                            onChange={(e) => field.handleChange(e.target.checked)}
                          />
                          <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                            I agree to the{" "}
                            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                              Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                              Privacy Policy
                            </Link>
                          </Label>
                        </div>
                        {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>}
                      </div>
                    )}
                  </form.Field>

                  <RippleButton type="submit" className="w-full h-11" size="lg">
                    Create Account
                  </RippleButton>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <RippleButton
                    type="button"
                    variant="outline"
                    className="w-full h-11"
                    onClick={() => {
                      window.location.href = "/api/auth/github";
                    }}
                  >
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                  </RippleButton>

                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="underline underline-offset-4 hover:text-primary font-medium">
                      Sign in
                    </Link>
                  </p>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
