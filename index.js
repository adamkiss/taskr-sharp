/**
 * Documentation: Writing Plugins
 * @see https://github.com/lukeed/taskr#plugin
 * @see https://github.com/lukeed/taskr#external-plugins
 */

const {relative, join} = require('path')
const utils = require('./src/utils')
const flattenConfig = require('./src/config')
const rename = require('./src/rename')
const sharp = require('sharp')

const defaultOpts = {
	errorOnOverwrite: false,
	withoutEnlargement: true
}

module.exports = function (task) {
	const err = str => utils.err(str, task)
	const warn = str => utils.warn(str, task)

	task.plugin('sharp', {every: false}, function * (files, config = {}, opts = {}) {
		if (!utils.isObject(config)) {
			return err('Configuration must be an object')
		}

		if (utils.isEmptyObject(config)) {
			return warn('No transforms, passing through files unchanged')
		}

		if (files.length === 0) {
			return warn('No source images to process')
		}

		opts = Object.assign({}, defaultOpts, opts)
		const transforms = flattenConfig(config, opts)
		const transformsGlobs = Object.assign({},
			...Object.keys(config).map(k => {
				return {[k]: false}
			})
		)

		// Loop through files
		const transformed = []
		let index = files.length
		while (index--) {
			const file = files.pop()

			const relPath = relative(task.root, join(file.dir, file.base))
			const matched = transforms.filter(t => t.matches(relPath))

			if (!matched.length > 0) {
				continue
			}

			file.data = sharp(file.data).clone()
			let matchIndex = matched.length
			while (matchIndex--) {
				const t = matched[matchIndex]
				transformed.push(Object.assign(rename(file, t.rename), {
					data: yield t.process(file.data).toBuffer()
				},
				))
			}
		}

		// Output files
		this._.files = transformed
	});
};
