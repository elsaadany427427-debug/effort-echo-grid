 import { useEffect, useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { Target } from 'lucide-react';
 import { useAuth } from '@/contexts/AuthContext';
 import { LoginForm } from '@/components/auth/LoginForm';
 import { SignupForm } from '@/components/auth/SignupForm';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 
 export default function Auth() {
   const { user, loading } = useAuth();
   const navigate = useNavigate();
   const [activeTab, setActiveTab] = useState('login');
 
   useEffect(() => {
     if (!loading && user) {
       navigate('/');
     }
   }, [user, loading, navigate]);
 
   if (loading) {
     return (
       <div className="min-h-screen flex items-center justify-center">
         <div className="animate-pulse text-muted-foreground">Loading...</div>
       </div>
     );
   }
 
   return (
     <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
       <div className="w-full max-w-md">
         {/* Logo */}
         <div className="flex items-center justify-center gap-3 mb-8">
           <div className="p-3 rounded-xl bg-primary/10 glow-primary">
             <Target className="h-8 w-8 text-primary" />
           </div>
           <div>
             <h1 className="text-3xl font-bold">Goal Tracker</h1>
             <p className="text-sm text-muted-foreground">Track your performance goals</p>
           </div>
         </div>
 
         <Card className="glass-card border-border/50">
           <CardHeader className="text-center">
             <CardTitle>Welcome</CardTitle>
             <CardDescription>
               Sign in to your account or create a new one
             </CardDescription>
           </CardHeader>
           <CardContent>
             <Tabs value={activeTab} onValueChange={setActiveTab}>
               <TabsList className="grid w-full grid-cols-2 mb-6">
                 <TabsTrigger value="login">Sign In</TabsTrigger>
                 <TabsTrigger value="signup">Sign Up</TabsTrigger>
               </TabsList>
               <TabsContent value="login">
                 <LoginForm />
               </TabsContent>
               <TabsContent value="signup">
                 <SignupForm />
               </TabsContent>
             </Tabs>
           </CardContent>
         </Card>
       </div>
     </div>
   );
 }