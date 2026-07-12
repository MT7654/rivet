import type { Config } from "tailwindcss";
export default {content:["./app/**/*.{ts,tsx}","./components/**/*.{ts,tsx}"],theme:{extend:{colors:{ink:"#090a0c",panel:"#101216",line:"#272a31",accent:"#e5ff5e"},fontFamily:{mono:["var(--font-mono)","monospace"]}}},plugins:[]} satisfies Config;
