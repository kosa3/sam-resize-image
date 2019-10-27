sam-validate:
	sam validate -t sam.yaml

sam-deploy:
	tsc resize-image/app.ts; \
	sam package \
	--template-file sam.yaml \
	--s3-bucket sam-resize-image \
	--output-template-file packaged.yaml; \
	sam deploy \
	--template-file packaged.yaml \
	--stack-name sam-resize-image \
	--parameter-overrides Env=dev \
	--no-fail-on-empty-changeset \
	--capabilities CAPABILITY_NAMED_IAM;