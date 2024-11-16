// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: book; share-sheet-inputs: plain-text;

const COIN_KEY = "";
const STOCK_KEY = "";

// Crypto
const CRYPTO_TICKERS = ["BTC", "SOL", "ETH"];
const STOCK_TICKERS = ["VOO", "AMZN"];
const ORDER = ["BTC", "SOL", "ETH"];

// Get data
let cryptoInfo = await fetchCryptoPrices();
let stockInfo = await fetchStockPrices();

// Combine crypto and stocks to one object
let freshCrypto = cryptoInfo.fresh;
let freshStock = stockInfo.fresh;
let assets = [...stockInfo.data, ...cryptoInfo.data];

// Create widget
let widget = await createWidget();

// Required for Scriptable
if (config.runsInWidget) {
  // The script runs inside a widget, so we pass our instance of ListWidget to be shown inside the widget on the Home Screen.
  Script.setWidget(widget);
} else {
  // The script runs inside the app, so we preview the widget.
  widget.presentSmall();
}

// Required for Scriptable
// Calling Script.complete() signals to Scriptable that the script have finished running.
// This can speed up the execution, in particular when running the script from Shortcuts or using Siri.
Script.complete();

// Helpers
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Fetches and formats the crypto prices
async function fetchCryptoPrices(symbol) {
  try {
    let url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${CRYPTO_TICKERS.join(
      ","
    )}&convert=USD`;
    let req = new Request(url);
    req.headers = {
      "X-CMC_PRO_API_KEY": COIN_KEY,
    };
    let response = await req.loadJSON();
    let coins = response.data;

    // Format for widget
    let formatted_for_widget = [];
    for (const [key, value] of Object.entries(coins)) {
      // Format price
      let price = value.quote.USD.price;
      let formatted_price = price;
      if (price > 1000) {
        formatted_price = price.toFixed(0);
      } else {
        formatted_price = price.toFixed(2);
      }

      // Calc and format price change
      let percent_change_24h = value.quote.USD["percent_change_24h"];
      let formatted_percent_change = Number(percent_change_24h).toFixed(2);

      let price_change = price - price / (1 + percent_change_24h / 100);
      let formatted_price_change = price_change;
      if (price_change > 1000) {
        formatted_price_change = price_change.toFixed(0);
      } else {
        formatted_price_change = price_change.toFixed(2);
      }

      // Add to formatted array
      formatted_for_widget.push({
        type: "crypto",
        symbol: key,
        name: value.name,
        price: numberWithCommas(formatted_price),
        changePercent: formatted_percent_change.toString(),
        changeValue: numberWithCommas(formatted_price_change),
      });
    }
    Keychain.set("crypto", JSON.stringify(formatted_for_widget));
    return { fresh: true, data: formatted_for_widget };
  } catch (e) {
    console.log("Crypto error");
    console.log(e);
    const cached_crypto = Keychain.get("crypto");
    return { fresh: false, data: JSON.parse(cached_crypto) };
  }
}

// Fetches and formats the crypto prices
async function fetchStockPrices(symbol) {
  try {
    let url = `https://api.twelvedata.com/quote?apikey=${STOCK_KEY}&interval=1day&symbol=${STOCK_TICKERS.join(
      ","
    )}`;
    let req = new Request(url);
    let stocks = await req.loadJSON();

    // Format for widget
    let formatted_for_widget = [];
    for (const [key, value] of Object.entries(stocks)) {
      // Format price
      let price = value.close;
      let formatted_price = price;
      if (price > 1000) {
        formatted_price = Number(price).toFixed(0);
      } else {
        formatted_price = Number(price).toFixed(2);
      }

      // Calc and format price change
      let percent_change_24h = value.percent_change;
      let formatted_percent_change = Number(percent_change_24h).toFixed(2);

      let price_change = price - price / (1 + percent_change_24h / 100);
      let formatted_price_change = price_change;
      if (price_change > 1000) {
        formatted_price_change = price_change.toFixed(0);
      } else {
        formatted_price_change = price_change.toFixed(2);
      }

      // Add to formatted array
      formatted_for_widget.push({
        type: "stock",
        symbol: key,
        name: key,
        price: numberWithCommas(formatted_price),
        changePercent: formatted_percent_change.toString(),
        changeValue: numberWithCommas(formatted_price_change),
      });
    }
    Keychain.set("stock", JSON.stringify(formatted_for_widget));
    return { fresh: true, data: formatted_for_widget };
  } catch (e) {
    console.log("Stock error");
    console.log(e);
    const cached_stock = Keychain.get("stock");
    return { fresh: false, data: JSON.parse(cached_stock) };
  }
}

// Creates the widget
async function createWidget(api) {
  let upticker = SFSymbol.named("chevron.up");
  let downticker = SFSymbol.named("chevron.down");
  let notFresh = SFSymbol.named("circle.fill");
  let notFreshIcon = notFresh.image;

  let widget = new ListWidget();

  // Add background gradient
  let gradient = new LinearGradient();
  gradient.locations = [0, 1];
  gradient.colors = [new Color("141414"), new Color("13233F")];
  widget.backgroundGradient = gradient;

  for (j = 0; j < assets.length; j++) {
    let currentStock = assets[j];
    let row1 = widget.addStack();

    // Add stock symbol
    let stockSymbol = row1.addText(currentStock.symbol);
    stockSymbol.textColor = Color.white();
    stockSymbol.font = Font.boldMonospacedSystemFont(11);

    // Add current price
    row1.addSpacer();
    let symbolPrice = row1.addText(currentStock.price);
    symbolPrice.textColor = Color.white();
    symbolPrice.font = Font.boldMonospacedSystemFont(11);

    // Second Row
    widget.addSpacer(1);
    let row2 = widget.addStack();

    // // Add company name
    // let companyName = row2.addText(currentStock.name);
    // companyName.textColor = Color.white();
    // companyName.textOpacity = 0.7;
    // companyName.font = Font.boldMonospacedSystemFont(9);

    if ((currentStock.type = "crypto" && !freshCrypto)) {
      notFreshIcon = row2.addImage(notFresh.image);
      notFreshIcon.tintColor = Color.gray();
      notFreshIcon.imageSize = new Size(5, 5);
    }

    if ((currentStock.type = "stock" && !freshStock)) {
      notFreshIcon = row2.addImage(notFresh.image);
      notFreshIcon.tintColor = Color.gray();
      notFreshIcon.imageSize = new Size(5, 5);
    }

    // Add today's change in price
    row2.addSpacer();
    let changeValue = row2.addText(
      `${currentStock.changeValue}, ${currentStock.changePercent}%`
    );
    if (currentStock.changeValue < 0) {
      changeValue.textColor = Color.red();
    } else {
      changeValue.textColor = Color.green();
    }
    changeValue.font = Font.boldMonospacedSystemFont(8);

    // Add ticker icon
    row2.addSpacer(2);
    let ticker = null;
    if (currentStock.changeValue < 0) {
      ticker = row2.addImage(downticker.image);
      ticker.tintColor = Color.red();
    } else {
      ticker = row2.addImage(upticker.image);
      ticker.tintColor = Color.green();
    }
    ticker.imageSize = new Size(9, 9);

    // Add some space
    if (j !== assets.length - 1) {
      widget.addSpacer(4);
    }
  }

  return widget;
}
