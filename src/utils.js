const relativePath = require('path').relative
const {isObject, isEmptyObj, toArray} = require('taskr/lib/fn')
const logging = require('taskr/lib/utils/logging')

// Statistics (output at the end of each run)
const stats = {
	total: 0,
	matched: 0,
	created: 0,
	unmatched: 0,
	unmatchedBlocked: 0,
	unmatchedPassed: 0
}

// Various type checks
const isString = val => typeof val === 'string'
// Includes isObject & toArray from taskr

// Custom wrapper for logging methods
const moduleName = 'Sharp'
const log = str => logging.log(moduleName, str)
const err = (str, task) => task.emit('plugin_error', {error: str, plugin: moduleName})
const warn = (str, task) => task.emit('plugin_warning', {warning: str, plugin: moduleName})

module.exports = {
	stats,
	log, err, warn,
	isString, isObject, isEmptyObject: isEmptyObj, toArray,
	relativePath
}
