# bitcoinlottery

## Instructions to run with docker-compose

```sh
$ cd ./app
$ make up 
```

Note that if changes are made in a docker container, `docker-compose up` does not re-build them. 
You need to run `docker-compose build` first.

## Instruction to push an image with docker

([official doc](https://docs.docker.com/docker-hub/))

build and get the "image id":

```sh
$ docker build --pull --rm -f "app/Dockerfile" -t mimoo/bitcoinlottery:latest "app"
```

test the app with docker-compose:

```sh
$ cd app
$ make up
```

then push it to dockerhub:

```sh
$ docker push mimoo/bitcoinlottery:latest
```

After that, you might want to restart the bitcoinlottery pod in kubernetes (if you are running a cluster):

```sh
kubectl rollout restart deployment/bitcoinlottery-deployment
```

## Instructions to run with kubernetes

The `app/Dockerfile` is pushed to [dockerhub](https://hub.docker.com/repository/docker/mimoo/bitcoinlottery), then:

```sh
$ cd k8s-deployment
$ kubectl apply -f mongo.yaml
$ kubectl apply -f bitcoinlottery.yaml
```

note that if you're running it with minikube, you'll have to also run the loadbalancer via:

```sh
$ minikube tunnel
```
