module.exports = {
  presets: [
    [
      require('@babel/preset-env'),
      {
        targets: {
          node: 'current'
        }
      }
    ]
  ],
  ignore: [
    'dist/**/*.js',
    'packages/**/*.js'
  ]
}
