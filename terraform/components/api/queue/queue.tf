variable "environment" {
  type = string
}

variable "prefix" {
  type = string
}

output "arn" {
  value = aws_sqs_queue.queue.arn
}

output "url" {
  value = aws_sqs_queue.queue.id
}

resource "aws_sqs_queue" "queue" {
  name                        = "${var.prefix}-${var.environment}-queue.fifo"
  fifo_queue                  = true
  content_based_deduplication = true
  sqs_managed_sse_enabled     = true
  visibility_timeout_seconds  = 60
}

resource "aws_sqs_queue" "queue_deadletter" {
  name                      = "${var.prefix}-${var.environment}-queue-deadletter.fifo"
  fifo_queue                = true
  message_retention_seconds = 86400 # 1 day
  sqs_managed_sse_enabled   = true
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.queue.arn,
    maxReceiveCount     = 4
  })
}

resource "aws_sqs_queue_redrive_allow_policy" "queue_redrive_allow_policy" {
  queue_url = aws_sqs_queue.queue_deadletter.id

  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue",
    sourceQueueArns   = [aws_sqs_queue.queue.arn]
  })
}
