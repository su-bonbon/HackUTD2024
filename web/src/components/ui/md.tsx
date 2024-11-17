import React from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownRendererProps {
	content: string;
	className?: string;
}

const MarkdownRenderer = ({
	content,
	className = "",
}: MarkdownRendererProps) => {
	return (
		<ReactMarkdown
			className={`prose dark:prose-invert max-w-none ${className}`}
		>
			{content}
		</ReactMarkdown>
	);
};

export default MarkdownRenderer;
