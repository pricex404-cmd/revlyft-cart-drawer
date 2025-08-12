import { Outlet } from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";

export default function SetupGuideLayout() {
    return (
        <>
            <TitleBar title="Setup Guide" />
            <Outlet />
        </>
    );
} 