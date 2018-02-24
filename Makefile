tist:
	@yarn lint && \
	yarn test

setup:
	@npm install yarn -g && \
	yarn install && \
	make test && \
	echo "Everything is fine. You can run 'make start' to start the app."

start:
	@yarn start

test:
	@yarn test

lint:
	@yarn lint
