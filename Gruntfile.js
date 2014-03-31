module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-karma');

  grunt.initConfig({
    simplemocha: {
      options: {
        reporter: 'list'
      },
      
      backend: {
        src: 'test/*.js'
      }
    },
    karma: {
      unit: {
        configFile: 'config/karma.conf.js',
        autoWatch: false,
        singleRun: true
      }
    }
  });

  //Test task
  grunt.registerTask('test', ['simplemocha', 'karma']);
};