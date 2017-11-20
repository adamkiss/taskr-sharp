/**
 * Documentation: Writing Plugins
 * @see https://github.com/lukeed/taskr#plugin
 * @see https://github.com/lukeed/taskr#external-plugins
 */

const {relative, join} = require('path')
const sharp = require('sharp')

const utils = require('./utils')
const flattenConfig = require('./config')
const rename = require('./rename')

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

			const sharpData = sharp(file.data).gamma()
			let matchIndex = matched.length
			while (matchIndex--) {
				const t = matched[matchIndex]
				transformsGlobs[t.glob] = true
				transformed.push(t
					.process(sharpData.clone()).toBuffer()
					.then(data => Object.assign(rename(file, t.rename), {data}))
				)
				utils.stats.created++
			}
		}

		utils.stats.matched = Object.values(transformsGlobs).map(i => i).length
		utils.stats.unmatched = Object.keys(transformsGlobs).length - utils.stats.matched

		// Output files
		this._.files = yield Promise.all(transformed)
	});
};
