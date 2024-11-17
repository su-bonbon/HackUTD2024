import type { ResearchItem } from "@/app/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import React from "react";

interface DataHistoryProps {
	dataHistory: ResearchItem[];
	isDarkMode: boolean;
	onSwitchItem: (item: ResearchItem) => void;
	onDeleteItem: (item: ResearchItem) => void;
}

const DataHistory = ({
	dataHistory,
	isDarkMode,
	onSwitchItem,
	onDeleteItem,
}: DataHistoryProps) => {
	return (
		<div
			className={`w-full md:w-1/4 ${isDarkMode ? "bg-gray-700" : "bg-gray-100"} p-4 flex flex-col transition-colors duration-200`}
		>
			<ScrollArea className="flex-grow mb-4">
				<div className="space-y-2">
					{dataHistory.map((item, index) => (
						// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
						<div
							key={`${item.name}-${index}`}
							className={`${
								isDarkMode
									? "bg-gray-600 hover:bg-gray-500"
									: "bg-white hover:bg-gray-200"
							} p-2 rounded-lg transition-colors duration-200 cursor-pointer group relative`}
							onClick={() => onSwitchItem(item)}
						>
							<h3
								className={`font-semibold ${
									isDarkMode ? "text-white" : "text-gray-800"
								} truncate pr-8`}
							>
								{item.name}
							</h3>
							<Button
								variant="ghost"
								size="icon"
								className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
								onClick={(e) => {
									e.stopPropagation();
									onDeleteItem(item);
								}}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					))}
				</div>
			</ScrollArea>
			<Button variant={isDarkMode ? "secondary" : "default"} className="w-full">
				Enlighten me
			</Button>
		</div>
	);
};

export default DataHistory;
