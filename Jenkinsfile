pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Cloning repository...'
                git 'https://github.com/Arin-Gupta-11/CivicFIx'
            }
        }

        stage('Terraform') {
            steps {
                echo 'Running Terraform...'
                dir('terraform') {
                    sh 'terraform init'
                    sh 'terraform apply -auto-approve'
                }
            }
        }

        stage('Ansible') {
            steps {
                echo 'Running Ansible...'
                dir('ansible') {
                    sh 'ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -i inventory.ini deploy.yml'
                }
            }
        }

        stage('Done') {
            steps {
                echo 'Deployment Completed!'
            }
        }
    }
}