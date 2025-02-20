export interface TextItem {
	id: string;
	text: string;
}

export interface MediaItem {
	id: string;
	text: string;
	imageUrl: string;
}
export class MediaListData {
	label: string = $state('');
	items: MediaItem[] = $state([]);
	constructor(label: string = '', items: MediaItem[] = []) {
		this.label = label;
		this.items = items;
	}
}

// what if we make it:
// in the component file:
// const data = $state({
// 	label: '',
// 	items: [],
// 	selected: 0,
//  get selectedOption() {
// 		return this.items[this.selected];
// 	}
//})
// and then in the node-types.svelte file:
export class ListPickerData {
	label: string = $state('');
	options: string[] = $state(["Option 1", "Option 2", "Option 3"]);
	selected: number = $state(0);
	constructor(label: string = '', options: string[] = ["Option 1", "Option 2", "Option 3"], selected: number = 0) {
		this.label = label;
		this.options = options;
		this.selected = selected;
	}
	get selectedOption() {
		return this.options[this.selected];
	}
}

export class TextNodeData {
	text: string = $state('');
	constructor(text: string = '') {
		this.text = text;
	}
}

export class TextListData {
	label: string = $state('');
	items: TextItem[] = $state([]);
	constructor(label: string = '', items: TextItem[] = []) {
		this.label = label;
		this.items = items;
	}
}
