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

module "queue" {
  source      = "./queue"
  prefix      = var.prefix
  environment = var.environment
}

module "publisher" {
  source      = "./publisher"
  prefix      = var.prefix
  environment = var.environment
  sqs = {
    url = module.queue.url
    arn = module.queue.arn
  }
  route53    = var.route53
  depends_on = [module.queue]
}
