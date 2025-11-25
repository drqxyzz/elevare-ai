"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"
import Link from "next/link"

interface LoginModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function LoginModal({ isOpen, onOpenChange }: LoginModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <DialogTitle className="text-center text-xl">Login Required</DialogTitle>
                    <DialogDescription className="text-center">
                        Please log in to generate your AI content. Your inputs will be saved automatically.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3 mt-4">
                    <Link href="/api/auth/login" className="w-full">
                        <Button className="w-full" size="lg">
                            Log in / Sign up
                        </Button>
                    </Link>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
