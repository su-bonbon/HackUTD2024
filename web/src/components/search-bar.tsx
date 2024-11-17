import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import React from "react";

interface SearchBarProps {
	inputValue: string;
	showWarning: boolean;
	isDarkMode: boolean;
	maxItems: number;
	onInputChange: (value: string) => void;
	onSubmit: (e: React.FormEvent) => void;
}

const SearchBar = ({
	inputValue,
	showWarning,
	isDarkMode,
	maxItems,
	onInputChange,
	onSubmit,
}: SearchBarProps) => {
	return (
		<div className="relative">
			{showWarning && (
				<div className="absolute -top-6 left-0 right-0 text-red-500 text-sm">
					You can't add more items. The limit of {maxItems} has been reached.
				</div>
			)}
			<form onSubmit={onSubmit} className="flex items-center space-x-2">
				<Input
					type="text"
					placeholder="Enter stock/company name..."
					className={`flex-grow ${
						isDarkMode
							? "bg-gray-700 text-white border-gray-600"
							: "bg-white text-gray-800 border-gray-300"
					} focus:border-blue-500 transition-colors duration-200`}
					value={inputValue}
					onChange={(e) => onInputChange(e.target.value)}
				/>
				<Button
					type="submit"
					size="icon"
					className={`${
						isDarkMode
							? "bg-blue-500 hover:bg-blue-600"
							: "bg-blue-600 hover:bg-blue-700"
					}`}
				>
					<Send className="h-4 w-4" />
				</Button>
			</form>
		</div>
	);
};

export default SearchBar;
