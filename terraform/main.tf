variable "environment" { type = string }
variable "prefix" { type = string }
variable "route53_zone" { type = string }
variable "route53_zone_id" { type = string }

module "api" {
  source      = "./components/api"
  prefix      = var.prefix
  environment = var.environment
  route53 = {
    zone    = var.route53_zone
    zone_id = var.route53_zone_id
  }
}
