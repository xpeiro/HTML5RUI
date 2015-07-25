#HTML5 Robot User Interface Server
####An [ASLab](http://www.aslab.upm.es/) Project,
####Developed by [Daniel Peiró](https://github.com/xpeiro)
####[ETSII, UPM](http://www.etsii.upm.es/) 2014-2015    

##Quick Instructions 
######(Detailed instructions follow):

#####1. Install nodejs, npm, python.
#####2. Install avconv (Optional, see below).
#####3. Install MongoDB and start service.
#####4. CD to HTML5RUI dir and enter:
```shell
$ mongo utils/hruiconfig.js
$ npm install
$ npm start
```
###Detailed Installation Instructions (Debian/Ubuntu/Mint):

#####1. Install nodejs, npm, python:
	$ sudo apt-get install nodejs npm python2

On some systems (i.e. 32-Bit, Debian), ```nodejs-legacy``` package may also be required.

#####2. Install avconv/ffmpeg (Optional, required for media streaming):
```shell
$ sudo apt-get install libav-tools
```
Or
```shell
$ sudo apt-get install ffmpeg
```
If you wish to use ffmpeg instead of avconv, change parameter AVCONV in config.json or app.js to 'ffmpeg' so the app calls ffmpeg instead of avconv.

#####3. Install [MongoDB](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/):
Get software source (use method of your choice):
```shell
$ sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
$ echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
```
Update package list:
```shell
$ sudo apt-get update
```
Install mongodb and start service:
```shell
$ sudo apt-get install -y mongodb-org
$ sudo service mongod start
```
To check if mongodb was installed correctly, run mongo shell:
```shell
$ mongo
```

#####4. CD to HTML5RUI directory.

#####5. Configure MongoDB (For Data Monitor Module and Geolocation out of the box):
```shell
$ mongo utils/hruiconfig.js
```
Alternatively, backup/restore a working db with [mongorestore](http://docs.mongodb.org/manual/reference/program/mongorestore/).

#####6. Install app and run:
```shell
$ npm install
$ npm start	
```
#####Optional: Use [PM2](https://github.com/Unitech/pm2) to monitor/manage server (Recommended).
```shell
$ npm install pm2 -g
$ pm2 start bin/start 
$ pm2 logs/monit/stop 0/start 0/...(see PM2 documentation)
```

	

#####Notes on using port 80: 
######The app is setup to use port 80 by default (makes for a 'prettier' URL).
######Using standard HTTP Port 80 (or any other port < 1024) requires root privileges.
######If user is not root, an EACCES error will be thrown on app start (using sudo will work, but is a security risk, as it grants full rights and capabilities to node).
######To use a different port (greater than 1024), Open app.js and modify the PORT Parameter (should not be the same as other XXXPORT Parameters), save changes and restart app if necessary.
######The server can then be reached at:
```
http://localhost:XXXX/
```
######where XXXX is the chosen PORT. (i.e. for PORT=8080; http://localhost:8080)

#####How to use port 80:
My preferred method uses setcap to grant node.js the capability to bind to port<1024:
```shell
$ sudo apt-get install libcap2-bin
$ sudo setcap cap_net_bind_service=+ep /usr/local/bin/node
```
To revert, simply:
```shell
$ sudo setcap cap_net_bind_service=-ep /usr/local/bin/node
```
This only gives node the ability to bind to ports < 1024, keeping all other restrictions intact.
There are [several other ways](http://stackoverflow.com/questions/413807/is-there-a-way-for-non-root-processes-to-bind-to-privileged-ports-1024-on-l) to use or redirect Port 80 without root privileges.


###Installation (Windows):

**_The server is meant to be deployed on Linux._**

**_It can be installed on Windows, but it's not recommended as installation is cumbersome (not of the app itself, dependencies) and some features aren't available (namely: Live Media and Script Execution)._**

#####1. Install NodeJS from http://nodejs.org/ . Make sure NPM package manager is installed (it is by default). Install Python https://www.python.org/downloads/.
#####2. Install MongoDB from http://www.mongodb.org/downloads
#####3. Configure MongoDB: See linux.
#####4. Install HTML5RUI:
  * Open cmd in HTML5RUI directory.
	```shell
  >npm install
	```
  * (Optional) Install app as windows service (daemonize and keep running):
    * Install node-windows (globally):
	```shell
	>npm install -g node-windows
	```
    * Open cmd in HTML5RUI/winutils.
    ```shell
    >node winsvc install name
    ```

    * Other actions:
    ```shell
    >node winsvc uninstall name
    >node winsvc start name
    >node winsvc stop name
    ```
    (where "name" is the name the service will have/has)
  * (Optional) or use [PM2](https://github.com/Unitech/pm2) for Windows

#####5. Run app manually (if not installed as service/not using PM2):
  * Open cmd in HTML5RUI directory:
```shell
>npm start
```
#####Possible issues with Windows installation:
  * **npm error when trying to install (missing folder npm)**: Create folder manually (normally in AppData/Roaming/npm).
  * **MongoDB error (missing data/db/)**: Create folder manually where the database will be stored (use of MongoDB installation folder recommended).
  * **npm, node, mongod and mongo should be in your PATH if you don't want to specify it each time you use them.**

##Usage
####See [User Manual](http://xpeiro.github.io/hrui/)
