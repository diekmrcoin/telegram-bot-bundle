variable "environment" {
  type = string
}

module "dynamodb_bot_memory" {
  source      = "./modules/dynamo_db"
  prefix      = "diekmrcoin"
  name        = "ai-bot-memory"
  environment = var.environment
  hash_key    = { name = "partition", type = "S" }
  range_key   = { name = "id", type = "S" }
  ttl = {
    enabled        = true
    attribute_name = "TTL"
  }
}

# Policy for the Lambda function to access the DynamoDB table
resource "aws_iam_policy" "lambda_memory_access" {
  name        = "diekmrcoin-${var.environment}-ai-bot-memory-lambda-access"
  description = "Allow Lambda Bot to access DynamoDB Bot Memory"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
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
        Resource = module.dynamodb_bot_memory.arn
      }
    ]
  })
}

module "lambda_bot" {
  source      = "./modules/lambda"
  prefix      = "diekmrcoin"
  name        = "ai-bot"
  description = "diekmrcoin AI Bot"
  environment = var.environment
  attach_policies = {
    dyamodb_memory_access = aws_iam_policy.lambda_memory_access.arn
  }
  handler                        = "lambda.serverlessBot"
  function_url                   = true
  reserved_concurrent_executions = 10
  timeout                        = 10
}

# module "api" {
#   source          = "./modules/api_gateway"
#   prefix          = "diekmrcoin"
#   name            = "ai-bot"
#   description     = "diekmrcoin AI Bot"
#   environment     = var.environment
#   lambda_function = module.lambda_bot
# }
