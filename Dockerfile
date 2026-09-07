####################
### test & build ###
####################

# base image
FROM docker.io/node:22 AS build

# set working directory
WORKDIR /app

# install and cache app dependencies
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm config set strict-ssl false
RUN npm install

# add app
COPY . /app

# generate build
RUN npm run build -- --output-path=dist

############
### prod ###
############

# base image
FROM nginx:1.21.6-alpine

# this doesn't work due to ssl inspection. Newer apk versions allow '--no-check-certificate'
# to disable SSL checks
#RUN apk upgrade --no-cache && apk add --no-cache gettext

# copy artifact build from the 'build environment'
COPY --from=build /app/dist/browser /usr/share/nginx/html

# Remove config file in case it exists, it being regenerated when starting the actual container
# -f option is used here so the command does not fail if the file does not exist
RUN rm -f /usr/share/nginx/html/assets/config.json

ADD ./docker/entrypoint.sh /entrypoint.sh
ADD ./docker/nginx-default.conf /etc/nginx/conf.d/default.conf

# expose port 80
EXPOSE 80

# run nginx
ENTRYPOINT [ "/entrypoint.sh" ]
