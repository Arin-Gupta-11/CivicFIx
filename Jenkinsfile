pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Cloning repository...'
                git branch: 'main', url: 'https://github.com/Arin-Gupta-11/CivicFix'
            }
        }

        stage('Terraform') {
            steps {
                echo 'Running Terraform...'
                dir('terraform') {
                    sh '''
                    export PATH=/opt/homebrew/bin:$PATH
                    terraform init
                    terraform apply -auto-approve
                    terraform output -raw ec2_public_ip > ../ec2_ip.txt
                    '''
                }
            }
        }

        stage('Ansible') {
            steps {
                echo 'Running Ansible...'
                sh '''
                export PATH=/opt/homebrew/bin:$PATH
                EC2_IP=$(cat ec2_ip.txt)
                
                # Generate dynamic inventory
                echo "[civicfix]" > ansible/inventory.ini
                echo "${EC2_IP} ansible_user=ubuntu ansible_ssh_private_key_file=terraform/civicfix-key.pem ansible_ssh_common_args='-o StrictHostKeyChecking=no'" >> ansible/inventory.ini
                
                ansible-playbook -i ansible/inventory.ini ansible/deploy.yml -e "ec2_ip=${EC2_IP}"
                '''
            }
        }

        stage('Done') {
            steps {
                sh 'echo Deployment Completed! App is live at http://$(cat ec2_ip.txt)'
            }
        }
    }
}