const join = require('path').join
const Taskr = require('taskr')
const reporter = require('taskr/lib/reporter')

const dir = join(__dirname, 'test', 'fixtures')
const plugins = [require('@taskr/clear'), require('.')]

const tmpDir = str => join(__dirname, str)
const create = tasks => new Taskr({tasks, plugins})

const taskr = create({
	* default(task) {
		const tmp = tmpDir('tmp1')
		yield task.clear(tmp) // Cleanup
		yield task.source(`${dir}/*.@(png|svg)`).sharp({
			'**/*.png': [{
				rename: {suffix: '-negate'},
				process: i => i.negate()
			}, {}],
			'**/*.svg': [{
				rename: {suffix: '-svg-negate', extname: '.png'},
				process: i => i.png().negate()
			}, {}]

		}).run({every: false}, function*(files) {
			console.log(files.length)
		}).target(tmp)
	}
})
reporter.call(taskr)

taskr.start()
