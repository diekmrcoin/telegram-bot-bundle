variable "environment" {
  type = string
}

variable "prefix" {
  type = string
}

module "bot-general-conversation" {
  source      = "./components/bot/general-conversation"
  prefix      = var.prefix
  environment = var.environment
}
