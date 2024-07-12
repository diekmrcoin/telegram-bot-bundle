variable "environment" {
  type = string
}

variable "prefix" {
  type = string
}

variable "route53" {
  type = object({
    zone    = string
    zone_id = string
  })
}

locals {
  domain_name = "api.ai-proxy.${var.route53.zone}"
}

module "queue" {
  source      = "./queue"
  prefix      = var.prefix
  environment = var.environment
}

resource "aws_iam_policy" "api_lambda_permissions" {
  name        = "${var.prefix}-${var.environment}-api-lambda-permissions"
  description = "Permissions for the API Lambda"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "sqs:SendMessage",
          "sqs:DeleteMessage"
        ],
        Resource = module.queue.arn
      },
      {
        Effect = "Allow",
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail",
        ],
        Resource = "arn:aws:ses:eu-west-1:215591118052:identity/diekmrcoin.com"
      }
    ]
  })
}

module "lambda" {
  source      = "../../modules/lambda"
  prefix      = var.prefix
  environment = var.environment
  name        = "api"
  handler     = "api.handler"
  description = "Api Lambda"
  variables = {
    QUEUE_URL = module.queue.url
  }
  attach_policies = {
    "sqs" = aws_iam_policy.api_lambda_permissions.arn
  }
}

module "api_gateway" {
  source          = "../../modules/api_gateway"
  prefix          = var.prefix
  environment     = var.environment
  name            = "api"
  description     = "Api API Gateway"
  lambda_function = module.lambda
}

// acm certificate for api domain
resource "aws_acm_certificate" "api_gateway" {
  domain_name       = local.domain_name
  validation_method = "DNS"
}

// acm certificate validation record
resource "aws_route53_record" "api_gateway_validation" {
  for_each = {
    for dvo in aws_acm_certificate.api_gateway.domain_validation_options : dvo.domain_name => {
      name    = dvo.resource_record_name
      record  = dvo.resource_record_value
      type    = dvo.resource_record_type
      zone_id = var.route53.zone_id
    }
  }
  allow_overwrite = true
  zone_id         = each.value.zone_id
  name            = each.value.name
  type            = each.value.type
  records         = [each.value.record]
  ttl             = 60
}

// acm certificate validation
resource "aws_acm_certificate_validation" "api_gateway" {
  certificate_arn         = aws_acm_certificate.api_gateway.arn
  validation_record_fqdns = [for record in aws_route53_record.api_gateway_validation : record.fqdn]
}

// api gateway domain name
resource "aws_apigatewayv2_domain_name" "api_gateway" {
  domain_name = local.domain_name
  domain_name_configuration {
    endpoint_type   = "REGIONAL"
    certificate_arn = aws_acm_certificate_validation.api_gateway.certificate_arn
    security_policy = "TLS_1_2"
  }
}

// Route53 Record for api domain
resource "aws_route53_record" "api_gateway" {
  zone_id = var.route53.zone_id
  name    = local.domain_name
  type    = "A"

  alias {
    name                   = aws_apigatewayv2_domain_name.api_gateway.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.api_gateway.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
}

// api gateway domain name mapping
resource "aws_apigatewayv2_api_mapping" "api_gateway" {
  api_id      = module.api_gateway.id
  domain_name = aws_apigatewayv2_domain_name.api_gateway.id
  stage       = module.api_gateway.stage
}

