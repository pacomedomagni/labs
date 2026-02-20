const config = {
	...require('./node_modules/@pgr-cla/core-ui-components/tailwind.config.base'),
	...{
		theme: {
			spacing: {
				0: '0',
				'bl-1': '0.4rem',
				'bl-2': '0.8rem',
				'bl-3': '1.0rem',
				xxs: '1.6rem',
				xs: '2.4rem',
				s: '3.2rem',
				m: '4rem',
				l: '4.8rem',
				xl: '5.2rem',
				xxl: '6rem',
				xxxl: '7.2rem',
			}
		}
	}
}

module.exports = {
	...config,
	content: [
		"./src/**/*.{html,ts}",
		"./node_modules/@pgr-cla/core-ui-components/**/*.{html,ts,js,mjs}"
	],
}
