# bitcoinlottery

## Instructions to run with docker-compose

```sh
$ cd ./app
$ make up 
```

Note that if changes are made in a docker container, `docker-compose up` does not re-build them. 
You need to run `docker-compose build` first.

## Instruction to push an image with docker

build and get the "image id":

```sh
$ docker build --pull --rm -f "app/Dockerfile" -t bitcoinlottery:latest "app"
$ docker images
```

then tag it and push it to dockerhub:

```sh
$ docker tag 045447d4c06f mimoo/bitcoinlottery:some_tag
$ docker push mimoo/bitcoinlottery
```

## Instructions to run with kubernetes

The `app/Dockerfile` is pushed to [dockerhub](https://hub.docker.com/repository/docker/mimoo/bitcoinlottery), then:

```sh
$ cd k8s-deployment
$ kubectl apply -f mongo.yaml
$ kubectl apply -f bitcoinlottery.yaml
```