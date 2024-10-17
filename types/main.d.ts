declare namespace Materia {
	// Qset
	interface Qset {
		name?: string | null
		items: Qset | QsetItem[]
		options?: any
	}

	interface QsetItem {
		answers: { id?: string | null, text: string, value: number, options?: any }[],
		questions: { text: string }[]
		id: string | number | null,
		materiaType: 'question',
		type: 'QA' | 'MC' | string,
		options?: any,
	}

	// Media Assets
	interface MediaAsset {
		materiaType: 'asset',
		id: string,
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
		/**
		 * Callback for when a new instance is being created
		 * @param widget Info about the widget and Materia instance the widget originated from
		 */
		initNewWidget: (widget: Widget, baseUrl: string, mediaUrl: string) => void,
		/**
		 * Callback for when an existing instance is being created
		 * @param title Title of widget instance
		 * @param widgetInstance Object containing info about existing widget instance (e.g. name, id)
		 * @param qset Qset of widget instance
		 * @param qsetVersion Qset version of widget instance
		 */
		initExistingWidget: (title: string, widgetInstance: WidgetInstance, qset: Qset, qsetVersion: number, baseUrl: string, mediaUrl: string) => void,
		/**
		 * Callback after user clicks save, before actually saving
		 * @param mode Type of save
		 */
		onSaveClicked: (mode: 'save' | 'publish' | 'preview') => void,
		/**
		 * Callback after save completed
		 * @param instanceName Name of the widget instance
		 * @param widget Object containing widget details
		 * @param qset Qset of widget instance
		 * @param qsetVersion Qset version of widget instance
		 */
		onSaveComplete: (instanceName: string, widget: Widget, qset: Qset, qsetVersion: number) => void,
		/**
		 * Callback after media import has completed
		 * @param arrayOfMedia Array of media
		 */
		onMediaImportComplete?: (arrayOfMedia: any[]) => void,
		/**
		 * Callback after question import has completed
		 * @param arrayOfQuestions Array of imported questions
		 */
		onQuestionImportComplete?: (arrayOfQuestions: any[]) => void,
		/**
		 * Callback when an LLM responds to your prompt request
		 * @param status Whether or not the request had succeeded or failed
		 * @param resp Response from the LLM
		 */
		onPromptResponse?: (status: 'success' | 'failure', resp: string | null) => void
		/**
		 * Adjust the height of the widget based on window.getComputedStyle; Set to false automatically
		 */
		manualResize?: boolean,
	}

	/**
	 * Signal to Materia that the widget has loaded and pass it callback methods for various creator functions.
	 * @param callbacks Object containing all callback methods.
	 */
	function start(callbacks: Callbacks): void

	/**
	 * Display an alert over the entire page.
	 * @param title Title of alert
	 * @param message Message of alert
	 */
	function alert(title: string, message: string): void

	/**
	 * Display Materia’s media importer. The importer will allow the user to upload and choose media files to insert into the widget. To make use of this method, make sure you define a onMediaImportComplete callback with Materia.CreatorCore.start.
	 * @param mediaTypes Array of types of media allowed.
	 */
	function showMediaImporter(mediaTypes: ('jpg' | 'gif' | 'png' | 'mp3')[]): void

	/**
	 * Convert a Materia asset id into a url.
	 * @param mediaId Id of the media file to convert
	 */
	function getMediaUrl(mediaId: string): string

	/**
	 * Send media data directly to the media uploader. Use if the creator has its own file picker or generates media programatically.
	 * @param mediaData Media data object.
	 */
	function directUploadMedia(mediaData: MediaData): void

	/**
	 * Used to inform the user that a save request cannot be fulfilled.
	 * @param message Message to display to the user.
	 */
	function cancelSave(message: string): void

	/**
	 * Inform Materia to save the current widget instance.
	 * @param title Title of the widget instance.
	 * @param qset Qset of the widget instance.
	 * @param qsetVersion
	 */
	function save(title: string, qset: Qset, qsetVersion?: number): void

	/**
	 * Disables automatic resizing of the widget iframe.
	 * @see {@link start}
	 */
	function disableResizeInterval(): void

	/**
	 * Manually set the pixel height of the widget.
	 * @param height Pixel height of the widget.
	 */
	function setHeight(height: number): void

	/**
	 * Utility function for removing html tags from a string.
	 * @param text Text to escape.
	 */
	function escapeScriptTags(text: string): string

	/**
	 * Submit a prompt for a LLM to process. Be sure to have the 'onPromptResponse' callback registered to receive responses. Only available when enabled on the Materia instance.
	 * @param prompt Prompt for LLM.
	 */
	function submitPrompt(prompt: string): void
}

declare namespace Materia.Engine {
	interface StartOptions {
		/**
		 * A function that is called after the instance and qset data has loaded
		 * @param instance Object containing info about existing widget instance (e.g. name, id)
		 * @param qset Qset of the widget instance
		 * @param version Qset version of the widget instance
		 */
		start: (instance: WidgetInstance, qset: Qset, version: number) => void,
		/**
		 * Adjust the height of the widget based on window.getComputedStyle; Set to false automatically
		 */
		manualResize?: boolean,
	}

	/**
	 * Signals that your widget is done loading its assets and passes a callback that will receive widget instance data.
	 * @param options Object containing callback and start options
	 */
	function start(options: StartOptions): void

	/**
	 * Queues a log to send to the server. Logs must conform to certain value constraints.
	 * @param type Log type
	 * @param itemId Item ID that pertains to the log
	 * @param text @TODO
	 * @param value @TODO
	 */
	function addLog(type: number, itemId?: number, text?: string, value?: any): void

	/**
	 * Ask Materia to display a stylized Alert message.
	 * @param title Title of the alert window
	 * @param message Message to display in the alert
	 * @param type @TODO
	 */
	function alert(title: string, message: string, type?: string): void

	/**
	 * Convert a Materia asset id into a url.
	 * @param mediaId Id of the media file to convert
	 */
	function getMediaUrl(mediaId: string): string

	/**
	 * Mark the widget play as finished. No more logs will be accepted after end is called. By default, calling end will jump to the score screen.
	 * @param showScoreScreenAfter Set to false to prevent Materia from jumping to the score screen. Defaults to true.
	 */
	function end(showScoreScreenAfter?: boolean): void

	/**
	 * Request that the engine core immediately sends any pending logs to the server. Automatically called by end.
	 */
	function sendPendingLogs(): void

	/**
	 * Do not use directly
	 * @see {link Materia.Score}
	 */
	function sendStorage(): void

	/**
	 * Disables automatic resizing of the widget iframe.
	 * @see {link start}
	 */
	function disableResizeInterval(): void

	/**
	 * Manually set the pixel height of the widget.
	 * @param height Height in pixels of the widget
	 */
	function setHeight(height: number): void

	/**
	 * Utility function for removing html tags from a string.
	 * @param text Text to escape
	 */
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
