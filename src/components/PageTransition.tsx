"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useNavDirection } from "@/components/NavDirectionProvider";

const SLIDE_DISTANCE = 60;

interface PageTransitionProps {
	children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
	const { direction } = useNavDirection();
	const pathname = usePathname();

	const xOffset = direction === 0 ? 0 : direction * SLIDE_DISTANCE;

	return (
		<motion.div
			key={pathname}
			initial={{ opacity: 0, x: xOffset }}
			animate={{ opacity: 1, x: 0 }}
			transition={{
				duration: 0.25,
				ease: [0.25, 0.1, 0.25, 1],
			}}
			style={{ willChange: "opacity, transform" }}
		>
			{children}
		</motion.div>
	);
}
