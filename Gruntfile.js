module.exports = function(grunt) {
    grunt.registerTask("default", ["qunit_junit", "qunit"]);
    grunt.loadNpmTasks("grunt-contrib-qunit");
    //grunt.loadNpmTasks('grunt-qunit-istanbul');
    grunt.initConfig({
        qunit: {
            all: ["Website/src/html/*.html"],
            options: {
                console: false
            }
        },
        qunit_junit: {
            options: {
                dest: "Website/test/QUnit/report/"
            }
        }
    });
    grunt.loadNpmTasks("grunt-qunit-junit");
};