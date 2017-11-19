const join = require('path').join
const Taskr = require('taskr')
const test = require('ava')

const dir = join(__dirname, 'fixtures')
const plugins = [require('@taskr/clear'), require('../src/')]

const tmpDir = str => join(__dirname, str)
const create = tasks => new Taskr({tasks, plugins})

test('attach `sharp` to taskr and task', t => {
	t.plan(3)

	const taskr = create({
		* default(task) {
			t.true('sharp' in task)

			const tmp = tmpDir('tmp1')
			yield task.source(`${dir}/*.@(png|svg)`).target(tmp)

			const arr = yield task.$.expand(`${tmp}/*.*`)
			t.is(arr.length, 2, 'copied two files to target tar')
			yield task.clear(tmp) // Cleanup
		}
	})

	t.true('sharp' in taskr.plugins)

	return taskr.start()
})
