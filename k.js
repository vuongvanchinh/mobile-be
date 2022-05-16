const vectis = 10;
const stopLoss = 5.86;
const takeProfit = 14.82;
const totalisCapitis = 100;
const stopLossPercent = 2;

let amount = (totalisCapitis * (stopLossPercent/100)) / (stopLoss/100)

console.log("RR: ", takeProfit/stopLoss)
const loss = stopLossPercent / 100 * totalisCapitis;

console.log("Khối lượng vào lệnh: ", amount)
console.log(`Nếu dùng đòn bẩy x${vectis}: `, amount/vectis)
console.log(`Lỗ có thể: `, loss)
console.log(`Lãi có thể `, loss * takeProfit / stopLoss)