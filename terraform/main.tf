terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "tls_private_key" "civicfix" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "civicfix_key" {
  key_name   = "civicfix-key"
  public_key = tls_private_key.civicfix.public_key_openssh
}

resource "local_file" "civicfix_pem" {
  content         = tls_private_key.civicfix.private_key_pem
  filename        = "${path.module}/civicfix-key.pem"
  file_permission = "0400"
}

# Security Group
resource "aws_security_group" "civicfix_sg" {
  name        = "civicfix-sg"
  description = "CivicFix Security Group"

  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Backend API
  ingress {
    from_port   = 5001
    to_port     = 5001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # All outbound
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "civicfix-sg"
  }
}

# EC2 Instance
resource "aws_instance" "civicfix_server" {
  ami                    = "ami-0f5ee92e2d63afc18" # Ubuntu 22.04 LTS in ap-south-1
  instance_type          = var.instance_type
  key_name               = aws_key_pair.civicfix_key.key_name
  vpc_security_group_ids = [aws_security_group.civicfix_sg.id]

  tags = {
    Name = "civicfix-server"
  }
}