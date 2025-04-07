import {aiScraper} from "./aiScraper.js";

(async () => {
    const homepage = 'https://navelo.pl';

    const expectedData = `
        Liczba sprzedanych: 5
        Wartość sprzedanych: 10
        Liczba kupionych: 15
        Wartość kupionych: 20
    `;

    const prompt = `
        You are an AI agent tasked with interacting with a website to collect and compare data.
        You have access to tools that allow navigation, clicking elements, filling forms, and extracting data.
        Execute the following tasks **sequentially, step-by-step**.
        Proceed to the next step **only after the successful completion of the previous one**.

        Here is the plan of action:

        1.  **Initial Navigation:**
            Go to the website: ${homepage}
        2.  **Find and Navigate to Login:**
            On the currently loaded page, find the link or button leading to the login page
            (it might contain text like "Logowanie", "Zaloguj się", "Sign in", etc.) and navigate to the found address.
        3.  **Login:**
            On the login page, find the IDs of the fields for username/email and password.
            Pass the names of these fields and their HTML identifiers to the tool responsible for authorization.
            Confirm successful login.
        4.  **Navigate to Statistics:**
            After logging in, find the link or navigation element on the page leading to the "Statystyki" (Statistics) section and navigate there.
        5.  **Data Extraction and Comparison:**
            On the "Statystyki" (Statistics) page, find the user data.
            Extract this data.
            Then, compare it with the following reference data:

        === DATA ===
        ${expectedData}
        === END OF DATA ===

        Inform me about the comparison result.

        Remember to confirm the completion of each step before proceeding to the next.
        If you encounter a problem at any stage (e.g., cannot find an element, login failed), inform me about it.
        `;

    await aiScraper(prompt);
})();