module.exports = function (grunt) {
    grunt.registerTask('default', ['qunit_junit', 'qunit']);
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-qunit-istanbul');
    grunt.initConfig({
        qunit: {
            all: ['WebApp/src/html/*.html'],
        },
        qunit_junit: {
            options: {
                dest: 'WebApp/test/QUnit/report/'
            }
        }
    });
    grunt.loadNpmTasks('grunt-qunit-junit');
};