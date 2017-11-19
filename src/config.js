'use strict'

const minimatch = require('minimatch')
const {toArray} = require('./utils')

const defaultTransform = {
	rename: {},
	process: i => i
}

/* Config is:
	- object (associative array) of match:[array|single]object pairs
*/
module.exports = (config, options) => {
	const transforms = []

	// eslint-disable-next-line guard-for-in
	for (const match in config) {
		const matchTransforms = toArray(config[match])
		matchTransforms.forEach(trsf => {
			transforms.push(Object.assign({
				glob: match, matches: file => minimatch(file, match)
			}, defaultTransform, trsf))
		})
	}

	return transforms
}
