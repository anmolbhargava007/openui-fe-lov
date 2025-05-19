
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
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
import { useAuth } from "@/context/AuthContext";
import { SignupRequest } from "@/types/api";
import logo from "./../../public/icons/logo-light1.png";

const formSchema = z.object({
  user_name: z.string().min(2, "Name must be at least 2 characters"),
  user_email: z.string().email("Invalid email address"),
  user_pwd: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  conf_password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
})
.refine(data => data.user_pwd === data.conf_password, {
  message: "Passwords don't match",
  path: ['conf_password'],
});

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_name: "",
      user_email: "",
      user_pwd: "",
      conf_password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const signupRequest: SignupRequest = {
        user_name: values.user_name,
        user_email: values.user_email,
        user_pwd: values.user_pwd,
        role_id: 2, // Default role
      };

      const success = await signup(signupRequest);
      if (success) {
        navigate("/");
      }
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img src={logo} alt="logo" className="mx-auto w-80 h-auto" />
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <p className="text-center mb-4 text-gray-600 dark:text-gray-300">
            Create a new account
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="user_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="user_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="email@example.com"
                        type="email"
                        {...field}
                      />
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

              <FormField
                control={form.control}
                name="conf_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-[#A259FF] hover:bg-[#A259FF]/90"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Already have an account?</span>{" "}
            <Link
              to="/signin"
              className="text-[#A259FF] font-semibold hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
