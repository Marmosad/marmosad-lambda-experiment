tsc
zip -r dist.zip ./*
aws lambda update-function-code --function-name createBoard --no-publish --zip-file fileb://dist.zip
