<script>
	import { marked } from 'marked';

	let markdownInput = ``;
	let containerRef;

	function renderMarkdown(markdown) {
		return marked(markdown);
	}

	function printCards() {
		const printContents = containerRef.innerHTML;
		const originalStyles = document.body.style.cssText;
		const originalVisibility = Array.from(document.body.children).map(
			(child) => child.style.visibility
		);

		Array.from(document.body.children).forEach((child) => {
			if (child !== containerRef) {
				child.style.visibility = 'hidden';
			}
		});

		window.print();

		Array.from(document.body.children).forEach((child, index) => {
			child.style.visibility = originalVisibility[index];
		});
		document.body.style.cssText = originalStyles;
	}
</script>

<div>
	<textarea
		bind:value={markdownInput}
		rows="10"
		cols="50"
		placeholder="Enter item details in markdown"
	></textarea>
</div>

<button on:click={printCards}>Print Cards</button>

<div class="card-container" bind:this={containerRef}>
	{#each markdownInput.split('####').filter(Boolean) as item}
		<div class="printable-card">
			{@html renderMarkdown(`####${item}`)}
		</div>
	{/each}
</div>

<style lang="scss">
	.card-container {
		display: flex;
		flex-wrap: wrap;
		gap: 1px;
	}

	@media print {
		body {
			// margin: 0; // Remove any default margin applied during printing
			// padding: 0;
			// width: 100%;
			// height: 100%;
		}

		body * {
			visibility: hidden;
		}

		.card-container,
		.card-container * {
			visibility: visible;
		}

		.card-container {
			position: absolute;
			left: 0;
			top: 0;
		}

		body {
			margin: 0;
		}
	}

	:global {
		.printable-card {
			width: 2.5in;
			height: 3.5in;
			padding: 10px;
			border: 1px solid #ddd;
			font-family: 'Arial', sans-serif;
			background-color: white;
			display: flex;
			flex-direction: column;
			justify-content: start;
			page-break-inside: avoid;
			box-sizing: border-box;

			h4 {
				margin: 0;
				font-size: 14px;
				color: #000;
			}

			p,
			li {
				margin: 5px 0;
				font-size: 10px;
				color: #000;
			}

            ul, ol {
                padding-inline-start: 10px;
            }

			hr {
				margin-block-start: 0px;
				margin-block-end: 0px;
				border-width: 0.5px;
				width: 100%;
			}
		}

		@page {
			size: auto; // Prevent scaling
			// margin: 0; // Disable page margins
		}
	}
</style>
