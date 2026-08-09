locals {
  tags = merge(var.tags, {
    Environment = var.environment
    Application = "angular2-hn"
    ManagedBy   = "terraform"
  })

  origin_id = "s3-${var.name}"
}

resource "aws_s3_bucket" "site" {
  bucket = var.name
  tags   = local.tags
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket = aws_s3_bucket.site.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_versioning" "site" {
  bucket = aws_s3_bucket.site.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_cloudfront_origin_access_control" "site" {
  count = var.enable_cloudfront ? 1 : 0

  name                              = var.name
  description                       = "OAC for ${var.name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "site" {
  count = var.enable_cloudfront ? 1 : 0

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "angular2-hn ${var.environment}"
  default_root_object = var.index_document
  price_class         = var.price_class
  tags                = local.tags

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = local.origin_id
    origin_access_control_id = aws_cloudfront_origin_access_control.site[0].id
  }

  default_cache_behavior {
    target_origin_id       = local.origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    min_ttl     = 0
    default_ttl = var.default_ttl
    max_ttl     = var.default_ttl

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  dynamic "ordered_cache_behavior" {
    for_each = var.immutable_path_patterns

    content {
      path_pattern           = ordered_cache_behavior.value
      target_origin_id       = local.origin_id
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = ["GET", "HEAD"]
      cached_methods         = ["GET", "HEAD"]
      compress               = true

      min_ttl     = var.immutable_ttl
      default_ttl = var.immutable_ttl
      max_ttl     = var.immutable_ttl

      forwarded_values {
        query_string = false

        cookies {
          forward = "none"
        }
      }
    }
  }

  # Client side routing: unknown paths are served by the SPA shell.
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/${var.index_document}"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/${var.index_document}"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

data "aws_iam_policy_document" "site" {
  count = var.enable_cloudfront ? 1 : 0

  statement {
    sid       = "AllowCloudFrontRead"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.site[0].arn]
    }
  }
}

resource "aws_s3_bucket_policy" "site" {
  count = var.enable_cloudfront ? 1 : 0

  bucket = aws_s3_bucket.site.id
  policy = data.aws_iam_policy_document.site[0].json

  depends_on = [aws_s3_bucket_public_access_block.site]
}
