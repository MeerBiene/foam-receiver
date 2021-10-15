#!/bin/bash
sed -e "s/your_username/$(git config --global user.username)/" -e "s/your@email.com/$(git config --global user.email)/" docker-compose.example.yml > docker-compose.yml