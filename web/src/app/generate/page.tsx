"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Moon, Send, Sun, Trash2 } from "lucide-react";
import Image from "next/image";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import logo from "../../../public/logo.png";

interface ResearchItem {
	name: string;
	summary: string;
	analysis?: AnalysisData;
	status?: string;
}

interface AnalysisData {
	base_ncav: number;
	final_ncav: number;
	adjustments: number;
	adjustment_reasons: string[];
	initial_research: string;
	final_analysis: string;
}

interface WebSocketMessage {
	status: "completed" | "finalizing" | string;
	message: string;
	data: Partial<AnalysisData>;
}

const MAX_HISTORY_ITEMS = 11;
const WS_URL = "ws://127.0.0.1:8000/ws/analysis";

// Custom hook for WebSocket management
const useWebSocket = (onMessage: (data: WebSocketMessage) => void) => {
	const [ws, setWs] = useState<WebSocket | null>(null);

	useEffect(() => {
		const socket = new WebSocket(WS_URL);

		socket.onopen = () => {
			console.log("WebSocket Connected");
		};

		socket.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				onMessage(data);
			} catch (error) {
				console.error("Error parsing WebSocket message:", error);
			}
		};

		socket.onerror = (error) => {
			console.error("WebSocket error:", error);
		};

		socket.onclose = () => {
			console.log("WebSocket disconnected");
		};

		setWs(socket);
	}, [onMessage]);

	const sendMessage = useCallback(
		(message: string) => {
			if (ws?.readyState === WebSocket.OPEN) {
				ws.send(message);
			}
		},
		[ws],
	);

	return { sendMessage };
};

