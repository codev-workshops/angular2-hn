module "site" {
  source = "../../modules/static-site"

  name              = var.bucket_name
  environment       = "dev"
  enable_cloudfront = var.enable_cloudfront
}
