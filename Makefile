test:
	@make lint && \
	echo "====> Running tests..." && \
	yarn test
	echo "====> Done!"

setup:
	@npm install yarn -g && \
	yarn install && \
	make test && \
	echo "Everything is fine. You can run 'make start' to start the app."

start:
	@yarn start

lint:
	@echo "====> Running linter..." && \
	yarn lint && \
	echo "====> Done!"
