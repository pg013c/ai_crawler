import {aiScraper} from "./aiScraper.js";

(async () => {
    const website = 'https://www.aidevs.pl';

    const prompt = `
    You are an AI agent designed to interact with websites using tools for navigation, element finding, and data extraction. 
    Execute the following plan **sequentially, step-by-step**. Proceed to the next step **only after the successful completion of the previous one**.
    
    **Goal:** Collect specific information about the course available on the ${website} website.
    
    **Plan:**
    
    1.  **Navigation:** 
        Use the navigation tool to go to the page ${website}. Confirm successful page load.
    2.  **Information Search Strategy:** 
        For each piece of information listed below, first search the *currently loaded page* for relevant keywords or sections. 
        If the information is not found, look for navigation links leading to potentially relevant subpages (e.g., 'O kursie', 'Autor', 'Program', 'Harmonogram', 'Opinie') 
        and use tools to navigate there *before* attempting to extract data from that subpage.
    3.  **Extraction - Instructor/Author:** 
        Find and extract the name(s) of the person(s) responsible for the course. 
        Search for keywords: 'Autor' (Author), 'Prowadzący' (Instructor), 'Twórca kursu' (Course Creator), 'O autorze' (About the Author).
    4.  **Extraction - Start Date:** 
        Find and extract the course start date. 
        Search for keywords: 'Data rozpoczęcia' (Start Date), 'Start kursu' (Course Start), 'Harmonogram' (Schedule), 'Terminy' (Dates), 'Kiedy start?' (When does it start?).
    5.  **Extraction - Main Goals:** 
        Find and summarize the main goals or objectives of the course program. 
        Search for keywords: 'Cele kursu' (Course Goals), 'Program' (Program/Syllabus), 'Agenda' (Agenda), 'Czego się nauczysz' (What you will learn), 'Dla kogo jest ten kurs' (Who is this course for).
    6.  **Extraction - Opinions/Reviews:** 
        Find and summarize opinions or reviews about the course. 
        Search for keywords: 'Opinie' (Opinions/Reviews), 'Recenzje' (Reviews), 'Testimonials' (Testimonials), 'Co mówią uczestnicy' (What participants say).
    7.  **Final Report:** 
        Collect all found information (Instructor/Author, Start Date, Main Goals, Opinions/Reviews) into a single summary. 
        If any piece of information could not be found despite searching the site (and potential subpages), clearly state "Information not found" for that item in the summary.
    
        Remember to use tools appropriately for each action (navigation, searching, extraction) and proceed only after the previous step is successfully completed. Report any problems encountered (e.g., page loading error, inability to find a section). Provide only the final summary as instructed.    
    `;

    await aiScraper(prompt);
})();