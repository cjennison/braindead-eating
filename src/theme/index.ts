"use client";

import {
	createTheme,
	type MantineColorsTuple,
	type MantineThemeOverride,
} from "@mantine/core";

// Font imports for Inter (UI) and Bricolage Grotesque (Headings) - added in layout

const sage: MantineColorsTuple = [
	"#e6f5e6",
	"#ceeacd",
	"#9dd39a",
	"#69bc65",
	"#3fa938",
	"#269c1a",
	"#179408",
	"#068200",
	"#007300",
	"#006300",
];

const coral: MantineColorsTuple = [
	"#ffeeee",
	"#fcdada",
	"#f7b2af",
	"#f28881",
	"#ee6458",
	"#eb4c3c",
	"#ea402b",
	"#d03120",
	"#b92a1b",
	"#a12113",
];

const teal: MantineColorsTuple = [
	"#e1f7fc",
	"#cceed4",
	"#97dbec",
	"#5fc7e4",
	"#31b6dd",
	"#13add9",
	"#00a6d7",
	"#0092c0",
	"#0083ac",
	"#007297",
];

const darkCharcoal: MantineColorsTuple = [
	"#f6f6f6",
	"#e7e7e7",
	"#d1d1d1",
	"#b0b0b0",
	"#888888",
	"#6d6d6d",
	"#5d5d5d",
	"#4f4f4f",
	"#454545",
	"#1A1B1E",
];

export const theme: MantineThemeOverride = createTheme({
	primaryColor: "sage",
	colors: {
		sage,
		coral,
		teal,
		dark: darkCharcoal,
	},
	fontFamily: '"Geist", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
	headings: {
		fontFamily:
			'"Geist Mono", "Bricolage Grotesque", -apple-system, BlinkMacSystemFont, sans-serif',
		fontWeight: "800",
	},
	primaryShade: 5,
	radius: {
		xs: "4px",
		sm: "8px",
		md: "16px",
		lg: "24px",
		xl: "32px",
	},
	defaultRadius: "lg",
	shadows: {
		xs: "0px 2px 4px rgba(0, 0, 0, 0.04)",
		sm: "0px 4px 8px rgba(0, 0, 0, 0.04), 0px 0px 2px rgba(0,0,0,0.06)",
		md: "0px 8px 16px rgba(0, 0, 0, 0.04), 0px 4px 4px rgba(0,0,0,0.04)",
		lg: "0px 16px 24px rgba(0, 0, 0, 0.04), 0px 8px 8px rgba(0,0,0,0.04)",
		xl: "0px 24px 48px rgba(0, 0, 0, 0.05), 0px 12px 24px rgba(0,0,0,0.05)",
	},
	components: {
		Card: {
			defaultProps: {
				shadow: "sm",
				withBorder: true,
			},
			styles: {
				root: {
					backgroundColor: "var(--mantine-color-body)",
					borderColor: "var(--mantine-color-darkCharcoal-2)",
					transition: "transform 0.2s ease, box-shadow 0.2s ease",
				},
			},
		},
		Button: {
			defaultProps: {
				size: "lg",
				radius: "xl",
				fw: 800,
			},
			styles: {
				root: {
					boxShadow: "0px 4px 12px rgba(38, 156, 26, 0.25)",
					letterSpacing: "-0.5px",
					transition:
						"transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease",
					"&:active": {
						transform: "scale(0.98)",
					},
					"&[data-disabled]": {
						boxShadow: "none",
					},
				},
			},
		},
		TextInput: {
			defaultProps: {
				size: "xl",
				radius: "lg",
			},
			styles: {
				input: {
					backgroundColor: "var(--mantine-color-default)",
					border: "1px solid var(--mantine-color-default-border)",
					"&:focus": {
						borderColor: "var(--mantine-color-sage-5)",
						boxShadow: "0 0 0 2px rgba(38, 156, 26, 0.2)",
					},
				},
			},
		},
		Textarea: {
			defaultProps: {
				size: "xl",
				radius: "lg",
			},
			styles: {
				input: {
					backgroundColor: "var(--mantine-color-default)",
					border: "1px solid var(--mantine-color-default-border)",
					"&:focus": {
						borderColor: "var(--mantine-color-sage-5)",
						boxShadow: "0 0 0 2px rgba(38, 156, 26, 0.2)",
					},
				},
			},
		},
		NumberInput: {
			defaultProps: {
				size: "xl",
				radius: "lg",
			},
			styles: {
				input: {
					backgroundColor: "var(--mantine-color-default)",
					border: "1px solid var(--mantine-color-default-border)",
					"&:focus": {
						borderColor: "var(--mantine-color-sage-5)",
						boxShadow: "0 0 0 2px rgba(38, 156, 26, 0.2)",
					},
				},
			},
		},
		SegmentedControl: {
			defaultProps: {
				size: "lg",
				radius: "xl",
			},
			styles: {
				root: {
					backgroundColor: "var(--mantine-color-default)",
					border: "1px solid var(--mantine-color-default-border)",
				},
				indicator: {
					boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
				},
			},
		},
	},
});
