'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Zap, AlertTriangle, ShieldAlert, History, Search } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface User {
    id: number;
    email: string;
    role: string;
    usage_count: number;
    is_suspended: boolean;
    created_at: string;
}

interface Generation {
    id: number;
    email: string;
    input_text: string;
    input_url: string;
    purpose: string;
    suggestions: string;
    is_flagged: boolean;
    flag_reason?: string;
    created_at: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState({ totalUsers: 0, totalGenerations: 0, flaggedContent: 0 });
    const [users, setUsers] = useState<User[]>([]);
    const [generations, setGenerations] = useState<Generation[]>([]);
    const [loading, setLoading] = useState(true);

    // Search & Filter State
    const [userSearch, setUserSearch] = useState('');
    const [genSearch, setGenSearch] = useState('');
    const [genCategory, setGenCategory] = useState('all');

    const [isUnauthorized, setIsUnauthorized] = useState(false);

    // Filtered Data
    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.id.toString().includes(userSearch)
    );

    const uniqueCategories = Array.from(new Set(generations.map(g => g.purpose).filter(Boolean)));

    const filteredGenerations = generations.filter(gen => {
        const matchesSearch =
            (gen.email?.toLowerCase() || '').includes(genSearch.toLowerCase()) ||
            (gen.input_text?.toLowerCase() || '').includes(genSearch.toLowerCase()) ||
            (gen.purpose?.toLowerCase() || '').includes(genSearch.toLowerCase());

        const matchesCategory = genCategory === 'all' || gen.purpose === genCategory;

        return matchesSearch && matchesCategory;
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, usersRes, genRes] = await Promise.all([
                fetch('/api/admin/stats'),
                fetch('/api/admin/users'),
                fetch('/api/admin/generations')
            ]);

            const handleResponse = async (res: Response, name: string) => {
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return res.json();
                } else {
                    const text = await res.text();
                    console.error(`Expected JSON from ${name} but got:`, text.substring(0, 200)); // Log first 200 chars
                    throw new Error(`Invalid response from ${name}`);
                }
            };

            if (statsRes.status === 401 || usersRes.status === 401 || genRes.status === 401) {
                setIsUnauthorized(true);
                return;
            }

            const [statsData, usersData, genData] = await Promise.all([
                handleResponse(statsRes, 'stats'),
                handleResponse(usersRes, 'users'),
                handleResponse(genRes, 'generations')
            ]);

            if (!statsData.error) setStats(statsData);
            if (!usersData.error) setUsers(usersData);
            if (!genData.error) setGenerations(genData);
        } catch (error) {
            console.error('Failed to fetch admin data', error);
            toast.error('Failed to load dashboard data. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: number, newRole: string) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole }),
            });

            if (res.ok) {
                toast.success('User role updated');
                fetchData(); // Refresh data
            } else {
                toast.error('Failed to update role');
            }
        } catch (error) {
            toast.error('Something went wrong');
        }
    };

    const handleSuspensionToggle = async (userId: number, currentStatus: boolean) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, isSuspended: !currentStatus }),
            });

            if (res.ok) {
                toast.success(currentStatus ? 'User restored' : 'User suspended');
                fetchData(); // Refresh data
            } else {
                toast.error('Failed to update suspension status');
            }
        } catch (error) {
            toast.error('Something went wrong');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-muted/10">
            <Navbar />
            <main className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex items-center gap-3 mb-8">
                    <ShieldAlert className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold">Developer Console</h1>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Generations</CardTitle>
                            <Zap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalGenerations}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-500">{stats.flaggedContent}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="users" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                        <TabsTrigger value="users">User Management</TabsTrigger>
                        <TabsTrigger value="generations">Content Log</TabsTrigger>
                        <TabsTrigger value="reported">Reported Content</TabsTrigger>
                    </TabsList>

                    <TabsContent value="users">
                        <Card>
                            <CardHeader>
                                <CardTitle>Registered Users</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative flex-1 max-w-sm">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search users by email or ID..."
                                            className="pl-9"
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Usage</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Suspended</TableHead>
                                            <TableHead>Joined</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.map((user) => (
                                            <TableRow key={user.id} className={user.is_suspended ? 'bg-red-50/50 dark:bg-red-900/10' : ''}>
                                                <TableCell className="font-mono text-xs">{user.id}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{user.usage_count}</TableCell>
                                                <TableCell>
                                                    <Select defaultValue={user.role} onValueChange={(val) => handleRoleChange(user.id, val)}>
                                                        <SelectTrigger className="w-[130px] h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="free">Free</SelectItem>
                                                            <SelectItem value="premium">Premium</SelectItem>
                                                            <SelectItem value="vip">VIP</SelectItem>
                                                            <SelectItem value="developer">Developer</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Switch
                                                        checked={user.is_suspended}
                                                        onCheckedChange={() => handleSuspensionToggle(user.id, user.is_suspended)}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-xs">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="generations">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Generations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col md:flex-row gap-4 mb-6">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search generations..."
                                            className="pl-9"
                                            value={genSearch}
                                            onChange={(e) => setGenSearch(e.target.value)}
                                        />
                                    </div>
                                    <Select value={genCategory} onValueChange={setGenCategory}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {uniqueCategories.map(cat => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-4">
                                    {filteredGenerations.map((gen) => (
                                        <div key={gen.id} className={`p-4 rounded-lg border ${gen.is_flagged ? 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30' : 'bg-muted/20'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold">{gen.email}</span>
                                                        <span className="text-xs text-muted-foreground">{new Date(gen.created_at).toLocaleString()}</span>
                                                    </div>
                                                    <Badge variant="outline" className="text-xs font-normal">
                                                        {gen.purpose}
                                                    </Badge>
                                                </div>
                                                {gen.is_flagged && <Badge variant="destructive">Flagged</Badge>}
                                            </div>
                                            <div className="text-sm text-muted-foreground line-clamp-2 font-mono bg-background/50 p-2 rounded">
                                                {gen.input_text || gen.input_url || 'No input'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
