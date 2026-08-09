output "bucket_name" {
  description = "Name of the bucket holding the built site."
  value       = aws_s3_bucket.site.id
}

output "bucket_arn" {
  description = "ARN of the bucket holding the built site."
  value       = aws_s3_bucket.site.arn
}

output "distribution_id" {
  description = "CloudFront distribution id, used for cache invalidation."
  value       = try(aws_cloudfront_distribution.site[0].id, null)
}

output "distribution_domain_name" {
  description = "Public domain name of the distribution."
  value       = try(aws_cloudfront_distribution.site[0].domain_name, null)
}
