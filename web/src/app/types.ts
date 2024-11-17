export interface ResearchItem {
	name: string;
	summary: string;
	analysis?: AnalysisData;
	status?: string;
}

export interface AnalysisData {
	base_ncav: number;
	final_ncav: number;
	adjustments: number;
	adjustment_reasons: string[];
	initial_research: string;
	final_analysis: string;
}

export interface WebSocketMessage {
	status: "completed" | "finalizing" | string;
	message: string;
	data: Partial<AnalysisData>;
}
