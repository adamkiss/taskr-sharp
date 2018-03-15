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
			yield task.clear(tmp).source(`${dir}/*.@(png|svg)`).target(tmp)

			const arr = yield task.$.expand(`${tmp}/*.*`)
			t.is(arr.length, 2, 'copied two files to target tar')
		}
	})

	t.true('sharp' in taskr.plugins)

	return taskr.start()
})

test('rename files correctly', t => {
	t.plan(6)

	const taskr = create({
		* default(task) {
			const tmp = tmpDir('tmp2')
			const tmpName = name => `${tmp}/${name}`

			yield task
				.clear(tmp) // Cleanup
				.source(`${dir}/*.@(png|svg)`)
				.sharp({
					'**/*.svg': [{
						process: i => i,
						rename: {prefix: 'renamed-', suffix: '-svg1', extname: '.ext'}
					}, {
						process: i => i,
						rename: n => {
							n.dirname = 'newdir'
							return n
						}
					}],
					'**/*.png': [{
						process: i => i,
						rename: {dirname: 'newdir'}
					}, {
						process: i => i,
						rename: n => {
							n.extname = '.ext'
							n.basename = 'renamed-octocat-png1'
							return n
						}
					}],
					'**/*.*': [{
						process: i => i,
						rename: {prefix: 'last-rule-'}
					}]
				})
				.target(tmp)

			const arr = yield task.$.expand(`${tmp}/**/*.*`)
			t.is(arr.length, 6, 'generated six files')
			t.is(arr[0], tmpName('last-rule-octocat.png'), 'file 1 is correct')
			t.is(arr[2], tmpName('newdir/octocat.png'), 'file 3 is correct')
			t.is(arr[3], tmpName('newdir/octocat.svg'), 'file 4 is correct')
			t.is(arr[4], tmpName('renamed-octocat-png1.ext'), 'file 5 is correct')
			t.is(arr[5], tmpName('renamed-octocat-svg1.ext'), 'file 6 is correct')
		}
	})

	return taskr.start()
})

test('rename files without process', t => {
	t.plan(1)

	const taskr = create({
		* default(task) {
			const tmp = tmpDir('tmp5')
			yield task
				.clear(tmp) // Cleanup
				.source(`${dir}/*.@(png|svg)`)
				.sharp({
					'**/octocat.svg': [{
						rename: {suffix: '-renamed'}
					}]
				}, {
					passUnmatched: false
				})
				.target(tmp)

			const arr = yield task.$.expand(`${tmp}/*.*`)
			t.is(arr.length, 1, 'renamed one file')
		}
	})

	return taskr.start()
})

test('skip unmatched files', t => {
	t.plan(1)

	const taskr = create({
		* default(task) {
			const tmp = tmpDir('tmp3')
			yield task
				.clear(tmp) // Cleanup
				.source(`${dir}/*.@(png|svg)`)
				.sharp({
					'**/octocat.png': [{
						process: i => i,
						rename: {suffix: '-renamed'}
					}, {
						process: i => i.negate(),
						rename: {suffix: '-negated'}
					}, {
						process: i => i.greyscale().gamma(),
						rename: {suffix: '-greyscale'}
					}]
				}, {
					passUnmatched: false
				})
				.target(tmp)

			const arr = yield task.$.expand(`${tmp}/*.*`)
			t.is(arr.length, 3, 'copied only matched files to target')
		}
	})

	return taskr.start()
})

test('pass unmatched files', t => {
	t.plan(1)

	const taskr = create({
		* default(task) {
			const tmp = tmpDir('tmp4')
			yield task
				.clear(tmp) // Cleanup
				.source(`${dir}/*.@(png|svg)`)
				.sharp({
					'**/octocat.png': [{
						process: i => i.negate(),
						rename: {suffix: '-renamed'}
					}]
				}, {
					passUnmatched: true
				})
				.target(tmp)

			const arr = yield task.$.expand(`${tmp}/*.*`)
			t.is(arr.length, 2, 'copied matched and unmatched files to target')
		}
	})

	return taskr.start()
})

test('correctly rename files without transform', t => {
	t.plan(3)

	const taskr = create({
		* default(task) {
			const tmp = tmpDir('tmp6')
			let sourceFiles = new Map()

			yield task
				.clear(tmp) // Cleanup
				.source(`${dir}/*.@(png|svg)`)
				.run({every: false}, function*() {
					task._.files.forEach(f => {
						sourceFiles.set(f.base, f.data)
					})
				})
				.sharp({
					'**/*': [{rename: {}}]
				})
				.run({every: false}, function*() {
					task._.files.forEach(f => {
						t.is(f.data, sourceFiles.get(f.base), `contents of ${f.base} match`)
					})
				})
				.target(tmp)

			const arr = yield task.$.expand(`${tmp}/*.*`)
			t.is(arr.length, 2, 'copied files without change')
		}
	})

	return taskr.start()
})

test('tag sharp generated files with _sharp', t => {
	t.plan(4)

	const taskr = create({
		* default(task) {
			const tmp = tmpDir('tmp7')

			yield task
				.clear(tmp) // Cleanup
				.source(`${dir}/*.@(png|svg)`)
				.sharp({
					'**/*.png': [{
						rename: {suffix: '-renamed'}
					}, {
						process: i => i.negate(),
						rename: {suffix: '-changed'}
					}]
				})
				.run({every: false}, function*() {
					task._.files.forEach(f => {
						switch (f.base) {
							case 'octocat-renamed.png':
								t.is('_sharp' in f, false, 'unprocessed file is ignored')
								break
							case 'octocat.svg':
								t.is('_sharp' in f, false, 'unmatched file is ignored')
								break
							case 'octocat-changed.png':
								t.is(f._sharp, true, 'generated file is tagged')
								break
							default:
						}
					})
				})
				.target(tmp)

			const arr = yield task.$.expand(`${tmp}/*.*`)
			t.is(arr.length, 3, 'copied files without change')
		}
	})

	return taskr.start()
})
