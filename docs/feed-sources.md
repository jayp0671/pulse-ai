# Feed Sources

## The New York Times
- URL: `https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml`
- Feed type: RSS

## NPR
- URL: `https://feeds.npr.org/1001/rss.xml`
- Feed type: RSS

## BBC News
- URL: `http://feeds.bbci.co.uk/news/rss.xml`
- Feed type: RSS

## The Verge
- URL: `https://www.theverge.com/rss/index.xml`
- Feed type: Atom

## Notes
- The first three feeds normalize from RSS-style `rss.channel.item` shapes.
- The Verge normalizes from Atom-style `feed.entry` shapes.
- The default item limit is controlled by `ARTICLE_LIMIT_PER_FEED` and defaults to `5`.
