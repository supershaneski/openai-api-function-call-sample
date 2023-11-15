openai-api-function-call-sample
======

v0.0.2

A sample app to demonstrate [Function calling](https://platform.openai.com/docs/guides/function-calling) using the latest format in [Chat Completions API](https://platform.openai.com/docs/guides/text-generation/chat-completions-api) and also in [Assistants API](https://platform.openai.com/docs/assistants/overview).

This application is built using manual setup of Next.js 13.

* Updated: Using [v4.18.0 OpenAI Node module](https://www.npmjs.com/package/openai)

---


# Setup

Clone the repository and install the dependencies

```sh
git clone https://github.com/supershaneski/openai-api-function-call-sample.git myproject

cd myproject

npm install
```

Copy `.env.example` and rename it to `.env` then edit the `OPENAI_API_KEY` and use your own `OpenAI API key`. If you also want to use the **Assistants API**, please edit `OPENAI_ASSISTANT_ID` with your actual Assistant ID.

```javascript
OPENAI_API_KEY=YOUR-OPENAI-API-KEY
OPENAI_ASSISTANT_ID=YOUR-OPENAI-ASSISTANT-ID
```

Then run the app

```sh
npm run dev
```

Open your browser to `http://localhost:4000/` to load the application page.
