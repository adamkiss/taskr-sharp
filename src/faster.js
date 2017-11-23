/**
 * Documentation: Writing Plugins
 * @see https://github.com/lukeed/taskr#plugin
 * @see https://github.com/lukeed/taskr#external-plugins
 */

const {relative, join} = require('path')
const sharp = require('sharp')
const multimatch = require('multimatch')

const utils = require('./utils')
const flattenConfig = require('./config')
const rename = require('./rename')

const defaultOpts = {
	errorOnOverwrite: false,
	withoutEnlargement: true,
	passUnmatched: true
}

function transformPromise(transform, sharpPromise, file) {
	return transform
		.process(sharpPromise).toBuffer()
		.then(data => Object.assign(rename(file, transform.rename), {data}))
}

module.exports = function (task) {
	const err = str => utils.err(str, task)
	const warn = str => utils.warn(str, task)

	task.plugin('sharp', {every: false}, function * (files, config = {}, opts = {}) {
		// Prepare stuff, fix bad config, etc.
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

		// Modify Taskr array of files to object `relPath: TaskrFile` pairs
		// And also get an array of pure relative paths
		const files_map = new Map(files.map(
			f => [relative(task.root, join(f.dir, f.base)), f]
		))
		const files_list = Array.from(files_map.keys())
		const globs_unmatched = ['**/*']
		const files_transformed = []

		utils.stats.total = files_list.length
		Object.keys(config).forEach(glob => {
			globs_unmatched.push(`!${glob}`)

			const matched_files = multimatch(files_list, glob)
			for (let i = 0; i < matched_files.length; i++) {
				const file = files_map.get(matched_files[i])
				const sharpData = sharp(file.data).gamma()

				for (let j = 0; j < config[glob].length; j++) {
					files_transformed.push(
						transformPromise(config[glob][j], sharpData.clone(), file)
					)
					utils.stats.created++
				}
			}
		})
		const files_unmatched = multimatch(files_list, globs_unmatched)

		// utils.stats.matched = Object.values(transformsGlobs).map(i => i).length
		// utils.stats.unmatched = Object.keys(transformsGlobs).length - utils.stats.matched

		// Output files
		this._.files = yield Promise.all(files_transformed)
		console.log(this._.files.length)
		if (opts.passUnmatched) {
			const fu = files_unmatched.map(f => files_map.get(f))
			this._.files = this._.files.concat(fu)
		}
		console.log(this._.files.length)

		// return true
	});
};
