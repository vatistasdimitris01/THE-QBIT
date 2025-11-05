# THE QBIT - AI News Aggregator

This is a minimalist news aggregator that uses AI to find and summarize the top news stories from Greece and around the world.

This project is built with React, TypeScript, and Tailwind CSS, and it uses the Google Gemini API for content generation. It is configured for deployment on Vercel.

## Required Environment Variables

To run this application, you need to configure the following environment variable.

1.  **`API_KEY`**
    *   **Purpose**: Your API key for the Google Gemini API, which generates the news briefings.
    *   **How to get it**: Visit Google AI Studio ([https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)) to create and copy your API key.

---

## Local Development

To run the project locally, you need to have Node.js and npm installed.

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Set Up Environment Variables:**
    Create a file named `.env` in the root of the project and add your key:
    ```
    API_KEY="your_gemini_api_key"
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
    *   Add the `API_KEY` with its corresponding value.
    *   Ensure the type is "Secret".

4.  **Redeploy:**
    *   Go to the **Deployments** tab and trigger a new deployment. Vercel will now use the Vite preset to correctly build and deploy your application.