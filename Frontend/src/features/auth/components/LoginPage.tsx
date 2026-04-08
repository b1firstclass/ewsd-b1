import { BackgroundTheme } from "@/components/layout/BackgroundLayout";
import { LoginForm } from "./LoginForm";
import favicon from "@/assets/favicon.svg";

export const LoginPage = () => {
    return (
        <BackgroundTheme>
            <main className="flex min-h-svh items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex w-full max-w-md flex-col items-center gap-6">
                    <div className="flex items-center justify-center gap-4">
                        <img
                            src={favicon}
                            alt="Echo Press logo"
                            className="h-16 w-auto object-contain sm:h-20"
                            loading="eager"
                            decoding="async"
                        />
                        <p className="font-display text-2xl font-semibold tracking-[0.2em] text-primary sm:text-3xl">
                            ECHO PRESS
                        </p>
                    </div>
                    <LoginForm />
                </div>
            </main>
        </BackgroundTheme>
    );
}
