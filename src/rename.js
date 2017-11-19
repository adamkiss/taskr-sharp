// This file has been completely stolen from https://github.com/caseyWebb/taskr-rename/
// Except I need to use it out of Taskr context
'use strict'

const path = require('path')

module.exports = (file, opts) => {
	const rFile = {}

	if (typeof opts === 'function') {
		const dirname = file.dir
		const extname = path.extname(file.base)
		const basename = path.basename(file.base, extname)

		// values should be modified by reference
		const f = {dirname, extname, basename}
		opts(f)

		rFile.dir = path.resolve(dirname, f.dirname)
		rFile.base = f.basename + f.extname
	} else {
		const oldextname = path.extname(file.base)
		const oldbasename = path.basename(file.base, oldextname)

		const dir = opts.dirname || ''
		const prefix = opts.prefix || ''
		const suffix = opts.suffix || ''
		const extname = opts.extname || oldextname
		const basename = opts.basename || oldbasename

		rFile.dir = path.join(file.dir, dir)
		rFile.base = prefix + basename + suffix + extname
	}
	return {dir: rFile.dir, base: rFile.base}
}
