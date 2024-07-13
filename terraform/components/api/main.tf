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

module "api_dynamodb" {
  source      = "../../modules/dynamo_db"
  prefix      = var.prefix
  name        = "api"
  environment = var.environment
  hash_key    = { name = "partition", type = "S" }
  range_key   = { name = "id", type = "S" }
  ttl = {
    enabled        = true
    attribute_name = "TTL"
  }
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
          "sqs:DeleteMessage",
          "sqs:ReceiveMessage",    # Added to ensure Lambda can poll messages
          "sqs:GetQueueAttributes" # Added for Lambda to check queue attributes
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
      },
      {
        Effect = "Allow",
        Action = [
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:DeleteItem",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:UpdateItem"
        ],
        Resource = module.api_dynamodb.arn
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
    "general" = aws_iam_policy.api_lambda_permissions.arn
  }
  reserved_concurrent_executions = 5
}

module "api_gateway" {
  source          = "../../modules/api_gateway"
  prefix          = var.prefix
  environment     = var.environment
  name            = "api"
  description     = "Api API Gateway"
  lambda_function = module.lambda
}

module "lambda_conversation" {
  source      = "../../modules/lambda"
  prefix      = var.prefix
  environment = var.environment
  name        = "conversation-handler"
  handler     = "conversation.handler"
  description = "Conversation Handler Lambda"
  variables = {
    QUEUE_URL = module.queue.url
  }
  attach_policies = {
    "general" = aws_iam_policy.api_lambda_permissions.arn
  }
  reserved_concurrent_executions = 1
  timeout = 30
}

resource "aws_lambda_event_source_mapping" "lambda_conversation_trigger" {
  event_source_arn = module.queue.arn
  function_name    = module.lambda_conversation.arn
  batch_size       = 10
  enabled          = true
}
