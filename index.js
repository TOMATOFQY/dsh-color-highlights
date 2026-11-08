/**
 * Color Highlights — Host half.
 *
 * Declares the configuration this plugin owns: two per-surface switches. The
 * settings service serves it as the `color-highlights` namespace, so the page on
 * the bundle's page in the Plugins section edits volatile fields and the writes
 * persist in the profile's configuration layer like any other plugin's.
 *
 * The Host also hands the initial values to the page as a global, so the Browser
 * half renders correctly on first paint before the settings mirror answers.
 */

import z from '@deepseek-ai/schemastery';

/** The configuration form the settings service builds for this entry. */
export const Config = z.object({
	chatHighlights: z
		.boolean()
		.default(true)
		.description('Render ==…== highlights in Chat messages.')
		.volatile(),
	markdownHighlights: z
		.boolean()
		.default(true)
		.description('Render ==…== highlights in Markdown file previews.')
		.volatile(),
});

/**
 * Project the live configuration onto the shape the Browser half reads.
 * @param {object} config - the resolved row configuration.
 * @returns {{ chatHighlights: boolean, markdownHighlights: boolean }} page configuration.
 */
function projectConfig(config) {
	return {
		chatHighlights: config.chatHighlights.get() !== false,
		markdownHighlights: config.markdownHighlights.get() !== false,
	};
}

/**
 * Publish the configuration page policy and the initial browser configuration.
 * @param {import('@deepseek-ai/cordis').Context} ctx - Host context.
 * @param {object} config - the resolved row configuration.
 * @returns {void}
 */
export function apply(ctx, config) {
	// This plugin ships its own settings page, so the settings service must not
	// offer a generated one; scoped to this fiber so a reloaded service re-adopts it.
	ctx.inject(['settings'], (child) => {
		child.effect(() => child.settings.configure({ auto: false }, ctx.fiber), 'color-highlights: configuration page policy');
	});
	ctx.on('webserver/index-inject', (table) => {
		table.push({ kind: 'global', name: '__DSH_COLOR_HIGHLIGHTS_CONFIG__', value: projectConfig(config) });
	});
}
