# Deployment


## AWS (once per EC2)

1. consult https://coreos.com/releases/

2. new EC2, from "Community AMIs", search for "coreos beta hvm 1010" (replace version with current beta version), select latest

3. proceed with the rest of the standard AWS EC2 configuration as desired

4. consult https://coreos.com/os/docs/latest/booting-on-ec2.html for SSH details

5. wait a few minutes for EC2 provisioning, status checks, etc

6. SSH to EC2

7. make a writable directory for new executables:

    sudo mkdir -p /opt/bin

8. install docker-compose 1.7.1

    sudo curl -o /opt/bin/docker-compose -L https://github.com/docker/compose/releases/download/1.7.1/docker-compose-`uname -s`-`uname -m`

9. make docker-compose executable

    sudo chmod +x /opt/bin/docker-compose

10. enable CoreOS' fleet system

    sudo systemctl enable etcd2.service
    sudo systemctl start etcd2.service

    sudo systemctl enable fleet.service
    sudo systemctl start fleet.service


## BusMQ (once per version / update)

1. copy [busmq.service](../busmq.service) to EC2 home directory

2. tailor your ~/busmq.service file if necessary

3. copy [docker-compose.yml](../docker-compose.yml) to EC2 home directory

4. tailor your ~/docker-compose.yml file

    - set `BUSMQ_SECRET` environment to a secret string

    - set `LETSENCRYPT_DOMAIN` and `LETSENCRYPT_EMAIL` environment for HTTPS

    - set `NODE_ENV` to "production"

    - replace "build: ." with "image: blinkmobile/busmq"

    - delete everything in "volumes:" section

    - add a "volumes:" entry to mount something suitable to `/app/public`

5. in home directory, `fleet destroy busmq.service; fleet start busmq.service`

6. configure AWS Route53 Record Set to give a domain name to EC2
