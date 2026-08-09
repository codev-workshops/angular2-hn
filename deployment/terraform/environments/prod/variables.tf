variable "region" {
  description = "Region hosting the site bucket."
  type        = string
  default     = "us-east-1"
}

variable "bucket_name" {
  description = "Globally unique bucket name for this environment."
  type        = string
}

variable "enable_cloudfront" {
  description = "Set to false when validating against a mock AWS endpoint without origin access control support."
  type        = bool
  default     = true
}
