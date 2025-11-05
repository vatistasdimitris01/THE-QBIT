# THE QBIT - AI News Aggregator

This is a minimalist news aggregator that uses AI to find and summarize the top news stories from Greece and around the world.

This project is built with React, TypeScript, and Tailwind CSS, and it uses the Google Gemini API for content generation. It is configured for deployment on Vercel.

## Required Environment Variables

To run this application, you need to configure the following environment variables.

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

To run the project locally, you need to have Node.js and npm installed.

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Set Up Environment Variables:**
    Create a file named `.env` in the root of the project and add your keys. You will also need to get the Vercel KV variables for local development.
    ```
    # Gemini and Google Search
    API_KEY="your_gemini_api_key"
    CSE_API_KEY="your_google_search_api_key"
    CSE_ID="your_custom_search_engine_id"

    # Vercel KV (for sharing feature)
    # Go to your Vercel project -> Storage -> [Your KV Store] -> .env.local
    # Copy and paste the variables here.
    KV_URL="your_kv_url"
    KV_REST_API_URL="your_kv_rest_api_url"
    KV_REST_API_TOKEN="your_kv_rest_api_token"
    KV_REST_API_READ_ONLY_TOKEN="your_kv_read_only_token"
    ```

3.  **Run the Development Server:**
    This project uses the Vercel CLI to run the serverless API functions alongside the Vite frontend dev server.

    *   **Install Vercel CLI:**
        ```bash
        npm install -g vercel
        ```
    *   **Run the app:**
        ```bash
        vercel dev
        ```
    This command will start the Vite server for the frontend and a server for your API functions, allowing them to work together. Open your browser to the URL provided (usually `http://localhost:3000`).

---

## Deployment to Vercel

**CRITICAL:** Since this project is now configured to use Vite, you must update your project settings in the Vercel dashboard.

1.  **Push to GitHub:**
    Commit all the new and updated files and push them to your GitHub repository.

2.  **Configure Vercel Project:**
    *   Go to your project's dashboard on Vercel.
    *   Click on the **Settings** tab.
    *   Under **General**, change the **Framework Preset** from "Other" to **"Vite"**.
    *   Vercel will automatically configure the correct Build and Output settings. They should be:
        *   **Build Command:** `vite build`
        *   **Output Directory:** `dist`
        *   **Install Command:** `npm install`
    *   Save the changes.

3.  **Add Environment Variables to Vercel:**
    *   In your Vercel project settings, go to the **Environment Variables** tab.
    *   Add the `API_KEY`, `CSE_API_KEY`, and `CSE_ID` with their corresponding values.
    *   Ensure you have also connected the Vercel KV store as described above.

4.  **Redeploy:**
    *   Go to the **Deployments** tab and trigger a new deployment. Vercel will now use the Vite preset to correctly build and deploy your application.