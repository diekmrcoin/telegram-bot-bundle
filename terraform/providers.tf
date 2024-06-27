provider "aws" {
  region = "eu-west-3"
  default_tags {
    tags = {
      Deploy  = "terraform"
      Project = "diekmrcoin"
    }
  }
}

provider "aws" {
  region = "us-west-2"
  alias  = "cloudfront"
  default_tags {
    tags = {
      Deploy  = "terraform"
      Project = "diekmrcoin"
    }
  }
}
