variable "environment" { type = string }
variable "prefix" { type = string }
variable "route53_zone" { type = string }
variable "route53_zone_id" { type = string }

module "bot-general-conversation" {
  source      = "./components/bot/general-conversation"
  prefix      = var.prefix
  environment = var.environment
}

module "api" {
  source      = "./components/api"
  prefix      = var.prefix
  environment = var.environment
  route53 = {
    zone    = var.route53_zone
    zone_id = var.route53_zone_id
  }
}
