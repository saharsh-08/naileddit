# Naileddit - A clone of Reddit
## Shoutout to [Ben Awad](https://github.com/benawad) for creating an awesome course
## [Video Link](https://youtu.be/I6ypD7qv3Z8?si=uDxm7gpRe28n7vB-)

### .env (Server)
```
RESEND_API_KEY=
SESSION_ID_COOKIE_SECRET=
DATABASE_URL=
REDIS_URL=
PORT= <br>
CORS_ORIGIN=
NODE_ENV=
```

### .env (Web)
```
NEXT_PUBLIC_SERVER_URL=
```

## Deploying the web application in local
** Pre-requisites **
- Docker

To deploy the app on a remote server, some additional steps like DNS setup are required.
I'll add them when I deploy it to a VPS later.

** Steps for local deployment **
1. Pull a dokku image. \
`docker pull dokku/dokku:latest`
2. Run the container having the dokku image. Name the container 'naileddit'. \
`docker container run -d --env DOKKU_HOSTNAME=dokku.me --env DOKKU_HOST_ROOT=/var/lib/dokku/home/dokku --env DOKKU_LIB_HOST_ROOT=/var/lib/dokku/var/lib/dokku --name naileddit --publish 3022:22 --publish 8080:80 --publish 8443:443 --volume /var/lib/dokku:/mnt/dokku --volume /var/run/docker.sock:/var/run/docker.sock dokku/dokku:latest`
3. SSH into the container shell. \
`docker exec -it naileddit /bin/bash`
4. Create the server app. \
`dokku apps:create <app_name>`
5. Install the database plugin you require. \
`sudo dokku plugin:install https://github.com/dokku/dokku-postgres.git`
6. Create a database service. \
`dokku postgres:create <db_name>`
7. Link database with the app. \
`dokku postgres:link <db_name> <app_name>`
8. Install the redis plugic. \
`sudo dokku plugin:install https://github.com/dokku/dokku-redis.git --name redis`
9. Creaet a redis service. \
`dokku redis:create <redis_name>`
10. Link redis with the app. \
`dokku redis:link <redis_name> <app_name>`
11. After running these commands, you should be able to see the redis and database containers running. \
`docker container list`
12. Build the server and web images. Push them to a container registry. I am using GHCR.
```
docker login ghcr.io -u <github_username> --password <pat>

docker build -t ghcr.io/saharsh-08/naileddit/server:1 ./naileddit-server
docker push ghcr.io/<github_username>/naileddit/server:1

docker build --build-arg NEXT_PUBLIC_SERVER_URL=<value> -t ghcr.io/<github_username>/naileddit/web:1 .
docker push ghcr.io/<github_username>/naileddit/web:1
```
Note: I have purposefully mentioned .env in the .dockerignore file. \
Hence, when the docker image is created, all the environment variables are also copied. \
This is not a good practice, but I have gone ahead with this approach for simplicity.

If you're going ahead with this approach, populate the .env file with the database URL and redis URL generated in the above steps.

13. To pull the server's docker image, login to docker first if the image is uploaded to a private repository, and then pull.
```
docker login ghcr.io -u <github_username> --password <pat>
docker pull ghcr.io/<github_username>/naileddit/server:1
```
14. Add the environment variables for server.
```
dokku config:set api RESEND_API_KEY=<value>
dokku config:set api SESSION_ID_COOKIE_SECRET=<value>
dokku config:set api PORT=<value>
dokku config:set api CORS_ORIGIN=<value>
```
15. Deploy the server image. \
`dokku git:from-image api ghcr.io/<github_username>/naileddit/server:1`
16. Map nginx port 80 of the dokku container to the server's container port. \
Dokku otherwise uses the `EXPOSE`d port (8080) for nginx, which is not published by the dokku container. \
`dokku ports:set api http:80:8080`
17. Create the web (UI) app. \
`dokku apps:create <web_app_name>`
18. Add the environment variables for the web app. \
`dokku config:set <web_app_name> NEXT_PUBLIC_SERVER_URL=<value>`
19. Deploy the app image. \
`dokku git:from-image <web_app_name> ghcr.io/<github_username>/naileddit/web:1`
20. Map nginx port 80 to the web app's container port. \
`dokku ports:set <web_app_name> http:80:3000`
21. If `dokku.me` does not resolve to `127.0.0.1` on your network (check with `nslookup api.dokku.me`), add these entries to your hosts file (`C:\Windows\System32\drivers\etc\hosts` on Windows, `/etc/hosts` on Linux/macOS). Editing it requires admin rights.
```
127.0.0.1 api.dokku.me
127.0.0.1 web.dokku.me
```
22. The apps are now available on the host port published for the dokku container's port 80 (8080 in step 2):
- Server: `http://<app_name>.dokku.me:8080/graphql`
- Web: `http://<web_app_name>.dokku.me:8080`