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
            '''
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