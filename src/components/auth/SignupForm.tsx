 import { useState } from 'react';
 import { useForm } from 'react-hook-form';
 import { zodResolver } from '@hookform/resolvers/zod';
 import { z } from 'zod';
 import { useAuth } from '@/contexts/AuthContext';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Alert, AlertDescription } from '@/components/ui/alert';
 import { Loader2, Mail, Lock, User } from 'lucide-react';
 
 const signupSchema = z.object({
   displayName: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
   email: z.string().email('Please enter a valid email'),
   password: z.string().min(6, 'Password must be at least 6 characters'),
   confirmPassword: z.string(),
 }).refine((data) => data.password === data.confirmPassword, {
   message: "Passwords don't match",
   path: ['confirmPassword'],
 });
 
 type SignupFormData = z.infer<typeof signupSchema>;
 
 export function SignupForm() {
   const { signUp } = useAuth();
   const [error, setError] = useState<string | null>(null);
   const [success, setSuccess] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
 
   const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
     resolver: zodResolver(signupSchema),
   });
 
   const onSubmit = async (data: SignupFormData) => {
     setIsLoading(true);
     setError(null);
 
     const { error } = await signUp(data.email, data.password, data.displayName);
     
     if (error) {
       if (error.message.includes('already registered')) {
         setError('This email is already registered. Please sign in instead.');
       } else {
         setError(error.message);
       }
     } else {
       setSuccess(true);
     }
     
     setIsLoading(false);
   };
 
   if (success) {
     return (
       <Alert>
         <AlertDescription>
           Check your email to confirm your account. You can close this page.
         </AlertDescription>
       </Alert>
     );
   }
 
   return (
     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
       {error && (
         <Alert variant="destructive">
           <AlertDescription>{error}</AlertDescription>
         </Alert>
       )}
 
       <div className="space-y-2">
         <Label htmlFor="displayName">Display Name</Label>
         <div className="relative">
           <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
             id="displayName"
             type="text"
             placeholder="John Doe"
             className="pl-10"
             {...register('displayName')}
           />
         </div>
         {errors.displayName && (
           <p className="text-sm text-destructive">{errors.displayName.message}</p>
         )}
       </div>
 
       <div className="space-y-2">
         <Label htmlFor="signup-email">Email</Label>
         <div className="relative">
           <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
             id="signup-email"
             type="email"
             placeholder="you@example.com"
             className="pl-10"
             {...register('email')}
           />
         </div>
         {errors.email && (
           <p className="text-sm text-destructive">{errors.email.message}</p>
         )}
       </div>
 
       <div className="space-y-2">
         <Label htmlFor="signup-password">Password</Label>
         <div className="relative">
           <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
             id="signup-password"
             type="password"
             placeholder="••••••••"
             className="pl-10"
             {...register('password')}
           />
         </div>
         {errors.password && (
           <p className="text-sm text-destructive">{errors.password.message}</p>
         )}
       </div>
 
       <div className="space-y-2">
         <Label htmlFor="confirmPassword">Confirm Password</Label>
         <div className="relative">
           <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
             id="confirmPassword"
             type="password"
             placeholder="••••••••"
             className="pl-10"
             {...register('confirmPassword')}
           />
         </div>
         {errors.confirmPassword && (
           <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
         )}
       </div>
 
       <Button type="submit" className="w-full" disabled={isLoading}>
         {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
         Create Account
       </Button>
     </form>
   );
 }