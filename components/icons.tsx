import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;
const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8 };

export function ShieldIcon(props: Props) { return <svg {...base} {...props}><path d="M12 3 4.5 6v5.5c0 4.7 3 8 7.5 9.5 4.5-1.5 7.5-4.8 7.5-9.5V6L12 3Z"/><path d="m9 12 2 2 4-4"/></svg>; }
export function ArrowIcon(props: Props) { return <svg {...base} {...props}><path d="M5 12h14M13 6l6 6-6 6"/></svg>; }
export function GlobeIcon(props: Props) { return <svg {...base} {...props}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.4 3 14.6 0 18M12 3c-3 3.4-3 14.6 0 18"/></svg>; }
export function CheckIcon(props: Props) { return <svg {...base} {...props}><path d="m5 12 4 4L19 6"/></svg>; }
export function AlertIcon(props: Props) { return <svg {...base} {...props}><path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 9v5M12 17.5v.5"/></svg>; }
export function ExternalIcon(props: Props) { return <svg {...base} {...props}><path d="M14 5h5v5M19 5l-8 8"/><path d="M18 13v6H5V6h6"/></svg>; }
