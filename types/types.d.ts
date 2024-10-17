declare namespace Materia {
	interface Qset {

	}
}

declare namespace Materia.CreatorCore {
	interface Widget {
		uses_prompt_generation?: '0' | '1',
	}

	interface WidgetInstance {
		widget: Widget,
	}

	interface MediaData {
		name: string,
		mine: string,
		ext: string,
		size: number,
		src: any,
	}

	interface Callbacks {
		initNewWidget: (widget: Widget, baseUrl: string, mediaUrl: string) => void,
		initExistingWidget: (widgetInstance: WidgetInstance, title: string, qset: Qset, qsetVersion: number, baseUrl: string, mediaUrl: string) => void,
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

declare namespace Materia.PlayerCore {

}
