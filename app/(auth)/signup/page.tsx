"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Leaf, Lock, User as UserIcon, Mail } from "lucide-react";
import { useAuthStore } from "@/store/auth";

type SignupForm = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

export default function SignupPage() {
  const router = useRouter();
  const { register: signup, isLoading, isAuthenticated } = useAuthStore();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<SignupForm>({
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const password = watch("password");

  const onSubmit = async (values: SignupForm) => {
    try {
      await signup({
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
        email: values.email,
        password: values.password,
      });
      const role = useAuthStore.getState().user?.role?.toLowerCase();
      if (role === "admin") router.push("/admin");
      else router.push("/");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Signup failed";
      setError("root", { message });
    }
  };

  // Redirect away from signup if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const role = useAuthStore.getState().user?.role?.toLowerCase();
      if (role === "admin") router.replace("/admin");
      else router.replace("/");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 cursor-pointer"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-full">
              <Leaf className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary">FreshCart</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join us for fresh groceries delivered to your door
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Create a new account to start shopping
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {errors.root?.message && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {errors.root.message}
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">
                    First Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="firstName"
                      placeholder="First name"
                      className={
                        errors.firstName ? "border-red-500 pl-10" : "pl-10"
                      }
                      {...register("firstName", {
                        required: "First name is required",
                      })}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-500 text-xs">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    className={errors.lastName ? "border-red-500" : ""}
                    {...register("lastName", {
                      required: "Last name is required",
                    })}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="username"
                  placeholder="Choose a username"
                  className={errors.username ? "border-red-500" : ""}
                  {...register("username", {
                    required: "Username is required",
                    minLength: { value: 3, message: "At least 3 characters" },
                  })}
                />
                {errors.username && (
                  <p className="text-red-500 text-xs">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className={errors.email ? "border-red-500 pl-10" : "pl-10"}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Enter a valid email",
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Create a password"
                    className={
                      errors.password ? "border-red-500 pl-10" : "pl-10"
                    }
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 8, message: "At least 8 characters" },
                    })}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    className={
                      errors.confirmPassword ? "border-red-500 pl-10" : "pl-10"
                    }
                    {...register("confirmPassword", {
                      validate: (v: string) =>
                        v === password || "Passwords do not match",
                    })}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="acceptTerms"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                    {...register("acceptTerms", {
                      validate: (v: boolean) =>
                        v || "You must accept the terms and conditions",
                    })}
                  />
                  <label
                    htmlFor="acceptTerms"
                    className="ml-2 block text-sm text-gray-700 cursor-pointer"
                  >
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-primary hover:text-primary/80 font-medium cursor-pointer"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-primary hover:text-primary/80 font-medium cursor-pointer"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.acceptTerms && (
                  <p className="text-red-500 text-xs">
                    {errors.acceptTerms.message}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary/80 font-medium cursor-pointer"
                >
                  Sign in here
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
