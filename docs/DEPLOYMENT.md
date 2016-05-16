# Deployment


## AWS

1. consult https://coreos.com/releases/

2. new EC2, from "Community AMIs", search for "coreos beta hvm 1010" (replace version with current beta version), select latest

3. proceed with the rest of the standard AWS EC2 configuration as desired

4. consult https://coreos.com/os/docs/latest/booting-on-ec2.html for SSH details

5. wait a few minutes for EC2 provisioning, status checks, etc

5. copy [docker-compose.yml](../docker-compose.yml) to EC2 home directory

6. SSH to EC2

7.

    ```sh
    sudo mkdir -p /opt/bin
    ```

8.

    ```sh
    sudo curl -o /opt/bin/docker-compose -L https://github.com/docker/compose/releases/download/1.7.1/docker-compose-`uname -s`-`uname -m`
    ```

9.

    ```sh
    sudo chmod +x /opt/bin/docker-compose
    ```

10. tailor your ~/docker-compose.yml file

    - setting `BUSMQ_SECRET` environment to a secret string

    - replacing "build: ." with "image: blinkmobile/busmq"

    - deleting the "volumes:" section

11. in home directory, `/opt/bin/docker-compose up --build -d`


