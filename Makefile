tist:
	@yarn lint && \
	yarn test

setup:
	@npm install yarn -g && \
	yarn install && \
	cp -vip .env.sample .env && \
	make tist && \
	echo "Everything is fine. You can run 'make start' to start the app."

start:
	@yarn start

test:
	@yarn test

lint:
	@yarn lint
