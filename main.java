function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index');
}

// スプレッドシートから条件に合うお店を返す
function getShops(answers){
  const sheet = SpreadsheetApp.openById("15w20MbPTgnArMF16prwrAPxvQ0RTiX87YSnLmBRftQg").getSheetByName("shops");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const shops = data.slice(1).map(row => {
    let obj = {};
    headers.forEach((h,i) => obj[h] = row[i]);
    return obj;
  });

  const filtered = shops.filter(shop => 
    shop.budget === answers.budget &&
    shop.place === answers.place &&
    shop.people === answers.people &&
    shop.genre === answers.genre &&
    shop.takeout === answers.takeout
  );

  return filtered; // 条件に合うお店の配列を返す
}
