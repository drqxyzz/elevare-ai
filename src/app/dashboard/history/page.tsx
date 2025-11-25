import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function HistoryPage() {
    return (
        <div className="min-h-screen flex flex-col bg-muted/10">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-4">History</h1>
                <p className="text-muted-foreground">Your generation history will appear here.</p>
            </main>
            <Footer />
        </div>
    );
}
