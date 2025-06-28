"use client";
import Image from "next/image";

interface PlaceholderChartProps {
    dataAiHint: string;
}

export function PlaceholderChart({ dataAiHint }: PlaceholderChartProps) {
    return (
        <div className="relative w-full h-full">
            <Image
                src="https://placehold.co/600x300.png"
                alt="Placeholder chart"
                layout="fill"
                objectFit="cover"
                className="rounded-md"
                data-ai-hint={dataAiHint}
            />
        </div>
    );
}
