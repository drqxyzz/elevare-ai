'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, History, User, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

export function UserMenu() {
    const { user } = useUser();
    const [role, setRole] = useState<string>('free');

    useEffect(() => {
        if (user) {
            fetch('/api/user/usage')
                .then(res => res.json())
                .then(data => setRole(data.role || 'free'))
                .catch(console.error);
        }
    }, [user]);

    if (!user) return null;

    const getBadgeColor = (r: string) => {
        switch (r) {
            case 'premium': return 'bg-purple-500 hover:bg-purple-600';
            case 'developer': return 'bg-green-500 hover:bg-green-600';
            case 'vip': return 'bg-yellow-500 hover:bg-yellow-600';
            default: return 'bg-gray-500 hover:bg-gray-600';
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src={user.picture || ''} alt={user.name || 'User'} />
                        <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <Badge className={`text-[10px] h-5 px-1.5 ${getBadgeColor(role)}`}>
                                {role.toUpperCase()}
                            </Badge>
                        </div>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/dashboard/history" className="cursor-pointer">
                        <History className="mr-2 h-4 w-4" />
                        <span>History</span>
                    </Link>
                </DropdownMenuItem>
                {role === 'admin' && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/admin" className="cursor-pointer">
                                <ShieldAlert className="mr-2 h-4 w-4 text-red-500" />
                                <span>Admin Panel</span>
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="text-red-600 focus:text-red-600">
                    <a href="/api/auth/logout" className="cursor-pointer flex items-center">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </a>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
