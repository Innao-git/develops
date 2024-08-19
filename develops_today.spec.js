//https://github.com/Innao-git/develops.git

import {test, expect} from '@playwright/test';
import { time } from 'console';
import { link } from 'fs';
import { get } from 'http';
const screenhots_folder = "develops_today";
const domain = 'https://develops.today';
let internal_urls = new Set();
let internal_urls_from_sitemap = new Set();
let subdomains = new Set();

/*
test('Develops Today: title, url', async ({page}) => {
    await page.goto('https://develops.today/');
    const page_title = await page.title();
    console.log('Page title is: ', page_title);
    await expect(page).toHaveTitle('DevelopsToday – Web and Mobile software development and consulting');
    
    const page_url = page.url();
    console.log('Page URL is: ', page_url);
    await expect(page).toHaveURL('https://develops.today/');
    
    
    await page.close();

});


test('Send contact form', async ({page}) => {
    await page.goto('https://develops.today/');
    let contact_us_menu_item = page.locator('//span[contains(text(), "Contact Us")]/..');
    await contact_us_menu_item.click();
    await page.waitForTimeout(2000);
    // create an array of locators
    let web = page.locator('//form//div[contains(text(), "Web")]');
    let mobile = page.locator('//form//div[contains(text(), "Mobile")]');
    let devops = page.locator('//form//div[contains(text(), "DevOps")]');
    let qa = page.locator('//form//div[contains(text(), "QA")]');
    //click on random element
    let random_element = [web, mobile, devops, qa][Math.floor(Math.random() * 4)];
    await random_element.click();
    await page.waitForTimeout(2000);
    // fill in the form
    let name = page.locator("//input[@id='name']"); 
    await name.fill("Test name", {delay:200});
    let email = page.locator("//input[@id='email']");
    await email.fill("test@gmail.com", {delay:200});
    let message = page.locator("//textarea[@id='aboutProject']");
    await message.fill("Test message", {delay:200});
    let privacy_policy = page.locator('//input[@name = "acceptPrivacyPolicy"]');
    await privacy_policy.click();
    let send_button = page.locator('//button[contains(text(), "Send message")]');
    await send_button.click();
    await page.waitForTimeout(2000);
    //here must be actual logic to check if the message was sent "Gotcha"

    let div_success = page.locator('//h2[contains(text(), "Gotcha!")]');
    await div_success.highlight();
    await page.waitForTimeout(2000);
    await expect(div_success).toBeVisible();
    //await div_success.scrollIntoViewIfNeeded();
    

    //make a screenshot in the same folder
    let path_scr = screenhots_folder + "/send_contact_form.png";
    await page.screenshot({path: path_scr});



    await page.waitForTimeout(2000);
    
    await page.close();

});
*/

//write a recursive function to check all internal links on the website
async function check_internal_links(page, internal_urls, subdomains) {
    //console.log('Page URL is: ', page.url());
    //await page.waitForSelector('//a', { state: 'visible', timeout: 8000 });
    //set a delay to wait for the page to load
    //await page.waitForTimeout(3000);
    let links = await page.locator('//a[@href]').all();
    let links_on_page = [];
    //let subdomains_on_page = [];

    //console.log('Links count is: ', links.length);
    //console.log('Links are: ', links);
    
    for (let link of links) {
        if (link == null || link == undefined || link == '' || link == ' ') {
            continue;
        }
        //await expect(link).toHaveAttribute("href");
        //wait for the link to be visible or continue if it is not
        try {
            await link.waitFor({
                state: 'visible',
                timeout: 500
            });
        } catch (error) {
            continue;
        }
        

        let href = await link.getAttribute('href');
        //handle execution context error
        if (href == null || href == undefined || href == '' || href == ' ') {
            continue;
        }
  
        if (href.includes('#') ) {
            continue;
        }
        if (href.includes('mailto:') || href.includes('tel:')) {
            continue;
        }
        //exclude javascript links because they are not real URLs
        if (href.includes('javascript:')) {
            continue;
        }
        //exclude links with /wp-content/ because they are not real URLs
        if (href.includes('/wp-content/') || href.includes('/wp-admin/')) {
            continue;
        }
        //exclude images and other files
        if (href.endsWith('.png') || href.endsWith('.jpg') || href.endsWith('.jpeg') || href.endsWith('.pdf')) {
            continue;
        }
        if (href.startsWith('/')) {
            href = domain + href;
        }
        //if link is already in the set, skip it
        if (internal_urls.has(href)) {
            continue;
        }
        
        //skip the links that are not internal like https://www.instagram.com/develops.today/
        if (href.includes('instagram') || href.includes('facebook') || href.includes('linkedin') || href.includes('twitter')) { 
            continue;
        }
        //console.log('Link is: ', href);
        //netloc is the domain name of the URL
        const netloc = new URL(href).hostname;
        //console.log('Netloc is: ', netloc);
        //check if the link is internal, taking into account the subdomains
        if (netloc == 'develops.today') {
            //console.log('Link passed check');
            internal_urls.add(href);
            links_on_page.push(href);
        } else if (netloc.includes('develops.today')) {
            //add the URL to the set of subdomains
            console.log('Subdomain URL: ', href, 'found on ', page.url());
            continue;
        }

        //if (href && href.startsWith('http') && href.includes('develops.today')) {}


    }

    for (let I = 0; I < links_on_page.length; I++) {
        const element = links_on_page[I];
        //recursively check the links on other pages from the internal URLs
        //open the links one by one
        await page.goto(element, {waitUntil: 'load'});
        //implicitly wait for the page to load
        await page.waitForLoadState();
        await check_internal_links(page, internal_urls);
    }

    //console.log('Internal URLs count is: ', internal_urls.size);
    //console.log('Internal URLs are: ', internal_urls);
}


test('Unique internal urls ammount', async ({page}) => {
    
    await page.goto('https://develops.today');
    let internal_urls = new Set();
    let subdomains = new Set();
    await check_internal_links(page, internal_urls, subdomains);
    console.log('Internal URLs count is: ', internal_urls.size);
    console.log('Internal URLs are: ', internal_urls);
    await expect(internal_urls.size).toBeGreaterThan(0);
    await page.close();
});
/*

test('Get URLs from the sitemap', async ({page}) => {
    let internal_urls_from_sitemap = new Set();
    await page.goto('https://develops.today/sitemap.xml');
    // get all URLs from the sitemap
    let urls = await page.locator('loc').all();
    let urls_count = urls.length;
    for (let url of urls) {

        console.log('URL is: ', await url.textContent());
        internal_urls_from_sitemap.add(await url.textContent());
        //console.log('URL is: ', url);
    }
    console.log('URLs count is: ', urls_count);
    // set test passed if the count of URLs is not 0
    await expect(urls_count).toBeGreaterThan(0);
    await page.close();
});

test('Compare internal URLs with sitemap URLs', async ({page}) => {
    //compare the internal URLs with the URLs from the sitemap
    let internal_urls_amount = internal_urls.size;
    console.log('Internal URLs count is: ', internal_urls.size);
    console.log('Internal URLs are: ', internal_urls);
    console.log('From sitemap count is: ', internal_urls_from_sitemap.size);
    console.log('From sitemap are: ', internal_urls_from_sitemap);
    let diff = new Set([...internal_urls].filter(x => !internal_urls_from_sitemap.has(x)));
    console.log('Difference is: ', diff);
    //if the difference is 0, the test is passed
    await expect(diff.size).toBe(0);
    await page.close();
});
*/



