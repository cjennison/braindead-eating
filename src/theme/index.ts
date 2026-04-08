"use client";

import {
	createTheme,
	type MantineColorsTuple,
	type MantineThemeOverride,
} from "@mantine/core";

const sage: MantineColorsTuple = [
	"#f2f8f2",
	"#e3ede3",
	"#c4dac4",
	"#a3c5a3",
	"#87b487",
	"#7CB77C",
	"#6da86d",
	"#5c955c",
	"#4d824d",
	"#3e6f3e",
];

const coral: MantineColorsTuple = [
	"#fef2ef",
	"#fce3dd",
	"#f8c4b8",
	"#f3a28f",
	"#ee856e",
	"#E88D7A",
	"#d6715c",
	"#be5a45",
	"#a54838",
	"#8c382c",
];

const teal: MantineColorsTuple = [
	"#eef9f8",
	"#d9f0ee",
	"#b0dfdb",
	"#85cdc6",
	"#62beb5",
	"#5BAFA8",
	"#4a9d96",
	"#3b8a83",
	"#2d7770",
	"#20645e",
];

export const theme: MantineThemeOverride = createTheme({
	primaryColor: "sage",
	colors: {
		sage,
		coral,
		teal,
	},
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
	headings: {
		fontFamily:
			'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
		fontWeight: "700",
	},
	radius: {
		xs: "4px",
		sm: "8px",
		md: "12px",
		lg: "16px",
		xl: "24px",
	},
	defaultRadius: "md",
	components: {
		Button: {
			defaultProps: {
				size: "lg",
				radius: "md",
			},
		},
		TextInput: {
			defaultProps: {
				size: "lg",
				radius: "md",
			},
		},
		Textarea: {
			defaultProps: {
				size: "lg",
				radius: "md",
			},
		},
		NumberInput: {
			defaultProps: {
				size: "lg",
				radius: "md",
			},
		},
	},
});
