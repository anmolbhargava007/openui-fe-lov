
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { UserForManagement } from "@/types/auth";
import { authApi } from "@/services/authApi";
import { toast } from "sonner";

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserForManagement | null;
  onUserUpdated: () => void;
}

const userSchema = z.object({
  user_id: z.number(),
  user_name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  user_email: z.string().email({ message: "Please enter a valid email address" }),
  user_mobile: z.string().min(10, { message: "Mobile number must be at least 10 digits" }),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    required_error: "Please select a gender",
  }),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof userSchema>;

const EditUserDialog = ({ isOpen, onClose, user, onUserUpdated }: EditUserDialogProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      user_id: user?.user_id || 0,
      user_name: user?.user_name || "",
      user_email: user?.user_email || "",
      user_mobile: user?.user_mobile || "",
      gender: user?.gender || "MALE",
      is_active: user?.is_active ?? true,
    }
  });

  React.useEffect(() => {
    if (user) {
      form.reset({
        user_id: user.user_id,
        user_name: user.user_name,
        user_email: user.user_email,
        user_mobile: user.user_mobile,
        gender: user.gender,
        is_active: user.is_active,
      });
    }
  }, [user, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      // Since values is already of type FormValues which matches UserForManagement, 
      // no need for type casting or additional checks
      await authApi.updateUser(values);
      toast.success("User updated successfully");
      onUserUpdated();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="user_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="user_mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4"
                    />
                  </FormControl>
                  <FormLabel className="font-normal">Active</FormLabel>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
