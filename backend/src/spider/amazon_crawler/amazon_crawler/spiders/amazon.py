import scrapy
import json

class AmazonSpider(scrapy.Spider):
    name = 'amazon'

    custom_headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
    }

    def __init__(self, *args, **kwargs):
        super(AmazonSpider, self).__init__(*args, **kwargs)
        self.asin_found = False  # Initialize the flag in the constructor.


    def start_requests(self):
        
        asin_number = getattr(self, 'asin', None)
        keywords = getattr(self, 'keywords', None)
        url = f'https://www.amazon.com/s?k={keywords}'

        max_pages = 3

        current_page=1

        while current_page <= max_pages:
            with open('debug.json', 'w') as json_file:
                json.dump(current_page, json_file)
            
            url = f'https://www.amazon.com/s?k={keywords}&page={current_page}'

            yield scrapy.Request(url, headers=self.custom_headers, callback=self.parse, meta={'current_page': current_page, 'asin_number': asin_number})

            current_page += 1

    def parse(self, response):

        asin_number = response.meta['asin_number'] 

        current_page = response.meta['current_page'] 

        products = response.css('div.s-result-item:not(.AdHolder)')
        rank_within_page = 1


        scraped_data = []

        for product in products:
            data_asin = product.css('::attr(data-asin)').get()
            if data_asin == "":
                continue
            if asin_number and asin_number in data_asin:
                print("asin Found ***************************************")
                print(asin_number)
                scraped_data.append({
                    'ASIN': data_asin,
                    'Rank': rank_within_page,
                    'Page': current_page,
                })
                self.asin_found = True
                with open('amazon_results.json', 'w') as json_file:
                    print("PRINTING SCRAPED DATA -----------------------------------------------------")
                    print(scraped_data)
                    json.dump(scraped_data, json_file)
                    json_file.write('\n')

            print("printin current page *********************************")
            print(current_page)
            print(self.asin_found)
            if not self.asin_found and current_page == 3:
                with open('amazon_results.json', 'w') as json_file:
                    print("ASIN Not Found in 3 pages, writing 'not found'")
                    json_file.write('not found\n')
                        

            rank_within_page += 1
        

