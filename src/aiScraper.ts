import {UserDataInterface} from './AICrawler.js';
import {Element, WebsiteCrawler} from "./WebsiteCrawler.js";
import {generateText, tool} from "ai";
import {createGoogleGenerativeAI} from "@ai-sdk/google";
import {z} from "zod";
import dotenv from 'dotenv';

export const aiScraper = async (prompt: string) => {
    dotenv.config();

    const apiKey = process.env.GEMINI_API_KEY || '';
    const googleLLM = createGoogleGenerativeAI({apiKey});

    const websiteCrawler = await WebsiteCrawler.create();

    const userCredentials: UserDataInterface = {
        username: process.env.PAGE_USERNAME || '',
        password: process.env.PAGE_PASSWORD || '',
    }

    const webcrawlerVisitPage = async (url: string) => {
        await websiteCrawler.visitPage(url);
        await websiteCrawler.checkPage();

        return await websiteCrawler.getPageContent();
    };

    const webcrawlerAuthorizeUser = async (formElements: Element[]) => {
        await websiteCrawler.authorizeUser(formElements, userCredentials);
        await websiteCrawler.checkPage();

        return await websiteCrawler.getPageContent();
    };

    try {
        const completion = await generateText({
            prompt: prompt,
            model: googleLLM('gemini-2.0-flash'),
            tools: {
                webcrawlerVisitPage: tool({
                    description: 'Visit website for given url',
                    parameters: z.object({
                        url: z.string().describe('The url to visit'),
                    }),
                    execute: async ({url}) => {
                        return webcrawlerVisitPage(url)
                    }
                }),
                webcrawlerAuthorizeUser: tool({
                    description: 'Authorize user for given html form elements',
                    parameters: z.object({
                        elements: z.array(z.object({element_name: z.string(), element_path: z.string()})),
                    }),
                    execute: async ({elements}) => {
                        return webcrawlerAuthorizeUser(elements)
                    }
                }),
            },
            maxSteps: 10
        });

        console.dir(completion.text, {depth: null});
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await websiteCrawler.close();
    }
}