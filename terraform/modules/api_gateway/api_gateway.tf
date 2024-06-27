variable "description" {
  type = string
}

variable "environment" {
  type = string
}

variable "prefix" {
  type = string
}

variable "name" {
  type = string
}

variable "lambda_function" {
  type = object({ name = string, invoke_arn = string })
}

output "id" {
  value = aws_apigatewayv2_api.apigatewayv2_api.name
}

output "domain_name" {
  value = substr(aws_apigatewayv2_api.apigatewayv2_api.api_endpoint, 8, -1)
}

resource "aws_apigatewayv2_api" "apigatewayv2_api" {
  name          = "${var.prefix}-${var.environment}-api-${var.name}"
  protocol_type = "HTTP"
  description   = var.description
}

resource "aws_apigatewayv2_stage" "apigatewayv2_stage" {
  api_id      = aws_apigatewayv2_api.apigatewayv2_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "apigatewayv2_integration" {
  api_id                 = aws_apigatewayv2_api.apigatewayv2_api.id
  description            = "Integration for ${var.description}"
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = var.lambda_function.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "apigatewayv2_route" {
  api_id    = aws_apigatewayv2_api.apigatewayv2_api.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.apigatewayv2_integration.id}"
}

resource "aws_apigatewayv2_deployment" "apigatewayv2_deployment" {
  api_id = aws_apigatewayv2_api.apigatewayv2_api.id

  triggers = {
    redeployment = sha1(join(",", tolist([
      "${jsonencode(aws_apigatewayv2_integration.apigatewayv2_integration)}",
      "${jsonencode(aws_apigatewayv2_route.apigatewayv2_route)}"],
    )))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_lambda_permission" "lambda_permission" {
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function.name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.apigatewayv2_api.execution_arn}/*/*"
}
