
$(()=>{
  // getLocalStorage
  var isDayTrading = localStorage.getItem("stock-isDayTrading", isDayTrading);
  var discount = localStorage.getItem("stock-discount", discount);
  var isETF = localStorage.getItem("stock-isETF", isETF);

  // set value
  $("#dayTrading").prop("checked", isDayTrading == "true");
  $("#ETF").prop("checked", isETF == "true");
  $("#discount").val(discount == null ? 0.6 : discount);
})

// click 按鈕 買入或賣出的 + - 按鈕
// 參數 behavior : 買入或賣出 ("buy" or "sell")
// 參數 target : 成交或張數 ("price" or "number")
// 參數 operation : + 或 -
function clickButton(behavior, target, operation) {
  // 取得 input 數字
  var el = $(`.${behavior} .${target} input`);
  var value = el.val().trim() * 1;

  // 取得級距單位
  var tick = 1;
  if (target == "price") {
    if (value < 10) {
      tick = 0.01;
    } else if (value < 50) {
      tick = 0.05;
    } else if (value < 100) {
      tick = 0.1;
    } else if (value < 500) {
      tick = 0.5;
    } else if (value < 1000) {
      tick = 1;
    } else {
      tick = 5;
    }
  }

  // 加減數字
  value = value + (operation == "+" ? tick : -tick);
  el.val(value.toFixed(2) * 1);

  // 計算結果
  if (target == "number") {
    changeNum(behavior);
  } else {
    calculateResult(behavior);
  }

}

// change 交易張數
// 參數 behavior : 買入或賣出 ("buy" or "sell")
function changeNum(behavior) {
  // 同步買賣數量
  var value = $(`.${behavior} .number input`).val();
  var another = behavior == "buy" ? "sell" : "buy";
  $(`.${another} .number input`).val(value);
  // 計算結果
  calculateResult();
}

// 計算結果
function calculateResult(from = "null") {

  // if buy changed, change sell
  if(from == "buy"){
    $(".sell .price input").val($(".buy .price input").val().trim());
  }

  // get value
  var discount = $("#discount").val().trim();
  var buyPrice = $(".buy .price input").val().trim();
  var buyNumber = $(".buy .number input").val().trim();
  var sellPrice = $(".sell .price input").val().trim();
  var sellNumber = $(".sell .number input").val().trim();
  var isETF = $("#ETF").prop("checked");
  var isDayTrading = $("#dayTrading").prop("checked");

  // save localStorage
  localStorage.setItem("stock-isDayTrading", isDayTrading);
  localStorage.setItem("stock-discount", discount);
  localStorage.setItem("stock-isETF", isETF);

  // validation
  if ((discount == "") | (buyPrice == "") | (buyNumber == "") | (sellPrice == "") | (sellNumber == ""))
    return null;

  // parse to number
  discount = (discount * 1).toFixed(2) * 1;
  buyPrice = (buyPrice * 1).toFixed(2) * 1;
  buyNumber = buyNumber * 1;
  sellPrice = (sellPrice * 1).toFixed(2) * 1;
  sellNumber = sellNumber * 1;

  // calculate all result
  var buyFee = Math.round(Math.max(buyPrice * buyNumber * 0.001425 * discount * 1000, 20));
  var buyTotal = Math.round(buyPrice * buyNumber * 1000 + buyFee);
  var sellFee = Math.round(Math.max(sellPrice * sellNumber * 0.001425 * discount * 1000, 20));
  var sellTax = Math.round(sellPrice * sellNumber * 1000 * (isETF ? 0.1 : isDayTrading ? 0.15 : 0.3) / 100);
  var sellTotal = Math.round(sellPrice * sellNumber * 1000 - sellFee - sellTax);
  var balance = sellTotal - buyTotal;
  var balanceRate = (balance / buyTotal * 100).toFixed(2);

  // format result
  buyFee = new Intl.NumberFormat().format(buyFee);
  buyTotal = new Intl.NumberFormat().format(buyTotal);
  sellFee = new Intl.NumberFormat().format(sellFee);
  sellTax = new Intl.NumberFormat().format(sellTax);
  sellTotal = new Intl.NumberFormat().format(sellTotal);
  balance = new Intl.NumberFormat().format(balance);

  // set to web
  $(".buy .fee .output").text(buyFee);
  $(".buy .total .output").text(buyTotal);
  $(".sell .fee .output").text(sellFee);
  $(".sell .tax .output").text(sellTax);
  $(".sell .total .output").text(sellTotal);
  $(".balance").text(balance);
  $(".balanceRate").text(balanceRate);
}

function changeBuyPrice(){
  // alert(123)
}

function fixNum(num) {
  return (num * 1).toFixed(2) * 1;
}
