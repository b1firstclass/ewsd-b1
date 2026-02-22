import { BackgroundTheme } from "@/components/layout/BackgroundLayout";
import { LoginForm } from "./LoginForm";

export const LoginPage = () => {
    return (
        <BackgroundTheme>
            <main className="min-h-screen grid gap-10 lg:grid-cols-[0.9fr,1.1fr] items-center justify-center">
                <LoginForm />
            </main>
        </BackgroundTheme>
    );
}