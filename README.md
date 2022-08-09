#Casper HAProxy

Generate and run a dockerized HAPRoxy that automatically load balance requests to the rpc endpoints.

# How to build

## Local dev

```bash
yarn install
yarn run conf [PUBLIC NODE URL]
```

This will generate a haproxy.cfg file at the root of the project.
It can be used directly with any haproxy.
The rpc endpoint /rpc will be bind to the port 8500.
The stats endpoint /stats will be bind to the port 8404.

The node health is checked by sending a rpc request to the info_get_status method and check if the network name is the same from the initial node url provided.

## Docker build

```bash
docker build --build-arg rpc=[PUBLIC NODE URL] . 
```
## Kubernetes deployment

Use the correct folder for either testnet or mainnet config.

### Warning: The current kubernetes files are specific to my kubernetes architecture. It's basically an example how to use Casper HAProxy on Kubernetes.

```bash
kubectl apply -f kubernetes/(testnet|mainnet)/
```
