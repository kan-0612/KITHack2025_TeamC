function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('Gohan App');
}

// スプレッドシート照合
function getRecommendation(userData) {
  const sheet = SpreadsheetApp.openById("15w20MbPTgnArMF16prwrAPxvQ0RTiX87YSnLmBRftQg").getSheetByName("shops");
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();

  const today = new Date();
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const formattedDate = Utilities.formatDate(today, "Asia/Tokyo", "yyyy/MM/dd");
  const dayOfWeek = days[today.getDay()];

  const filtered = data.filter(row => {
    const rowData = {};
    headers.forEach((h,i) => rowData[h] = row[i]);

    //予算配列化
    let budget = rowData.budget ? rowData.budget.toString().split(/[,、]/).map(g => g.trim()) : [];
    // ジャンル配列化
    let genres = rowData.genre ? rowData.genre.toString().split(/[,、]/).map(g => g.trim()) : [];
    // 人数配列化
    let people = rowData.people ? rowData.people.toString().split(/[,、]/).map(p => p.trim()) : [];
    //テイクアウト配列化
    let takeout = rowData.takeout ? rowData.takeout.toString().split(/[,、]/).map(p => p.trim()) : [];


    return (
      budget.includes(userData.budget) &&
      rowData.place === userData.place &&
      people.includes(userData.people) &&
      genres.includes(userData.genre) &&
      takeout.includes(userData.takeout)
    );
  });

  if (filtered.length === 0) {
    return "条件に合うお店はありません😢";
  }

  // 店名 + URL をリンク化
  const shopList = filtered.map(r => {
  const name = r[0];       // 店名（1列目）
  const url  = r[10];      // URL（11列目）
  const closedDay = r[7];  // 定休日（8列目）
  const hours = r[6];      // 営業時間（7列目）
  
  // 曜日判定
  const closedDays = closedDay ? closedDay.split(/[,、]/).map(d => d.trim()) : [];
  let status = "✅ 本日営業中"; // デフォルト
  if (closedDays.includes(dayOfWeek)) {
  status = "❌ 本日定休日";
} else if (hours) {
  try {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    // カンマ or 読点で複数時間帯を分割
    const timeRanges = hours.split(/[,、]/).map(t => t.trim());

    let openNow = false;
    for (let range of timeRanges) {
      if (range.includes("-")) {
        const [startStr, endStr] = range.split("-");
        if (startStr && endStr) {
          const [startH, startM] = startStr.split(":").map(Number);
          const [endH, endM] = endStr.split(":").map(Number);

          const startMinutes = startH * 60 + (startM || 0);
          const endMinutes   = endH * 60 + (endM || 0);

          if (nowMinutes >= startMinutes && nowMinutes <= endMinutes) {
            openNow = true;
            break; // どれか1つでも営業時間内なら営業中
          }
        }
      }
    }

    if (!openNow) {
      status = "⏰ 本日は営業時間外";
    }
  } catch (e) {
    status = "⚠️ 営業時間データ不正";
  }
}

//shop-card
  return `
    <div class="shop-card">
      <a href="${url}" target="_blank">${name}</a>
      <p>${status}</p>
      <p>営業時間: ${hours}</p>
      <p>定休日: ${closedDay}</p>
    </div>
  `;

});

return `
  <h2>あなたへのおすすめはこちらです🍴</h2>
  ${shopList.join("")}
`;
}
