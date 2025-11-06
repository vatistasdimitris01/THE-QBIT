# THE QBIT - AI News Aggregator

This is a minimalist news aggregator that uses AI to find and summarize the top news stories from Greece and around the world.

This project is built with React, TypeScript, and Tailwind CSS, and it uses the Google Gemini API for content generation. It is configured for deployment on Vercel.

## Required Environment Variables (Vercel Setup)

Before running the application (either locally or deployed), you must configure the following environment variables in your Vercel project settings.

1.  **`API_KEY`**
    *   **Purpose**: Your API key for the Google Gemini API, which generates the news briefings.
    *   **How to get it**: Visit Google AI Studio ([https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)) to create and copy your API key.

2.  **`CSE_API_KEY`**
    *   **Purpose**: The API key for the Google Custom Search JSON API, which the AI uses to find recent news articles.
    *   **How to get it**:
        1.  Go to the Google Cloud Console ([https://console.cloud.google.com/](https://console.cloud.google.com/)).
        2.  Create a new project or select an existing one.
        3.  Go to "APIs & Services" > "Credentials".
        4.  Click "Create Credentials" > "API key".
        5.  **Important**: Ensure the "Custom Search API" is enabled for your project in the "Library" section.

3.  **`CSE_ID`**
    *   **Purpose**: The unique ID for your Programmable Search Engine instance.
    *   **How to get it**:
        1.  Go to the Programmable Search Engine control panel ([https://programmablesearchengine.google.com/](https://programmablesearchengine.google.com/)).
        2.  Create a new search engine (configure it to search the entire web).
        3.  On the "Basics" tab of the control panel, find and copy your "Search engine ID".

---
## Vercel KV Store (Required for Sharing)

This project uses **Vercel KV** (a Redis-compatible key-value store) to handle shareable links. You **must** create and connect a KV store to your Vercel project for the share feature to work.

1.  Go to the **Storage** tab in your Vercel project dashboard.
2.  Click **Create Database** and select **KV (Redis)**.
3.  Follow the prompts to create the store and connect it to your project. Vercel will automatically add the necessary environment variables (`KV_URL`, `KV_REST_API_URL`, etc.) to your project.

---

## Local Development

To run the project locally, you'll need Node.js, npm, and the Vercel CLI. This setup uses the Vercel CLI to run the serverless API functions (`/api`) alongside the Vite frontend dev server.

1.  **Clone the Repository:**
    Get a local copy of the project.

2.  **Install Vercel CLI:**
    If you don't have it already, install it globally:
    ```bash
    npm install -g vercel
    ```

3.  **Link to Vercel Project:**
    Navigate to the project directory and link it to your Vercel project. This is crucial for fetching environment variables.
    ```bash
    vercel link
    ```
    Follow the prompts to connect to your Vercel account and the correct project.

4.  **Pull Environment Variables:**
    Once linked, pull your environment variables from Vercel. This will create a `.env.development.local` file with all the necessary keys you configured in the Vercel dashboard (including the Google API keys and the Vercel KV keys).
    ```bash
    vercel env pull .env.development.local
    ```
    **Note:** Ensure you have already added `API_KEY`, `CSE_API_KEY`, `CSE_ID` and connected the KV store in your Vercel project settings *before* running this command.

5.  **Install Dependencies:**
    Now, install the project's dependencies.
    ```bash
    npm install
    ```

6.  **Run the Development Server:**
    Start the local development server.
    ```bash
    vercel dev
    ```
    This command starts both the Vite server for the frontend and a local server for your API functions. Open your browser to the URL provided (usually `http://localhost:3000`).

---

## Deployment to Vercel

**CRITICAL:** This project is configured to use Vite. Ensure your project settings in the Vercel dashboard are correct.

1.  **Push to GitHub:**
    Commit your code and push it to your GitHub repository linked to Vercel.

2.  **Configure Vercel Project:**
    *   Go to your project's settings on Vercel.
    *   Under **General**, set the **Framework Preset** to **"Vite"**.
    *   Vercel will automatically configure the correct Build and Output settings:
        *   **Build Command:** `vite build`
        *   **Output Directory:** `dist`
        *   **Install Command:** `npm install`
    *   Save the changes.

3.  **Check Environment Variables & KV Store:**
    *   Ensure your environment variables (`API_KEY`, `CSE_API_KEY`, `CSE_ID`) are set in the Vercel dashboard.
    *   Confirm the Vercel KV store is connected under the **Storage** tab.

4.  **Deploy:**
    *   Trigger a new deployment from the **Deployments** tab. Vercel will use the Vite preset to build and deploy your application.