const assert = require("node:assert/strict");
const test = require("node:test");
const checks = require("../assets/checks.js");

const complete = `public class Main { public static void main(String[] args) {
  FashionItem hairClip = new FashionItem("Miu Miu", "Hair Clip", 450);
  FashionItem ribbon = new FashionItem("LV", "Ribbon", 200);
  FashionItem earring = new FashionItem("LV", "Earring", 600);
  hairClip.showInfo();
  double total = Calculator.add(hairClip.getPrice(), earring.getPrice());
  System.out.println("Total: $" + total);
}}`;

test("complete cumulative Main.java passes every challenge", () => {
  for (let challenge = 1; challenge <= 4; challenge += 1) assert.equal(checks.check(challenge, complete).passed, true);
});
test("hard-coded arithmetic does not pass the static-method challenge", () => {
  const result = checks.check(4, `double total = 450 + 600; System.out.println("Total: $" + total);`);
  assert.equal(result.passed, false);
  assert.equal(result.items[0].pass, false);
});
test("getPrice calls outside Calculator.add do not satisfy the challenge", () => {
  const result = checks.check(4, `
    double a = hairClip.getPrice();
    double b = earring.getPrice();
    double total = Calculator.add(450, 600);
    System.out.println("Total: $" + total);`);
  assert.equal(result.passed, false);
  assert.equal(result.items[0].pass, false);
});
test("comments cannot satisfy a challenge", () => {
  assert.equal(checks.check(3, `// hairClip.showInfo();`).passed, false);
});
test("whitespace and decimal prices are accepted", () => {
  assert.equal(checks.check(1, `FashionItem hairClip = new FashionItem ( "Miu Miu" , "Hair Clip", 450.0 );`).passed, true);
});
