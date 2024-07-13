
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

