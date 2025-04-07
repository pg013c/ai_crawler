import puppeteer, {Browser, Page} from 'puppeteer';
import {createGoogleGenerativeAI} from '@ai-sdk/google';
import {generateObject, generateText} from "ai";
import {z} from "zod";

export interface UserDataInterface {
    username: string;
    password: string;
}

interface Element {
    element_name: string;
    element_path: string;
}

export class AICrawler {
    private page!: Page;
    private browser!: Browser;
    private googleLLM: ReturnType<typeof createGoogleGenerativeAI>;
    private loginFormElements!: Element[];

    private constructor(apiKey: string, browser: Browser, page: Page) {
        this.googleLLM = createGoogleGenerativeAI({apiKey});
        this.browser = browser;
        this.page = page;
    }

    public static async create(apiKey: string): Promise<AICrawler> {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();

        return new AICrawler(apiKey, browser, page);
    }

    public async checkPage(): Promise<AICrawler> {
        await console.log(`Current page URL: ${this.page.url()}`);

        return this;
    }

    public async visitPage(url: string): Promise<AICrawler> {
        await this.page.goto(url);

        return this;
    }

    public async findLoginFormElements(): Promise<AICrawler> {
        const htmlContent = await this.page.content();
        const result = await generateObject({
            model: this.googleLLM('gemini-2.0-flash'),
            system: `
                Analyze the provided HTML content to find either a login form (\`<form>...</form>\`) or a link (\`<a>...</a>\`) pointing to a login page.

                If a login form is found, return a JSON object as plain text, containing CSS selectors for the form elements, in this format:
                {
                "login_element": "CSS selector for the username/email input (e.g., #id or .class)",
                "password_element": "CSS selector for the password input (e.g., #id or .class)",
                "submit_element": "CSS selector for the submit button/input (e.g., #id or .class)"
                }
                
                If a login link is found, return a JSON object as plain text, in this format:
                {
                "link": "The URL (href attribute) of the login link"
                }
                
                If neither a login form nor a login link is found, return an empty JSON object as plain text:
                {}
                
                Important:
                - Return only the resulting JSON object as plain text.
                - Do not include any explanations, comments, or markdown formatting (like \`\`\`json).
                - Provide just the raw object string.
            `,
            prompt: `HTML Content: ${htmlContent}`,
            schema: z.object({
                loginForm: z.object({
                    elements: z.array(z.object({element_name: z.string(), element_path: z.string()})),
                    link: z.string(),
                }),
            }),
        });

        if (result.object.loginForm.elements.length === 0) {
            throw new Error('Login form not found');
        }

        this.loginFormElements = result.object.loginForm.elements;

        return this;
    }

    public findLoginElement(name: string): string | null {
        const element = this.loginFormElements.find(element => element.element_name === name);

        if (!element) {
            return null;
        }

        return element.element_path;
    }

    public async authorizeUser(userData: UserDataInterface): Promise<AICrawler> {
        if (!this.loginFormElements || this.loginFormElements.length === 0) {
            throw new Error('Login form elements are not initialized. Please call findLoginFormElements first.');
        }

        console.log(`Authorizing user: ${userData.username}`);

        const loginElement = this.findLoginElement('email');
        if (!loginElement) {
            throw new Error('Email input not found');
        }

        const emailInput = await this.page.$(loginElement);
        if (emailInput) {
            await emailInput.type(userData.username);
        } else {
            throw new Error('Email input not found');
        }

        const passwordElement = this.findLoginElement('password');

        if (!passwordElement) {
            throw new Error('Password input not found');
        }

        const passwordInput = await this.page.$(passwordElement);
        if (passwordInput) {
            await passwordInput.type(userData.password);
        } else {
            throw new Error('Password input not found');
        }

        const submitElement = this.findLoginElement('submit');
        const loginButton = await this.page.$(submitElement || 'button[type="submit"]');
        if (loginButton) {
            await Promise.all([
                loginButton.click(),
                this.page.waitForNavigation({waitUntil: 'domcontentloaded', timeout: 10000}),
            ]);
        } else {
            throw new Error('Login button not found');
        }

        console.log('User authorized');

        return this;
    }

    public async findPage(pageName: string): Promise<AICrawler> {
        console.log(`Finding page: ${pageName}`);

        const htmlContent = await this.page.content();

        const result = await generateObject({
            model: this.googleLLM('gemini-2.0-flash'),
            system: `
                Analyze the provided HTML content to find a link (\`<a>...</a>\`) related to the criteria specified below this prompt.

                If such a link is found, return a JSON object as plain text containing the link's URL, in this format:
                {
                "link": "The URL (href attribute) of the matching link"
                }
                
                If no such link is found, return an empty JSON object as plain text:
                {}
                
                Important:
                - Return only the resulting JSON object as plain text.
                - Do not include any explanations, comments, or markdown formatting (like \`\`\`json).
                - Provide just the raw object string.
            `,
            prompt: `
                HTML Content: ${htmlContent}
                Content to find: ${pageName}
            `,
            schema: z.object({
                linkData: z.object({
                    link: z.string(),
                }),
            }),
        });

        if (result.object.linkData.link.length === 0) {
            throw new Error('Link not found');
        }

        await this.page.goto(result.object.linkData.link);

        return this;
    }

    public async compareWithData(expectedData: any): Promise<AICrawler> {
        const htmlContent = await this.page.content();

        const result = await generateText({
            model: this.googleLLM('gemini-2.0-flash'),
            system: `
                You are a data analyst. Your task is to compare the data extracted from the provided HTML content against the expected data (also provided). Report any differences you find in the form of a list.
            `,
            prompt: `
                HTML Content: ${htmlContent}
                Expected data: ${expectedData}
            `,
        });

        console.log(result.text);

        return this;
    }

    public async close(): Promise<void> {
        console.log('Closing the browser...');
        await this.browser.close();
    }
}