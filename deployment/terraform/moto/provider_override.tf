# Copy this file into an environment directory to point Terraform at a local moto
# server instead of AWS:
#
#   cp ../../moto/provider_override.tf .
#
# Terraform merges *_override.tf on top of the real provider configuration, so the
# checked in provider block stays untouched.
provider "aws" {
  region                      = "us-east-1"
  access_key                  = "test"
  secret_key                  = "test"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true
  s3_use_path_style           = true

  endpoints {
    cloudfront = "http://127.0.0.1:5000"
    iam        = "http://127.0.0.1:5000"
    s3         = "http://127.0.0.1:5000"
    sts        = "http://127.0.0.1:5000"
  }
}
