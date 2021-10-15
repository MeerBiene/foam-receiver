# Foam-Receiver

This is a simple addon service for [foam](https://foambubble.github.io/foam/) that receives webhooks from an IOS Shortcut and saves the received data in markdown files.

Incoming data is seperated in 3 categories: Songs, Map-Items and Todos. Everything else is stored in one "catcher" file. Songs are determined by whether the content contains a "spotify.com" or "music.apple.com" link. Todos are determined by checking if the data contains the keyword "[todo].

Everytime you send something to foam receiver, your repo is pulled, the new content is appended to the corresponding file, the file is commited, and the new contents of the repo are pushed.

### Motivation:

I wanted to use this [recipe](https://foambubble.github.io/foam/recipes/capture-notes-with-shortcuts-and-github-actions) to capture notes with shortcuts from an IOS Device.

The problem: I host my foam repository on a private gitea instance therefore I can't use Github actions. I wrote this simple reciver to have a way to share stuff from my IOS device and having it backed up to my repo automatically.

# Deployment

## Prerequisites:

- [docker](https://docker.io)
- [docker-compose](https://docs.docker.com/compose/install/)

## Preparing the deployment:

Run the following scripts to generate the required deployment files:

```console
./scripts/00-fix-permissions.sh
```

> Fix the permissions on the ssh config so it works inside the docker container.
> This is only needed if you want to clone repositories via ssh

```console
./scripts/01-prepare-deployment.sh
```

> Generate the .env and docker-compose files for you (generates a 16 digit token)


## Configuration:

```env
#####################
## Server Settings ##
#####################

# Port to listen on (remember to adjust it in your
# docker-compose file if you change this port)
PORT=3000

# Security enabled (if you want to check for token presence or not)
SECURITY_ENABLED=true

# If set to false, the token has to be sent in the body
HEADERBASED_AUTH=true

# Token to use for athentification
TOKEN=YOUR_TOKEN

# Your foam repository
REPO=https://github.com/foambubble/foam.git

#######################
## Filename Settings ##
#######################

# If you want to store your Uploads in a seperate folder put that folder here
# STORE_IN_FOLDER=false
STORE_IN_FOLDER=/Uploads

# Map items will be stored here
MAPITEMS_FILENAME=Map-items

# Spotify (or Apple Music) Links will be placed here
SONGS_FILENAME=Songs

# Todos (things that are prefixed with "[todo]")
TODO_FILENAME=Todos

# Everything else will be placed in those files
UPLOAD_FILENAME=Upload
```

### IOS Shortcut Setup:

- Copy this [Shortcut](https://www.icloud.com/shortcuts/57d2ed90c40e43a5badcc174ebfaaf1d) and edit the content of the last step, `GetContentsOfURL`. Update the url according to your servers url and enter your token in the `authorization` header. 
- If you have set the config value `HEADERBASED_AUTH` to false you have to add another field to the body called "token" when you enter the previously generated token.

# Running:

Start the container by running

```console
docker-compose up -d
```
