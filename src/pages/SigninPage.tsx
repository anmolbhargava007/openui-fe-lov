
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

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
import { authApi } from "@/services/authApi";
import { useAuth } from "@/context/AuthContext";
import logo from "./../../public/icons/logo-light.png"

const signinSchema = z.object({
  user_email: z.string().email({ message: "Please enter a valid email address" }),
  user_pwd: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type SigninFormValues = z.infer<typeof signinSchema>;

const SigninPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signin } = useAuth();
  const navigate = useNavigate();

  const form = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      user_email: "",
      user_pwd: "",
    },
  });

  const onSubmit = async (values: SigninFormValues) => {
    setIsLoading(true);
    try {
      const response = await authApi.signin(values);
      
      if (response.success && response.data && response.data.length > 0) {
        signin(response.data[0]);
      } else {
        toast.error(response.msg || "Failed to sign in");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img src={logo} alt="logo" />
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="mt-1 text-center mb-3 text-gray-600">Please Sign in to continue</p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="user_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="user_pwd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Don't have an account?</span>{" "}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SigninPage;