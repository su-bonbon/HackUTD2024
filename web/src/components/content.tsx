import type { ResearchItem } from "@/app/types";
import React from "react";
import MarkdownRenderer from "./ui/md";

interface ResearchContentProps {
	currentResearch: ResearchItem | null;
	isDarkMode: boolean;
}

const ResearchContent = ({
	currentResearch,
	isDarkMode,
}: ResearchContentProps) => {
	if (!currentResearch) return null;

	if (currentResearch.status === "completed" && currentResearch.analysis) {
		const {
			initial_research,
			final_analysis,
			adjustment_reasons,
			adjustments,
		} = currentResearch.analysis;

		return (
			<div className="space-y-4">
				<div
					className={`${isDarkMode ? "bg-gray-700" : "bg-gray-100"} p-3 rounded-lg transition-colors duration-200`}
				>
					<h3
						className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}
					>
						Initial Research
					</h3>
					<MarkdownRenderer
						content={initial_research}
						className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
					/>
				</div>

				<div
					className={`${isDarkMode ? "bg-gray-700" : "bg-gray-100"} p-3 rounded-lg transition-colors duration-200`}
				>
					<h3
						className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}
					>
						Final Analysis
					</h3>
					<MarkdownRenderer
						content={final_analysis}
						className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
					/>
				</div>

				{adjustment_reasons.length > 0 && adjustments > 0 && (
					<div
						className={`${isDarkMode ? "bg-gray-700" : "bg-gray-100"} p-3 rounded-lg transition-colors duration-200`}
					>
						<h3
							className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}
						>
							Adjustments
						</h3>
						<ul
							className={`${isDarkMode ? "text-gray-300" : "text-gray-600"} list-disc pl-4`}
						>
							{adjustment_reasons.map((reason, index) => (
								<li key={index}>
									<MarkdownRenderer content={reason} />
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		);
	}

	return (
		<div
			className={`${isDarkMode ? "bg-gray-700" : "bg-gray-100"} p-3 rounded-lg transition-colors duration-200`}
		>
			<h3
				className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}
			>
				Status
			</h3>
			<p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
				{currentResearch.status === "finalizing"
					? "Finalizing analysis..."
					: "Processing request..."}
			</p>
		</div>
	);
};

export default ResearchContent;
