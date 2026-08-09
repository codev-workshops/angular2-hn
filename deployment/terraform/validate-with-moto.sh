#!/usr/bin/env bash
# Full init -> validate -> plan -> apply -> read back -> destroy cycle for one
# environment against a local moto server.
#
#   moto_server -H 127.0.0.1 -p 5000 &
#   ./validate-with-moto.sh dev
set -euo pipefail

ENVIRONMENT="${1:-dev}"
MOTO_URL="${MOTO_URL:-http://127.0.0.1:5000}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_DIR="$ROOT/environments/$ENVIRONMENT"

export AWS_ENDPOINT_URL="$MOTO_URL"
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1

curl -fsS -o /dev/null "$MOTO_URL/moto-api/" || {
  echo "moto is not reachable at $MOTO_URL; start it with: moto_server -H 127.0.0.1 -p 5000" >&2
  exit 1
}

cp "$ROOT/moto/provider_override.tf" "$ENV_DIR/provider_override.tf"
trap 'rm -f "$ENV_DIR/provider_override.tf"' EXIT

cd "$ENV_DIR"
terraform init -input=false
terraform fmt -check -recursive "$ROOT"
terraform validate
terraform plan -input=false -out=tfplan
terraform apply -input=false tfplan

BUCKET="$(terraform output -raw bucket_name)"
DISTRIBUTION="$(terraform output -raw distribution_id)"

echo "== bucket public access block"
aws s3api get-public-access-block --bucket "$BUCKET"
echo "== bucket versioning"
aws s3api get-bucket-versioning --bucket "$BUCKET"
echo "== bucket encryption"
aws s3api get-bucket-encryption --bucket "$BUCKET"
echo "== bucket policy"
aws s3api get-bucket-policy --bucket "$BUCKET" --query Policy --output text
echo "== distribution"
aws cloudfront get-distribution --id "$DISTRIBUTION" \
  --query 'Distribution.DistributionConfig.{Root:DefaultRootObject,Origin:Origins.Items[0].DomainName,Errors:CustomErrorResponses.Items[].{code:ErrorCode,response:ResponseCode,path:ResponsePagePath},Behaviors:CacheBehaviors.Items[].{pattern:PathPattern,ttl:DefaultTTL},DefaultTTL:DefaultCacheBehavior.DefaultTTL}'

terraform destroy -input=false -auto-approve
rm -f tfplan
