export interface Args {
	limit?: number;
	offset?: number;
	query?: string;
	sortDirection?: "ASC" | "DESC";
	sortField?: string;
}
