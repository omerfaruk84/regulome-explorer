exports.config =
  # See docs at http://brunch.readthedocs.org/en/latest/config.html.
  modules:
    definition: false
    wrapper: (path, data) ->
      """
(function() {
  'use strict';
  #{data}
}).call(this);\n\n
      """
  paths:
    public: '_public'
  files:
    javascripts:
      defaultExtension: 'js'
      joinTo:
        'js/app.js': /^app/
        'js/vendor.js': /^vendor/
      order:
        before: [
	  'vendor/js/vivagraph.js',
          'vendor/js/console-helper.js',
          'vendor/js/jquery-1.7.2.js',
          'vendor/js/underscore-1.3.3.js',
          'vendor/js/backbone-0.9.2.js'
        ]

    stylesheets:
      defaultExtension: 'styl'
      joinTo: 
        'css/app.css': /^(app|vendor)/
      order:
        before: ['vendor/css/normalize.css']
        after: ['vendor/css/helpers.css']

    templates:
      defaultExtension: 'hbs'
      joinTo: 'js/app.js'

  # minify: true
