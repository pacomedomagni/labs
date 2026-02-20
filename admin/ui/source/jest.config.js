const { defaults: jestNgPreset } = require('jest-preset-angular/presets');

module.exports = {
	coverageDirectory: 'coverage',
	coverageReporters: ['lcov', 'text-summary', 'cobertura'],
	preset: 'jest-preset-angular',
	globalSetup: 'jest-preset-angular/global-setup',
	setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
	moduleNameMapper: {
		'@modules/(.*)': `<rootDir>/src/app/modules/$1`,
		'autoSpy': '<rootDir>/src/auto-spy.ts',
		'^quill$': ['<rootDir>/node_modules/quill/dist/quill.js']
	},
	reporters: [
		'default',
		[
			'jest-junit', { outputDirectory: 'coverage/test-results', outputName: 'Tests.xml' },
		],
		[
			'jest-html-reporter', { outputPath: 'coverage/unit-test-results/Tests.html', pageTitle: 'Unit Tests', includeFailureMsg: true },
		]
	],
	transform: {
		'^.+\\.(ts|html|svg)$': 'jest-preset-angular',
	},
	transformIgnorePatterns: []
};
