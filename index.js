/**
 * Documentation: Writing Plugins
 * @see https://github.com/lukeed/taskr#plugin
 * @see https://github.com/lukeed/taskr#external-plugins
 */
module.exports = function (task, utils) {
	// Promisify before running else repeats per execution
	// Const render = utils.promisify(foo.bar);

	// Option #1
	task.plugin('taskr-sharp', {/* every:true, files:true */}, function * (file, opts) {
		console.log('a single file object', file); //=> { base, dir, data }
		console.log('user-provided config', opts); //=> null || {}
		yield render(opts);
	});

	// Option #2
	/*
		task.plugin({
			name: 'taskr-sharp',
			every: true,
			files: true,
			*func(file, opts) {
				// ...same
			}
		});
	 */
};
