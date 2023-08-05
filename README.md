## Quick Start

```
npm install
npm run dev
```

## Transpile CSS

```
npm run build-client
```

## Run in production

Go to [Hostinger paid server page](https://hpanel.hostinger.com/server). Under "SSH Access" find the command which says `ssh root$

The website files are located here: `root@{the-server-name-here}:/home/unseen-observer`.

Password is related to Exit Eden. Note that the correct IP address should start with 141 and have about 11 digits.

```
tmux a
ctrl + c // to stop the app running
git pull // to get the latest code
npm start // to relaunch app
ctrl + b // to send the next command directly to tmux, not the terminal within it
d // disconnect from tmux
```

You can then exit the server.
