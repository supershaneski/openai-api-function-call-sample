openai-api-function-call-sample
======

A sample app to demonstrate the newly added [function calling capabilities](https://openai.com/blog/function-calling-and-other-api-updates) in OpenAI Chat Completions API.

This application is built using manual setup of Next.js 13.

# Setup

Clone the repository and install the dependencies

```sh
git clone https://github.com/supershaneski/openai-api-function-call-sample.git myproject

cd myproject

npm install
```

Copy `.env.example` and rename it to `.env` then edit the `OPENAI_API_KEY` and use your own `OpenAI API key`.

```javascript
OPENAI_API_KEY=YOUR-OPENAI-API-KEY
```

Then run the app

```sh
npm run dev
```

Open your browser to `http://localhost:4000/` to load the application page.
