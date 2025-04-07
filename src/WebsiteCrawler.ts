import puppeteer, {Browser, Page} from 'puppeteer';

export interface UserDataInterface {
    username: string;
    password: string;
}

export interface Element {
    element_name: string;
    element_path: string;
}

export class WebsiteCrawler {
    private page!: Page;
    private browser!: Browser;

    private constructor(browser: Browser, page: Page) {
        this.browser = browser;
        this.page = page;
    }

    public static async create(): Promise<WebsiteCrawler> {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();

        return new WebsiteCrawler(browser, page);
    }

    public async checkPage(): Promise<WebsiteCrawler> {
        console.log(`Current page URL: ${this.page.url()}`);

        return this;
    }

    public async getPageContent(): Promise<string> {
        return await this.page.content();
    }

    public async visitPage(url: string): Promise<WebsiteCrawler> {
        await this.page.goto(url);

        return this;
    }

    public findLoginElement(loginFormElements: Element[], name: string): string | null {
        const element = loginFormElements.find(element => element.element_name === name);

        if (!element) {
            return null;
        }

        if (!element.element_path.startsWith('#')) {
            return `#${element.element_path}`;
        }

        return element.element_path;
    }

    public async authorizeUser(loginFormElements: Element[], userData: UserDataInterface): Promise<WebsiteCrawler> {
        if (!loginFormElements || loginFormElements.length === 0) {
            throw new Error('Login form elements are not initialized. Please call findLoginFormElements first.');
        }

        console.log(`Authorizing user: ${userData.username}`);

        const loginElement = this.findLoginElement(loginFormElements, 'email');
        if (!loginElement) {
            throw new Error('Email input not found');
        }

        const emailInput = await this.page.$(loginElement);
        if (emailInput) {
            await emailInput.type(userData.username);
        } else {
            throw new Error('Email input not found');
        }

        const passwordElement = this.findLoginElement(loginFormElements, 'password');

        if (!passwordElement) {
            throw new Error('Password input not found');
        }

        const passwordInput = await this.page.$(passwordElement);
        if (passwordInput) {
            await passwordInput.type(userData.password);
        } else {
            throw new Error('Password input not found');
        }

        const submitElement = this.findLoginElement(loginFormElements, 'submit');
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

    public async close(): Promise<void> {
        console.log('Closing the browser...');
        await this.browser.close();
    }
}