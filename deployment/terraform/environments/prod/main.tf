module "site" {
  source = "../../modules/static-site"

  name              = var.bucket_name
  environment       = "prod"
  enable_cloudfront = var.enable_cloudfront
}
