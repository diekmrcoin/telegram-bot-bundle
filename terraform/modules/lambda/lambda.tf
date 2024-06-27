variable "description" {
  type = string
}

variable "edge" {
  type    = bool
  default = false
}

variable "prefix" {
  type = string
}

variable "environment" {
  type = string
}

variable "event_sources" {
  type = list(object({
    arn        = string
    batch_size = number
  }))
  default = []
}

variable "handler" {
  type = string
}

variable "memory_size" {
  type    = string
  default = "128"
}

variable "name" {
  type = string
}

variable "permissions" {
  type    = set(string)
  default = []
}

variable "runtime" {
  type    = string
  default = "nodejs20.x"
}

variable "timeout" {
  type    = string
  default = "3"
}

variable "variables" {
  type    = map(string)
  default = null
}

variable "vpc" {
  type = object({
    id                     = string
    cidr_block             = string
    subnet_private_a       = object({ id = string })
    subnet_private_b       = object({ id = string })
    subnet_private_c       = object({ id = string })
    security_group_private = object({ id = string })
  })
  default = null
}

variable "function_url" {
  type    = bool
  default = false
}

variable "reserved_concurrent_executions" {
  description = "The amount of reserved concurrent executions for this lambda function. 1000 by default."
  type        = number
  default     = 1000
}

variable "attach_policies" {
  type    = map(string)
  default = {}
}

output "arn" {
  value = aws_lambda_function.lambda_function.arn
}

output "invoke_arn" {
  value = aws_lambda_function.lambda_function.invoke_arn
}

output "name" {
  value = aws_lambda_function.lambda_function.function_name
}

output "qualified_arn" {
  value = aws_lambda_function.lambda_function.qualified_arn
}

locals {
  permissions_lookup = {
    dynamodb = "AmazonDynamoDBFullAccess"
    lambda   = "AWSLambda_FullAccess"
    s3       = "AmazonS3FullAccess"
    sns      = "AmazonSNSFullAccess"
    ssm      = "AmazonSSMReadOnlyAccess"
  }
}

resource "aws_iam_role" "iam_role" {
  name = "${var.prefix}-${var.environment}-lmb-${var.name}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = var.edge ? ["lambda.amazonaws.com", "edgelambda.amazonaws.com"] : ["lambda.amazonaws.com"]
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "iam_role_policy_attachment_AWSLambdaBasicExecutionRole" {
  role       = aws_iam_role.iam_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "iam_role_policy_attachment" {
  for_each   = var.permissions
  role       = aws_iam_role.iam_role.name
  policy_arn = "arn:aws:iam::aws:policy/${lookup(local.permissions_lookup, each.value, "ERROR")}"
}

data "archive_file" "dummy_lambda_archive" {
  type        = "zip"
  output_path = "${path.module}/lambda.zip"

  source {
    content  = "dummy"
    filename = "dummy.txt"
  }
}

resource "aws_lambda_function" "lambda_function" {
  architectures                  = [var.edge ? "x86_64" : "arm64"]
  description                    = var.description
  filename                       = data.archive_file.dummy_lambda_archive.output_path
  function_name                  = "${var.prefix}-${var.environment}-lmb-${var.name}"
  handler                        = var.handler
  memory_size                    = var.memory_size
  package_type                   = "Zip"
  publish                        = var.edge
  role                           = aws_iam_role.iam_role.arn
  runtime                        = var.runtime
  timeout                        = var.timeout
  reserved_concurrent_executions = var.reserved_concurrent_executions

  dynamic "environment" {
    for_each = var.variables != null ? [var.variables] : []
    content {
      variables = var.variables
    }
  }

  dynamic "vpc_config" {
    for_each = var.vpc != null ? [var.vpc] : []
    content {
      security_group_ids = [var.vpc.security_group_private.id]
      subnet_ids         = [var.vpc.subnet_private_a.id, var.vpc.subnet_private_b.id, var.vpc.subnet_private_c.id]
    }
  }
}

resource "aws_iam_role_policy_attachment" "iam_role_policy_attachment_AWSLambdaDynamoDBExecutionRole" {
  count      = length(var.event_sources) > 0 ? 1 : 0
  role       = aws_iam_role.iam_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaDynamoDBExecutionRole"
}

resource "aws_iam_role_policy_attachment" "iam_role_policy_attachment_AWSLambdaVPCAccessExecutionRole" {
  count      = var.vpc == null ? 0 : 1
  role       = aws_iam_role.iam_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_lambda_event_source_mapping" "lambda_event_source_mapping" {
  count             = length(var.event_sources)
  batch_size        = var.event_sources[count.index].batch_size
  event_source_arn  = var.event_sources[count.index].arn
  function_name     = aws_lambda_function.lambda_function.arn
  starting_position = "LATEST"
}

resource "aws_lambda_function_url" "lambda_function_url" {
  count              = var.function_url ? 1 : 0
  function_name      = aws_lambda_function.lambda_function.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["*"]
    allow_headers     = ["date", "keep-alive"]
    expose_headers    = ["keep-alive", "date"]
    max_age           = 86400
  }
}

resource "aws_iam_role_policy_attachment" "custom_policies_attachment" {
  for_each   = var.attach_policies
  role       = aws_iam_role.iam_role.name
  policy_arn = each.value
}
