/**
 * Documentation: Writing Plugins
 * @see https://github.com/lukeed/taskr#plugin
 * @see https://github.com/lukeed/taskr#external-plugins
 */
function render(opts) {
	return opts
}

module.exports = function (task/* utils */) {
	// Promisify before running else repeats per execution
	// Const render = utils.promisify(foo.bar);

	// Option #1
	task.plugin('sharp', {}, function * (file, opts) {
		// console.log('a single file object', file); // Gives => { base, dir, data }
		// console.log('user-provided config', opts); // Gives => null || {}
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
