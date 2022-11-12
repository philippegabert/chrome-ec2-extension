mkdir tmp
cp -R _locales tmp/
cp -r images tmp/
cp -r scripts tmp/
cp -r styles tmp/
cp *.html tmp/
cp manifest.json tmp/

cd tmp/
zip -r ../extension.zip *
cd ..

rm -rf tmp/