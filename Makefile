HASH := $(shell openssl dgst -sha384 -binary scripts/main.js | base64)

all:
	sed -r -i -e 's|"sha384-.+"|"sha384-$(HASH)"|g' index.html