export default function FinanceHelper() {
	const [isDarkMode, setIsDarkMode] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const [currentResearch, setCurrentResearch] = useState<ResearchItem | null>(
		null,
	);
	const [dataHistory, setDataHistory] = useState<ResearchItem[]>([]);
	const [showWarning, setShowWarning] = useState(false);

	const handleWebSocketMessage = useCallback(
		(message: WebSocketMessage) => {
			// @ts-ignore
			const updatedResearch: ResearchItem = {
				...currentResearch,
				status: message.status,
			};

			if (message.status === "completed" && message.data) {
				updatedResearch.analysis = message.data as AnalysisData;
				updatedResearch.summary = `
        Calculated NCAVPS: $${message.data.base_ncav?.toFixed(2) ?? 0}\n
        Adjustments (per share): ${message.data.adjustments?.toFixed(2) ?? 0}\n
        Final NCAVPS: $${message.data.final_ncav?.toFixed(2) ?? 0}\n
        Adjustment Reasons:
        ${message.data.adjustment_reasons?.map((e) => ` - ${e}\n`)}
        `;
			} else {
				updatedResearch.summary = message.message;
			}

			setCurrentResearch(updatedResearch);
		},
		[currentResearch],
	);

	const { sendMessage } = useWebSocket(handleWebSocketMessage);

	useEffect(() => {
		setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
	}, []);

	useEffect(() => {
		document.documentElement.classList.toggle("dark", isDarkMode);
	}, [isDarkMode]);

	const toggleDarkMode = () => {
		setIsDarkMode(!isDarkMode);
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (inputValue.trim()) {
			processResearch(inputValue);
			setInputValue("");
		}
	};

	const processResearch = (name: string) => {
		const normalizedName = name.trim().toLowerCase();

		if (
			currentResearch &&
			currentResearch.name.toLowerCase() === normalizedName
		) {
			updateCurrentResearch(name);
			return;
		}

		const existingItem = dataHistory.find(
			(item) => item.name.toLowerCase() === normalizedName,
		);
		if (existingItem) {
			switchToHistoryItem(existingItem);
		} else {
			if (dataHistory.length >= MAX_HISTORY_ITEMS) {
				setShowWarning(true);
				setTimeout(() => setShowWarning(false), 2000);
				return;
			}
			addNewResearch(name);
			// Send WebSocket message to initiate analysis
			sendMessage(JSON.stringify({ ticker: name }));
		}
	};

	const updateCurrentResearch = (name: string) => {
		setCurrentResearch((prev) =>
			prev
				? {
						...prev,
						summary: `Updating analysis for ${name}... Please wait for the AI to process your request.`,
					}
				: null,
		);
		// Send WebSocket message to update analysis
		sendMessage(JSON.stringify({ action: "update", symbol: name }));
	};

	const addNewResearch = (name: string) => {
		const newItem: ResearchItem = {
			name,
			summary: `Analyzing ${name}... Please wait for the AI to process your request.`,
			status: "initializing",
		};
		if (currentResearch) {
			setDataHistory((prev) => {
				const updatedHistory = [
					currentResearch,
					...prev.filter(
						(item) =>
							item.name.toLowerCase() !== currentResearch.name.toLowerCase(),
					),
				];
				return updatedHistory.length > MAX_HISTORY_ITEMS
					? updatedHistory.slice(0, MAX_HISTORY_ITEMS)
					: updatedHistory;
			});
		}
		setCurrentResearch(newItem);
	};

	const switchToHistoryItem = (item: ResearchItem) => {
		setDataHistory((prev) =>
			prev.filter((i) => i.name.toLowerCase() !== item.name.toLowerCase()),
		);
		if (currentResearch) {
			setDataHistory((prev) => {
				const updatedHistory = [currentResearch, ...prev];
				return updatedHistory.length > MAX_HISTORY_ITEMS
					? updatedHistory.slice(0, MAX_HISTORY_ITEMS)
					: updatedHistory;
			});
		}
		setCurrentResearch(item);
	};

	const deleteHistoryItem = (item: ResearchItem) => {
		setDataHistory((prev) => prev.filter((i) => i.name !== item.name));
	};

	const renderAnalysisContent = () => {
		if (!currentResearch) return null;

		if (currentResearch.status === "completed" && currentResearch.analysis) {
			const {
				initial_research,
				final_analysis,
				adjustment_reasons,
				adjustments,
				base_ncav,
				final_ncav,
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
						<p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
							{initial_research}
						</p>
					</div>
					<div
						className={`${isDarkMode ? "bg-gray-700" : "bg-gray-100"} p-3 rounded-lg transition-colors duration-200`}
					>
						<h3
							className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}
						>
							Final Analysis
						</h3>
						<p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
							{final_analysis}
						</p>
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
									<li key={`${index * 1}`}>{reason}</li>
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

	return (
		<div
			className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-100"} flex flex-col items-center justify-center p-4 transition-colors duration-200`}
		>
			<div className="absolute top-4 right-4">
				<div className="flex items-center space-x-2">
					<Moon
						className={`w-4 h-4 ${isDarkMode ? "text-white" : "text-gray-400"}`}
					/>
					<div className="relative">
						<div
							className={`w-12 h-6 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-gray-300"} transition-colors duration-200`}
						/>
						<div
							className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform duration-200 ${isDarkMode ? "bg-white translate-x-6" : "bg-gray-700 translate-x-0"}`}
						/>
						<Switch
							checked={isDarkMode}
							onCheckedChange={toggleDarkMode}
							className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
						/>
					</div>
					<Sun
						className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-yellow-500"}`}
					/>
				</div>
			</div>
			<div className="relative mb-4 z-10">
				<Image
					src={logo}
					alt="Finance Helper Logo"
					width={100}
					height={100}
					className="rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
				/>
			</div>
			<div
				className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-xl w-full max-w-6xl overflow-hidden transition-colors duration-200`}
			>
				<div
					className={`${isDarkMode ? "bg-gray-700" : "bg-gray-200"} p-4 transition-colors duration-200`}
				>
					<div className="flex justify-between items-center mb-2">
						<div className="w-1/4 text-center">
							<h2
								className={`${isDarkMode ? "text-white" : "text-gray-800"} font-semibold`}
							>
								Data History
							</h2>
						</div>
						<div className="w-3/4 text-center">
							<h2
								className={`${isDarkMode ? "text-white" : "text-gray-800"} font-semibold`}
							>
								Current Research
							</h2>
						</div>
					</div>
					<hr
						className={`${isDarkMode ? "border-gray-600" : "border-gray-300"}`}
					/>
				</div>

				<div className="flex flex-col md:flex-row h-[70vh]">
					{/* Left Container (Data History) */}
					<div
						className={`w-full md:w-1/4 ${isDarkMode ? "bg-gray-700" : "bg-gray-100"} p-4 flex flex-col transition-colors duration-200`}
					>
						<ScrollArea className="flex-grow mb-4">
							<div className="space-y-2">
								{dataHistory.map((item, index) => (
									// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
									<div
										key={`${index * 1}`}
										className={`${isDarkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-white hover:bg-gray-200"} p-2 rounded-lg transition-colors duration-200 cursor-pointer group relative`}
										onClick={() => switchToHistoryItem(item)}
									>
										<h3
											className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-800"} truncate pr-8`}
										>
											{item.name}
										</h3>
										<Button
											variant="ghost"
											size="icon"
											className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
											onClick={(e) => {
												e.stopPropagation();
												deleteHistoryItem(item);
											}}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								))}
							</div>
						</ScrollArea>
						<Button
							variant={isDarkMode ? "secondary" : "default"}
							className="w-full"
						>
							Enlighten me
						</Button>
					</div>

					{/* Right Container (Current Research) */}
					<div
						className={`w-full md:w-3/4 ${isDarkMode ? "bg-gray-800" : "bg-white"} p-4 flex flex-col transition-colors duration-200`}
					>
						{/* Summary and Results area */}
						<div className="flex flex-col md:flex-row h-full">
							{/* Summary and Search area */}
							<div className="w-full md:w-1/3 pr-4 flex flex-col">
								{/* Summary Section */}
								<div
									className={`flex-grow mb-4 ${isDarkMode ? "bg-gray-700" : "bg-gray-100"} p-3 rounded-lg transition-colors duration-200`}
								>
									<h3
										className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-800"} mb-2`}
									>
										Summary
									</h3>
									<p
										className={`${isDarkMode ? "text-gray-300" : "text-gray-600"} text-sm`}
									>
										{currentResearch
											? currentResearch.summary
											: "Enter a stock or company name to begin research."}
									</p>
								</div>

								{/* Search Bar */}
								<div className="relative">
									{showWarning && (
										<div className="absolute -top-6 left-0 right-0 text-red-500 text-sm">
											You can&apos;t add more items. The limit of{" "}
											{MAX_HISTORY_ITEMS + 1} has been reached.
										</div>
									)}
									<form
										onSubmit={handleSubmit}
										className="flex items-center space-x-2"
									>
										<Input
											type="text"
											placeholder="Enter stock/company name..."
											className={`flex-grow ${isDarkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-800 border-gray-300"} focus:border-blue-500 transition-colors duration-200`}
											value={inputValue}
											onChange={(e) => setInputValue(e.target.value)}
										/>
										<Button
											type="submit"
											size="icon"
											className={`${isDarkMode ? "bg-blue-500 hover:bg-blue-600" : "bg-blue-600 hover:bg-blue-700"}`}
										>
											<Send className="h-4 w-4" />
										</Button>
									</form>
								</div>
							</div>

							{/* Results area */}
							<div className="w-full md:w-2/3 mt-4 md:mt-0">
								<ScrollArea className="h-full">
									{renderAnalysisContent()}
								</ScrollArea>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
