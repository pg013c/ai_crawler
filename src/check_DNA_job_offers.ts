import {aiScraper} from "./aiScraper.js";

(async () => {
    const website = 'https://dnatechnology.io';

    const prompt = `
        You are an AI agent designed to interact with websites using tools for navigation, element finding, and data extraction. 
        Execute the following plan **sequentially, step-by-step**. Proceed to the next step **only after the successful completion of the previous one**.
        
        **Goal:** Find current job openings at ${website}, summarize them. If no openings are found, report this and summarize the company's product areas.
        
        **Plan:**
        
        1.  **Navigate to Homepage:** Use the navigation tool to go to ${website}. Confirm when the page is successfully loaded.
        2.  **Locate Careers/Jobs Information:** On the currently loaded page (${website}), 
            use tools to search for a navigation link or section related to careers or jobs. 
            Look for keywords like 'Careers', 'Jobs', 'Open Positions', 'Join Us', 'Work with us'.
        3.  **Navigate to Careers Page (if applicable):**
            * **IF** a dedicated link/section for careers/jobs is found in Step 2: Use the navigation tool to go to that specific page/URL. Confirm when the new page is loaded.
            * **ELSE (if no dedicated link/section found):** Assume job information might be on the current (main) page and proceed to Step 4.
        4.  **Find Job Listings:** On the current page (either the dedicated careers page from Step 3 or the main page), 
            use tools to locate specific job listings or a statement indicating there are no open positions. 
            Search for elements listing jobs or text like 'No open positions currently'.
        5.  **Process Findings and Report:**
            * **IF** job listings ARE found in Step 4: Use tools to extract the titles and potentially brief descriptions or summaries of the available positions. Present this summary as the result.
            * **ELSE (if no job listings are found):** State clearly that no open job positions were found. Then, use tools to find information about the company's 'Product Areas', 'Services', or 'What we do' (first search on the current page; if not found and you navigated away in step 3, consider navigating back to the homepage or looking in main navigation sections). Summarize these product areas as the result.
        
        Remember to report any issues encountered during the process (e.g., page not loading, specific link not found). 
        Only provide the final summary (either job listings or product areas) as requested.        
        `;

    await aiScraper(prompt);
})();