declare namespace Materia {
	// Qset
	interface Qset {
		items: any[]
		options?: any
	}

	// Widget Descriptions
	interface WidgetGeneralDescription {
		api_version: number,
		group: string,
		width: number,
		height: number,
		in_catalog: 'Yes' | 'No',
		is_answer_encrypted: 'Yes' | 'No',
		is_editable: 'Yes' | 'No',
		is_generable?: 'Yes' | 'No',
		uses_prompt_generation?: 'Yes' | 'No',
		is_playable: 'Yes' | 'No',
		is_qset_encrypted: 'Yes' | 'No',
		is_storage_enabled: 'Yes' | 'No',
		name: string,
	}

	interface WidgetMetadataDescription {
		about: string,
		accessibility_description: string,
		accessibility_keyboard: 'Full' | 'Limited' | 'None',
		accessibility_reader: 'Full' | 'Limited' | 'None',
		excerpt: string,
		features: string[],
		supported_data: string[]
	}

	interface WidgetScoreDescription {
		is_scorable: 'Yes' | 'No',
		score_module: string,
		score_screen: 'scoreScreen.html'
	}

	// Widget
	interface Widget {
		clean_name: string,
		creator: string,
		player: string,
		dir: string,
		files: { player: string, creator: string, flash_version: number }
		general: WidgetGeneralDescription
		width: number,
		height: number,
		href: string,
		meta_data: WidgetMetadataDescription,
		score: WidgetScoreDescription
		is_generable?: '0' | '1',
		uses_prompt_generation?: '0' | '1',
	}

	interface WidgetInstance {
		attempts: string,
		clean_name: string,
		close_at: string,
		created_at: number,
		editable: boolean,
		embed_url: string,
		guest_access: boolean,
		width: number,
		height: number,
		id: string,
		is_draft: boolean,
		name: string,
		open_at: string,
		play_url: string,
		preview_url: string,
		qset: Qset,
		user_id: string,
		widget: Widget,
	}
}

declare namespace Materia.CreatorCore {
	interface MediaData {
		name: string,
		mine: string,
		ext: string,
		size: number,
		src: any,
	}

	interface Callbacks {
		initNewWidget: (widget: Widget, baseUrl: string, mediaUrl: string) => void,
		initExistingWidget: (title: string, widgetInstance: WidgetInstance, qset: Qset, qsetVersion: number, baseUrl: string, mediaUrl: string) => void,
		onSaveClicked: (mode: 'save' | 'publish' | 'preview') => void,
		onSaveComplete: (instanceName: string, widget: Widget, qset: Qset, qsetVersion: number) => void,
		onMediaImportComplete?: (arrayOfMedia: any[]) => void,
		onQuestionImportComplete?: (arrayOfQuestions: any[]) => void,
		onPromptResponse?: (status: 'success' | 'failure', resp: string | null) => void
		manualResize?: boolean,
	}

	function start(callbacks: Callbacks): void
	function alert(title: string, message: string): void
	function showMediaImporter(mediaTypes: ('jpg' | 'gif' | 'png' | 'mp3')[]): void
	function getMediaUrl(mediaId: string): string
	function directUploadMedia(mediaData: MediaData): void
	function cancelSave(message: string): void
	function save(title: string, qset: Qset, qsetVersion?: number): void
	function disableResizeInterval(): void
	function setHeight(height: number): void
	function escapeScriptTags(text: string): string
	function submitPrompt(prompt: string): void
}

declare namespace Materia.Engine {
	interface StartOptions {
		start: (instance: WidgetInstance, qset: Qset, version: number) => void,
		manualResize?: boolean,
	}

	function start(options: StartOptions): void
	function addLog(type: number, itemId?: number, text?: string, value?: any): void
	function alert(title: string, message: string, type?: string): void
	function getMediaUrl(mediaId: string): string
	function end(showScoreScreenAfter?: boolean): void
	function sendPendingLogs(): void
	function sendStorage(): void
	function disableResizeInterval(): void
	function setHeight(height: number): void
	function escapeScriptTags(text: string): string
}

declare namespace Materia.Score {
	function submitInteractionForScoring(questionId: string, interactionType: string, value: any): void
	function submitFinalScoreFromClient(questionId: string, userAnswer: string, score: number): void
	function submitQuestionForScoring(questionId: string, userAnswer: string, value?: any): void
	function addGlobalScoreFeedback(message: string): void
	function addScoreData(data: any): void
}

declare namespace Materia.ScoreCore {
	interface ScoreTableItem {
		data: any,
		data_style: string[],
		feedback: string | null,
		graphic: string,
		score: string,
		style: string,
		symbol: string,
		tag: string,
		type: string,
	}

	interface Callbacks {
		start: (instance: WidgetInstance, qset: Qset, scoreTable: ScoreTableItem[], isPreview: boolean, qsetVersion: number) => void
		update: (qset: Qset, scoreTable: ScoreTableItem[]) => void,
		handleScoreDistribution?: (distribution: number[]) => void,
	}

	function start(callbacks: Callbacks): void
	function hideResultsTable(): void
	function hideScoresOverview(): void
	function setHeight(height: number): void
	function getMediaUrl(mediaId: string): string
}

declare namespace Materia.Storage {
	interface MateriaTable {
		getId: () => string,
		init: (id: string, columns: string[]) => void,
		insert: (values: any[]) => void,
		getValues: () => any[][]
	}

	function Table(): MateriaTable
}


declare namespace Materia.Storage.Manager {
	function addTable(tableName: string, columnName: string, ...columnsNames: string[]): void
	function getTable(tableName: string): MateriaTable
	function insert(tableName: string, firstColumnValue: any, ...restColumnsValues: any[]): void
	function clean(name: string): string
}
