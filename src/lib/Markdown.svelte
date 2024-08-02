<script>
	import { onMount } from 'svelte';
	import { marked } from 'marked';

	export let markdownContent = ``;

	let htmlContent = '';

	function removeLeadingWhitespace(str) {
		const lines = str.split('\n');
		const trimmedLines = lines.map((line) => line.trimStart());
		return trimmedLines.join('\n');
	}

	function makeCheckboxesInteractive() {
		const checkboxes = document.querySelectorAll('input[type="checkbox"]');
		checkboxes.forEach(checkbox => {
			checkbox.disabled = false;
		});

		const checkboxLists = document.querySelectorAll('ul, ol');
		checkboxLists.forEach(list => {
			if (list.querySelector('input[type="checkbox"]')) {
				list.classList.add('checkbox-list');
			}
		});
	}

	onMount(() => {
		const cleanedMarkdown = removeLeadingWhitespace(markdownContent);

		htmlContent = marked(cleanedMarkdown);

		// Run after DOM updates to ensure checkboxes are interactive and lists are styled
		requestAnimationFrame(() => {
			makeCheckboxesInteractive();
		});
	});
</script>

<div class="w-100 stats">{@html htmlContent}</div>
