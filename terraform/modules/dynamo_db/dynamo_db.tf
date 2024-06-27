variable "prefix" {
  type = string
}

variable "environment" {
  type = string
}

variable "name" {
  type = string
}

variable "hash_key" {
  type = object({
    name = string
    type = string
  })
}

variable "range_key" {
  type = object({
    name = string
    type = string
  })
}

variable "global_secondary_indexes" {
  type = list(object({
    name = string
    hash_key = object({
      name = string
      type = string
    })
    range_key = object({
      name = string
      type = string
    })
    # only mandatory when projection_type = "INCLUDE"
    include = list(string)
    # "ALL" | "INCLUDE" | "KEYS_ONLY"
    projection_type = list(string)
  }))
  default = []
}

variable "ttl" {
  type = object({
    enabled        = bool
    attribute_name = string
  })
  default = {
    enabled        = false
    attribute_name = ""
  }

}

output "arn" {
  value = aws_dynamodb_table.dynamodb_table.arn
}

output "stream_arn" {
  value = aws_dynamodb_table.dynamodb_table.stream_arn
}

locals {
  attributes = concat([{
    hash_key  = { name = var.hash_key.name, type = var.hash_key.type },
    range_key = { name = var.range_key.name, type = var.range_key.type }
  }], var.global_secondary_indexes)
  filtered_attributes = { for key, value in local.attributes : key => value if value.range_key.name != "" }
}

resource "aws_dynamodb_table" "dynamodb_table" {
  name             = "${var.prefix}-${var.environment}-dynamo-${var.name}"
  billing_mode     = "PROVISIONED"
  hash_key         = var.hash_key.name
  range_key        = var.range_key.name
  read_capacity    = 1
  write_capacity   = 1
  stream_enabled   = true
  stream_view_type = "NEW_IMAGE"

  dynamic "attribute" {
    for_each = local.attributes

    content {
      name = attribute.value.hash_key.name
      type = attribute.value.hash_key.type
    }
  }

  dynamic "attribute" {
    for_each = local.attributes

    content {
      name = attribute.value.range_key.name
      type = attribute.value.range_key.type
    }
  }

  dynamic "global_secondary_index" {
    for_each = var.global_secondary_indexes

    content {
      name               = global_secondary_index.value.name
      hash_key           = global_secondary_index.value.hash_key.name
      projection_type    = global_secondary_index.value.projection_type
      range_key          = global_secondary_index.value.range_key.name != "" ? global_secondary_index.value.range_key.name : ""
      read_capacity      = 1
      write_capacity     = 1
      non_key_attributes = global_secondary_index.value.include
    }
  }

  point_in_time_recovery {
    enabled = true
  }

  ttl {
    enabled        = var.ttl.enabled
    attribute_name = var.ttl.attribute_name
  }

  lifecycle {
    ignore_changes = [
      read_capacity,
      write_capacity
    ]
  }
}

resource "aws_appautoscaling_target" "appautoscaling_target_read" {
  max_capacity       = 150
  min_capacity       = 1
  resource_id        = "table/${aws_dynamodb_table.dynamodb_table.name}"
  scalable_dimension = "dynamodb:table:ReadCapacityUnits"
  service_namespace  = "dynamodb"
}

resource "aws_appautoscaling_policy" "appautoscaling_policy_read" {
  name               = "DynamoDBReadCapacityUtilization:${aws_appautoscaling_target.appautoscaling_target_read.resource_id}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.appautoscaling_target_read.resource_id
  scalable_dimension = aws_appautoscaling_target.appautoscaling_target_read.scalable_dimension
  service_namespace  = aws_appautoscaling_target.appautoscaling_target_read.service_namespace

  target_tracking_scaling_policy_configuration {
    scale_in_cooldown  = 0
    scale_out_cooldown = 60
    target_value       = 80

    predefined_metric_specification {
      predefined_metric_type = "DynamoDBReadCapacityUtilization"
    }
  }
}

resource "aws_appautoscaling_target" "scale_read_indexes" {
  count              = length(var.global_secondary_indexes)
  max_capacity       = 150
  min_capacity       = 1
  resource_id        = "table/${aws_dynamodb_table.dynamodb_table.name}/index/${var.global_secondary_indexes[count.index].name}"
  scalable_dimension = "dynamodb:table:ReadCapacityUnits"
  service_namespace  = "dynamodb"
}

resource "aws_appautoscaling_policy" "scale_read_indexes" {
  for_each           = { for k, scale in aws_appautoscaling_target.scale_read_indexes : k => scale }
  name               = "GlobalIndexReadCapacityUtilization:${each.value.resource_id}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = each.value.resource_id
  scalable_dimension = each.value.scalable_dimension
  service_namespace  = each.value.service_namespace

  target_tracking_scaling_policy_configuration {
    scale_in_cooldown  = 0
    scale_out_cooldown = 60
    target_value       = 80

    predefined_metric_specification {
      predefined_metric_type = "DynamoDBReadCapacityUtilization"
    }
  }
}

resource "aws_appautoscaling_target" "appautoscaling_target_write" {
  max_capacity       = 150
  min_capacity       = 1
  resource_id        = "table/${aws_dynamodb_table.dynamodb_table.name}"
  scalable_dimension = "dynamodb:table:WriteCapacityUnits"
  service_namespace  = "dynamodb"
}

resource "aws_appautoscaling_policy" "appautoscaling_policy_write" {
  name               = "DynamoDBWriteCapacityUtilization:${aws_appautoscaling_target.appautoscaling_target_write.resource_id}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.appautoscaling_target_write.resource_id
  scalable_dimension = aws_appautoscaling_target.appautoscaling_target_write.scalable_dimension
  service_namespace  = aws_appautoscaling_target.appautoscaling_target_write.service_namespace

  target_tracking_scaling_policy_configuration {
    scale_in_cooldown  = 0
    scale_out_cooldown = 60
    target_value       = 80

    predefined_metric_specification {
      predefined_metric_type = "DynamoDBWriteCapacityUtilization"
    }
  }
}

resource "aws_appautoscaling_target" "scale_write_indexes" {
  count              = length(var.global_secondary_indexes)
  max_capacity       = 150
  min_capacity       = 1
  resource_id        = "table/${aws_dynamodb_table.dynamodb_table.name}/index/${var.global_secondary_indexes[count.index].name}"
  scalable_dimension = "dynamodb:table:WriteCapacityUnits"
  service_namespace  = "dynamodb"
}

resource "aws_appautoscaling_policy" "scale_write_indexes" {
  for_each           = { for k, scale in aws_appautoscaling_target.scale_write_indexes : k => scale }
  name               = "GlobalIndexWriteCapacityUtilization:${each.value.resource_id}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = each.value.resource_id
  scalable_dimension = each.value.scalable_dimension
  service_namespace  = each.value.service_namespace

  target_tracking_scaling_policy_configuration {
    scale_in_cooldown  = 0
    scale_out_cooldown = 60
    target_value       = 80

    predefined_metric_specification {
      predefined_metric_type = "DynamoDBWriteCapacityUtilization"
    }
  }
}
