FROM node:16.19 as builder

WORKDIR /app

RUN npm install -g yarn --force

COPY package.json /app/
COPY yarn.lock /app/

RUN yarn install --frozen-lockfile

#RUN npm run build


FROM node:16.19

WORKDIR /app

ENV NODE_ENV production
ENV PROJECT Crowdherirage
ENV SPACE espace
ENV API_URL /assets/developers-lite.html
ENV WITHCROWD_BASE_URL /api
ENV BASE_URL /api
ENV WITH_GOOGLE_KEY fillthis
ENV WITH_GOOGLE_SECRET fillthis
ENV WITH_FACEBOOK_SECRET fillthis
ENV WITHCROWD_FACEBOOK_SECRET fillthis
ENV CROWDHERITAGE_FACEBOOK_SECRET fillthis
ENV GOOGLE_MAPS_API_KEY fillthis

COPY --from=builder /app /app/

COPY . /app/

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["npm","start"]

EXPOSE 8080
