variable "name" {
  description = "Base name used for the bucket and CloudFront comment, e.g. angular2-hn-dev."
  type        = string
}

variable "environment" {
  description = "Environment this stack belongs to (dev, prod)."
  type        = string
}

variable "index_document" {
  description = "Object served for the site root and for SPA rewrites."
  type        = string
  default     = "index.html"
}

variable "price_class" {
  description = "CloudFront price class."
  type        = string
  default     = "PriceClass_100"
}

variable "immutable_path_patterns" {
  description = <<-EOT
    Path patterns whose objects are content hashed by the Angular build and can be
    cached indefinitely by CloudFront.
  EOT
  type        = list(string)
  default     = ["*.js", "*.css", "/assets/*"]
}

variable "default_ttl" {
  description = "Default TTL (seconds) for the catch-all behaviour, which serves index.html and the service worker."
  type        = number
  default     = 0
}

variable "immutable_ttl" {
  description = "TTL (seconds) for hashed build artefacts."
  type        = number
  default     = 31536000
}

variable "enable_cloudfront" {
  description = <<-EOT
    Create the CloudFront distribution, its origin access control and the bucket
    policy that grants it read access. Set to false when validating against a mock
    AWS endpoint that does not implement origin access control.
  EOT
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags applied to every resource."
  type        = map(string)
  default     = {}
}
