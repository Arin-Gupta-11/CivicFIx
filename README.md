🏛️ CivicFix — Smart Civic Issue Reporting Platform

CivicFix is a full-stack web application that empowers citizens to report, 
track, and resolve local civic issues such as potholes, broken streetlights, 
water leaks, and more — directly from their browser.

🌟 Key Features
- 📝 Submit and track civic complaints with real-time status updates
- 🗺️ Location-based issue reporting
- 🔔 Email notifications for issue updates
- 🔐 Secure JWT-based authentication system
- 📊 Admin dashboard to manage and resolve reported issues
- 💬 Real-time updates via WebSockets

🛠️ Tech Stack
- Frontend:  React.js
- Backend:   Node.js + Express
- Database:  MySQL (Docker container)
- Auth:      JWT + bcrypt

☁️ DevOps & Deployment
- Containerization:  Docker + Docker Compose
- Cloud:             AWS EC2 (ap-south-1)
- Infrastructure:    Terraform (auto-provisions EC2, Security Groups, SSH Keys)
- Configuration:     Ansible (auto-installs Docker, clones repo, starts app)
- CI/CD Pipeline:    Jenkins (fully automated build → provision → deploy flow)

🚀 How It Works
Every push to the main branch triggers a Jenkins pipeline that:
1. Checks out the latest code from GitHub
2. Provisions a fresh AWS EC2 instance using Terraform
3. Deploys the full application stack using Ansible
4. Verifies the deployment is live
