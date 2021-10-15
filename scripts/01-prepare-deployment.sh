#!/bin/bash
TOKEN=$(openssl rand -hex 16)
GIT_USER=$(git config --global user.username)
GIT_EMAIL=$(git config --global user.email)

USE_TRAEFIK=${1:-""}

if [ -z $USE_TRAEFIK ]; then
  echo "Do you want to use traefik? (true/false)"
  echo ""
  read USE_TRAEFIK
fi

print_git_summary () {
  echo "Username:         $GIT_USER"
  echo "Email:            $GIT_EMAIL"
  echo "Are those correct? (true/false)"
}

echo ""
echo "Found the following git username and email"
print_git_summary
read CREDS_CORRECT

fix_git_credentials () {
  echo ""
  echo "Enter your git username"
  read GIT_USER
  echo ""
  echo "Enter your git email"
  read GIT_EMAIL
  echo ""
  echo "Summary:"
  print_git_summary
  read CREDS_NOW_CORRECT
  if [ $CREDS_NOW_CORRECT == 'false' ]; then
    fix_git_credentials
  fi
}


if [ $CREDS_CORRECT == 'false' ]; then 
  fix_git_credentials 
fi

sed s/YOUR_TOKEN/$TOKEN/ example.env > .env

if [ $USE_TRAEFIK == 'false' ]; then
  sed -e "s/your_username/$USER/" -e "s/your_git_username/$GIT_USER/" -e "s/your@email.com/$GIT_EMAIL/" docker-compose.example.yml > docker-compose.yml
else
  echo ""
  echo "Enter your foam receiver url:"
  read TRAEFIK_URL
  sed -e "s/foam-receiver.example.com/$TRAEFIK_URL/" -e "s/your_username/$USER/" -e "s/your_git_username/$GIT_USER/" -e "s/your@email.com/$GIT_EMAIL/" scripts/templates/docker-compose.traefik.yml > docker-compose.yml
fi
echo ""
echo "Deployment preparation finished."
echo "Your token:         $TOKEN"
if [ $USE_TRAEFIK == 'true' ] ; then
  echo "Deployment Url:     $TRAEFIK_URL"
fi