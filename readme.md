# taskr-sharp [![Build Status][travis-img]][travis-link]


> Process images with Sharp

## Usage

``` javascript
exports.scripts = function * (task) {
  yield task.source('images/**/*.*').sharp({

    /* Example with photos for gallery and backup of suffixed originals */
    '**/photos/*.*': [{
      rename: {suffix: '-thumb'},
      process: i => i.resize(null, 400).jpeg({ quality: 40 })
    }, {
      rename: {suffix: '-detail'}
      process: i => i.resize(1200).jpeg({ quality: 90 })
    }, {
      rename: {prefix: '-orig'}
    }],

    /* Responsive images, different directories */
    '**/responsive-images/*.*': [{
      rename: {dirname: '@1x'}
      process: i => i.resize(600,200).crop().jpeg({quality: 40})
    }, {
      rename: {dirname: '@2x'}
      process: i => i.resize(1200,400).crop().jpeg({quality: 60})
    }, {
      rename: {dirname: '@3x'}
      process: i => i.resize(1800,600).crop().jpeg({quality: 60})
    }, {
      rename: {dirname: 'full'}
      process: i => i.resize(2400,800).crop().jpeg({quality: 85})
    }]
  }).target('dist/images');
}
```

## API

### .sharp(rules, opts)

`Rules` is an object of k/v pairs, where key is glob to match files: **files are matched against full path**, and value is an array of objects of `process` function and `rename` object/function - both are optional, but **at least one must be supplied**.

`Options` is an object, which currently has only one setting: `passUnmatched`, which is self explanatory and by default is `true`. Switch it by:

``` javascript
yield task.sharp(sharpConfig, {passUnmatched: false})
```

### {process}

Process function receives one argument - sharp promise created from the taskr Buffer, and should return the same. With sharps chaining API and ES6, this allows for very simple functions:

``` javascript
const exampleCall = { process: src => src.resize().crop().background().embed() }
```

You can use full [API of Sharp][sharp-docs] in your functions.

If you don't supply a process function, input buffer will just pass through unchanged (useful if you want to keep original, but renamed, for instance).

**Note: files processed with Sharp have `_sharp` property defined as `true`, so if you want e.g. all files minified, you can optimise only images without it (as Sharp runs optimisations on generated files by default)**

### {rename}

When renaming, you either supply an object with any of the following values: 

``` javascript
const exampleRename = {
  dir: 'directory',
  prefix: 'before-base-name-',
  suffix: '-after-base-name',
  extname: '.jpeg',
  basename: 'newname'
}
```

I prefer this, since for many usecases, setting prefix/suffix is the most you'll need.

Other option is to supply a function, which receives object with dirname, extname and basename and should be modified by reference:

``` javascript
f = {dirname: '/path/to', basename: 'image', extname: '.jpg'}
function rename(f){
  f.basename = 'newname';
}
```

## License

MIT &copy; [Adam Kiss](https://adamkiss.com)

[travis-link]: https://travis-ci.org/adamkiss/taskr-sharp
[travis-img]: https://travis-ci.org/adamkiss/taskr-sharp.svg?branch=master
[sharp-docs]: http://sharp.pixelplumbing.com
