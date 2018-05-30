# Republik Frontend

The front-end of [republik.ch](https://www.republik.ch/en).

## Usage

### Quick start

You need to have node 8.9+ installed.

Bootstrap your .env file:

```
cp .env.example .env
```

Install and run:

```
npm install
npm run dev
```

The example env assumes a backend running on port 5000. The backend needs to run on the same TLD for cookie sharing.

#### Setup Local Backend

See «[How To Run: Setup the Backends](https://github.com/orbiting/docs/blob/master/guides/how-to-run.md#1-setup-the-backends)».

#### Proxy Production Backend

Don't care about the developing the backend? Just want to test something against our production backend? We have [yet another proxy](https://github.com/orbiting/proxy) for that:

```
npm i yaproxy -g
PORT=5000 TARGET=https://api.republik.ch CORS_ORIGIN=http://localhost:3010 yaproxy
```

(Obvious )Warning: whatever you do here is for realz, if you login to your account and change things they are changed on republik.ch! 

### Testing

Run a test locally:
```
npm run tape components/Me/index.test.js
```

Run all tests:
```
npm run test
```

### Pledge

An online magazine is financed by people pledging to pay for its content. And if a crowd forms around a magazine it becomes crowdfunded. Crowdfundings have a dedicated name in the backend. You can configure the currently active one via the environment. You can only point the front end at one crowdfunding at a time.

```
CROWDFUNDING_NAME=REPUBLIK
```

Additionally you can configure a second `SALES_UP` crowdfunding. This can be used while the main crowdfunding is inactive but you still wish to sell something.

```
SALES_UP=LAUNCH
```

#### Payment

Payment provider configuration can be passed in via the environment. `PUBLIC_BASE_URL` is used for PostFinance and PayPal return urls.

```
PUBLIC_BASE_URL=https://example.com

STRIPE_PUBLISHABLE_KEY=

PF_PSPID=
PF_FORM_ACTION=https://e-payment.postfinance.ch/ncol/test/orderstandard.asp

PAYPAL_FORM_ACTION=https://www.sandbox.paypal.com/cgi-bin/webscr
PAYPAL_BUSINESS=
PAYPAL_DONATE_LINK=
```

#### Email

Configure at which email address you're available for general questions, investor relations and payment issues:

```
EMAIL_CONTACT=contact@example.com
EMAIL_IR=ir@example.com
EMAIL_PAYMENT=payment@example.com
```

### Piwik

You can enable tracking by setting a base url and site id:

```
PIWIK_URL_BASE=https://piwik.example.com
PIWIK_SITE_ID=1
```

### Theming

Your logo, fonts and colors? See [orbiting/styleguide](https://github.com/orbiting/styleguide#theming)

### Curtain

You can configure a curtain message, to show a teaser website.

```
CURTAIN_MESSAGE=""
```

Additionally you can configure a backdoor URL. Opening that URL sets a cookie which allows to circumvent the countdown page.

```
CURTAIN_BACKDOOR_URL=/iftah-ya-simsim
```

## License

The source code is «BSD 3-clause» licensed.
