import { BackgroundTheme } from "@/components/layout/BackgroundLayout";
import { LoginForm } from "./LoginForm";

export const LoginPage = () => {
    return (
        <BackgroundTheme>
            <main className="flex min-h-svh items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
                <LoginForm />
            </main>
        </BackgroundTheme>
    );
}