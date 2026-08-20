import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
title: "Arovix Agency Dashboard",
description: "Manage partners and stores",
};

export default function RootLayout({
children,
}: Readonly<{
children: React.ReactNode;
}>) {
return (
<html lang="en" className="h-full">
<body className="h-full antialiased">
{children}
</body>
</html>
);
}
