 import { useState } from 'react';
 import { useForm } from 'react-hook-form';
 import { zodResolver } from '@hookform/resolvers/zod';
 import { z } from 'zod';
 import { useAuth } from '@/contexts/AuthContext';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Alert, AlertDescription } from '@/components/ui/alert';
 import { Loader2, Mail, Lock } from 'lucide-react';
 
 const loginSchema = z.object({
   email: z.string().email('Please enter a valid email'),
   password: z.string().min(6, 'Password must be at least 6 characters'),
 });
 
 type LoginFormData = z.infer<typeof loginSchema>;
 
 export function LoginForm() {
   const { signIn } = useAuth();
   const [error, setError] = useState<string | null>(null);
   const [isLoading, setIsLoading] = useState(false);
 
   const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
     resolver: zodResolver(loginSchema),
   });
 
   const onSubmit = async (data: LoginFormData) => {
     setIsLoading(true);
     setError(null);
 
     const { error } = await signIn(data.email, data.password);
     
     if (error) {
       if (error.message.includes('Invalid login')) {
         setError('Invalid email or password');
       } else if (error.message.includes('Email not confirmed')) {
         setError('Please check your email to confirm your account');
       } else {
         setError(error.message);
       }
     }
     
     setIsLoading(false);
   };
 
   return (
     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
       {error && (
         <Alert variant="destructive">
           <AlertDescription>{error}</AlertDescription>
         </Alert>
       )}
 
       <div className="space-y-2">
         <Label htmlFor="email">Email</Label>
         <div className="relative">
           <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
             id="email"
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
         <Label htmlFor="password">Password</Label>
         <div className="relative">
           <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
             id="password"
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
 
       <Button type="submit" className="w-full" disabled={isLoading}>
         {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
         Sign In
       </Button>
     </form>
   );
 }