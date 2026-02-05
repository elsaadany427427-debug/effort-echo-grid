 import { useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { Target, LogOut, Edit2, Check, X } from 'lucide-react';
 import { useAuth } from '@/contexts/AuthContext';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Avatar, AvatarFallback } from '@/components/ui/avatar';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 
 export function ProjectHeader() {
   const { user, profile, signOut, updateProjectName } = useAuth();
   const navigate = useNavigate();
   const [isEditingName, setIsEditingName] = useState(false);
   const [tempName, setTempName] = useState('');
 
   const handleSignOut = async () => {
     await signOut();
     navigate('/auth');
   };
 
   const startEditing = () => {
     setTempName(profile?.project_name || 'My Goals Dashboard');
     setIsEditingName(true);
   };
 
   const saveName = async () => {
     if (tempName.trim()) {
       await updateProjectName(tempName.trim());
     }
     setIsEditingName(false);
   };
 
   const cancelEditing = () => {
     setIsEditingName(false);
   };
 
   const getInitials = () => {
     const name = profile?.display_name || user?.email || 'U';
     return name.charAt(0).toUpperCase();
   };
 
   return (
     <div className="flex items-center gap-3">
       <div className="p-2.5 rounded-xl bg-primary/10 glow-primary">
         <Target className="h-6 w-6 text-primary" />
       </div>
       <div className="flex-1">
         <h1 className="text-2xl font-bold">Goal Tracker</h1>
         <div className="flex items-center gap-2">
           {isEditingName ? (
             <div className="flex items-center gap-1">
               <Input
                 value={tempName}
                 onChange={(e) => setTempName(e.target.value)}
                 className="h-6 text-sm py-0 px-2 w-48"
                 autoFocus
                 onKeyDown={(e) => {
                   if (e.key === 'Enter') saveName();
                   if (e.key === 'Escape') cancelEditing();
                 }}
               />
               <Button variant="ghost" size="icon" className="h-6 w-6" onClick={saveName}>
                 <Check className="h-3 w-3" />
               </Button>
               <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelEditing}>
                 <X className="h-3 w-3" />
               </Button>
             </div>
           ) : (
             <button
               onClick={startEditing}
               className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 group"
             >
               {profile?.project_name || 'My Goals Dashboard'}
               <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
             </button>
           )}
         </div>
       </div>
       
       <DropdownMenu>
         <DropdownMenuTrigger asChild>
           <Button variant="ghost" className="relative h-9 w-9 rounded-full">
             <Avatar className="h-9 w-9">
               <AvatarFallback className="bg-primary/20 text-primary">
                 {getInitials()}
               </AvatarFallback>
             </Avatar>
           </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent className="w-56" align="end">
           <DropdownMenuLabel className="font-normal">
             <div className="flex flex-col space-y-1">
               <p className="text-sm font-medium">{profile?.display_name || 'User'}</p>
               <p className="text-xs text-muted-foreground">{user?.email}</p>
             </div>
           </DropdownMenuLabel>
           <DropdownMenuSeparator />
           <DropdownMenuItem onClick={handleSignOut}>
             <LogOut className="mr-2 h-4 w-4" />
             <span>Log out</span>
           </DropdownMenuItem>
         </DropdownMenuContent>
       </DropdownMenu>
     </div>
   );
 }