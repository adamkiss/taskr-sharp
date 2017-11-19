# taskr-sharp

> Process images with Sharp

## Usage

> This an API scratchpad

``` javascript
exports.sharp = function * (task) {
  yield task.source('src/images/**/*')
    .sharp({
      "photos/**/*": [
        {rename: {suffix: '-orig'}},
        {process: i => i.resize(1500).gamma().jpeg({quality: 75})},
        {process: i => i.resize(240).gamma().jpeg({quality: 40}),
         rename: {suffix: '-thumb'}}
      ]
    })
    .target('dist');
}

// Don't use glob as a key, but wrap it in an object?
const opt2 = {
  match: 'photos/**/*',
  sharp: [
    {rename: {suffix: '-orig'}},
    {process: i => i.resize(1500).gamma().jpeg({quality: 75})},
    {process: i => i.resize(240).gamma().jpeg({quality: 40}),
     rename: {suffix: '-thumb'}}
  ]
}
```

## License

MIT &copy; [Adam Kiss](https://adamkiss.com)
