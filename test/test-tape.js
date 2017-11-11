const join = require('path').join;
const Taskr = require('taskr');
const test = require('tape');

const dir = join(__dirname, 'fixtures');
const plugins = [require('taskr-clear'), require('../')];

const tmpDir = str => join(__dirname, str);
const create = tasks => new Taskr({ tasks, plugins });

test('taskr-sharp', t => {
	t.plan(3);
	const taskr = create({
		*foo(task) {
			t.true('taskr-sharp' in task, 'attach `taskr-sharp` to Task instance');
			t.true('taskr-sharp' in taskr.plugins, 'attach `taskr-sharp` plugin to instance');
			// example usage test
			const tmp = tmpDir('tmp1');
			yield f.source(`${dir}/*.js`).target(tmp);
			const arr = yield f.$.expand(`${tmp}/*.js`);
			t.equal(arr.length, 1, 'copied one file to target tar');
			yield f.clear(tmp); // cleanup
		}
	});
	taskr.start('foo');
});
