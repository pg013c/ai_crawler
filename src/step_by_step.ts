import {AICrawler, UserDataInterface} from './AICrawler.js';
import dotenv from 'dotenv';

(async () => {
    dotenv.config();

    const apiKey = process.env.GEMINI_API_KEY || '';
    const aiCrawler = await AICrawler.create(apiKey);

    const homepage = 'https://navelo.pl';

    const expectedData = `
        Liczba sprzedanych: 5
        Wartość sprzedanych: 10
        Liczba kupionych: 15
        Wartość kupionych: 20
    `;

    const userCredentials: UserDataInterface = {
        username: process.env.PAGE_USERNAME || '',
        password: process.env.PAGE_PASSWORD || '',
    }

    try {
        await aiCrawler.visitPage(homepage)
        await aiCrawler.checkPage()
        await aiCrawler.findPage('Logowanie')
        await aiCrawler.checkPage()
        await aiCrawler.findLoginFormElements()
        await aiCrawler.authorizeUser(userCredentials)
        await aiCrawler.checkPage()
        await aiCrawler.findPage('Ustawienia użytkownika')
        await aiCrawler.checkPage()
        await aiCrawler.findPage('Statystyki')
        await aiCrawler.checkPage()
        await aiCrawler.compareWithData(expectedData)
        ;
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await aiCrawler.close();
    }
})();