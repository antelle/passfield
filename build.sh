#!/bin/sh
# compiles js and css

echo "Building PassField..."

echo "Compiling js..."
java -jar ~/Closure/compiler-latest/compiler.jar --js passfield.js --js_output_file ../build-v1/passfield.min.js --charset UTF-8

echo "Compiling css..."
java -jar ~/YUI/yuicompressor-2.4.8pre.jar passfield.css --charset utf-8 --nomunge | sed 's/}/}\
/g' | sed '/^$/d' > ../build-v1/passfield.min.css

echo "Copying images..."
cp -f *.png ../build-v1/

echo "Copying to site..."
cp -f ../build-v1/*.* ../site/passfield/

echo "Done"
