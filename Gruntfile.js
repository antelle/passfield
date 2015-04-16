module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        qunit: {
            all: ["test/**/unit-tests.html"]
        },
        clean: {
            src: ["dist/css/", "dist/js/", "dist/img/", ".site/passfield"]
        },
        uglify: {
            options: {
                banner: "/*! <%= pkg.name %> v<%= pkg.version %>  | (c) <%= grunt.template.today('yyyy') %> Antelle | https://github.com/antelle/passfield/blob/master/MIT-LICENSE.txt */\n"
            },
            color_picker: {
                files: {
                    "dist/js/passfield.min.js": ["js/*.js"]
                }
            }
        },
        cssmin: {
            compress: {
                files: {
                    "dist/css/passfield.min.css": ["css/*.css"]
                }
            }
        },
        copy: {
            img: {
                files: [
                    { expand: true, src: ["img/*.jpg", "img/*.png"], dest: "dist/" }
                ]
            },
            site: {
                files: [
                    { expand: true, flatten: true, src: ["dist/img/*.jpg", "dist/img/*.png"], dest: ".site/passfield/img/" },
                    { expand: true, flatten: true, src: "dist/js/*.js", dest: ".site/passfield/js/" },
                    { expand: true, flatten: true, src: "dist/css/*.css", dest: ".site/passfield/css/" }
                ]
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-qunit");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks("grunt-contrib-copy");

    grunt.registerTask("default", ["qunit", "clean", "uglify", "cssmin", "copy"]);

};
