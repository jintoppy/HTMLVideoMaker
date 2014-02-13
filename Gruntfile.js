/*global module:false*/
module.exports = function(grunt) {

  var meta = {
    banner: '/*\n  <%= pkg.title || pkg.name %> <%= pkg.version %>' +
      '<%= pkg.homepage ? " <" + pkg.homepage + ">" : "" %>' + '\n' +
      '  Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>' +
      '\n\n  Released under <%= _.pluck(pkg.licenses, "type").join(", ") %> License\n*/\n',
    pre: '\n(function(window, document, undefined){\n\n',
    post: '\n})(window,document);'
  };

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      dist: {
        src: ['src/moviemaker.js'],
        dest: 'src/moviemaker.<%= pkg.version %>.min.js'
      },
      options: {
        banner: meta.banner
      }
    },

    bytesize: {
      all: {
        src: [
          'src/moviemaker.<%= pkg.version %>.min.js'
        ]
      }
    }

  });


  // Load tasks
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-bytesize');
  
  // Default task.
  grunt.registerTask('default', ['uglify', 'bytesize']);

};