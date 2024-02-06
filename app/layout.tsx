import React from "react";
import StyledJsxRegistry from "./registry";

export const metadata = {
    title: "TodoApp",
    description: "TodoApp - Create your tasks",
    icons: {
        icon: "/favicon.icon",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
            <body>
                <StyledJsxRegistry>{children}</StyledJsxRegistry>
            </body>
        </html>
    );
}
