output "ec2_public_ip" {
  description = "Public IP of CivicFix EC2 instance"
  value       = aws_instance.civicfix_server.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of CivicFix EC2 instance"
  value       = aws_instance.civicfix_server.public_dns
}