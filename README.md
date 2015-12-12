# saml-configuration-tutorials-webtask
A small webscraper webtask that lists SAML configuration tutorials from different vendors.

# SAML Configuration Tutorials Webtask

A webtask that lists SAML Configuration Tutorials for third party applications from different vendors. Demo: https://webtask.it.auth0.com/api/run/wt-sandrino-auth0_com-0/saml-config

## Configure Webtask

If you haven't configured Webtask on your machine run this first:

```
npm i -g wt-cli
wt init
```

> Requires at least node 0.10.40 - if you're running multiple version of node make sure to load the right version, e.g. "nvm use 0.10.40"

## Deployment

If you want to run it in your own container:

```
wt create https://raw.githubusercontent.com/sandrinodimattia/saml-configuration-tutorials-webtask/master/task.js --name saml-config
```
