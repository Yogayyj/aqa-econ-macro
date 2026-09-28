(function (root) {
  "use strict";

  function cleanJava(code) {
    return String(code || "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "")
      .replace(/\s+/g, " ");
  }

  function itemPattern(variable, brand, type, price) {
    return new RegExp(
      "FashionItem\\s+" + variable + "\\s*=\\s*new\\s+FashionItem\\s*\\(\\s*['\"]" + brand +
      "['\"]\\s*,\\s*['\"]" + type + "['\"]\\s*,\\s*" + price + "(?:\\.0+)?\\s*\\)\\s*;"
    );
  }

  function result(label, pass, help) { return { label: label, pass: pass, help: help || "" }; }

  const challenges = {
    1: function (source) {
      const code = cleanJava(source);
      const declaration = /FashionItem\s+hairClip\s*=/.test(code);
      const constructor = /hairClip\s*=\s*new\s+FashionItem\s*\(/.test(code);
      const correct = itemPattern("hairClip", "Miu Miu", "Hair Clip", "450").test(code);
      return [
        result("FashionItem object created", /new\s+FashionItem\s*\(/.test(code), "Use the new keyword with FashionItem(...)."),
        result("Variable name is hairClip", declaration, "Declare it as FashionItem hairClip."),
        result("Correct constructor", constructor, "Assign new FashionItem(...) to hairClip."),
        result("Correct arguments: “Miu Miu”, “Hair Clip”, 450", correct, "Pass the brand, type, and price in that order.")
      ];
    },
    2: function (source) {
      const code = cleanJava(source);
      const ribbonExists = /FashionItem\s+ribbon\s*=\s*new\s+FashionItem\s*\(/.test(code);
      const earringExists = /FashionItem\s+earring\s*=\s*new\s+FashionItem\s*\(/.test(code);
      return [
        result("ribbon object created", ribbonExists, "Declare a FashionItem named ribbon."),
        result("ribbon uses arguments “LV”, “Ribbon”, 200", itemPattern("ribbon", "LV", "Ribbon", "200").test(code), "Check the three ribbon constructor arguments and their order."),
        result("earring object created", earringExists, "Declare a FashionItem named earring."),
        result("earring uses arguments “LV”, “Earring”, 600", itemPattern("earring", "LV", "Earring", "600").test(code), "Check the three earring constructor arguments and their order.")
      ];
    },
    3: function (source) {
      const code = cleanJava(source);
      return [result("Instance method called on hairClip", /hairClip\s*\.\s*showInfo\s*\(\s*\)\s*;/.test(code), "Call showInfo() using the hairClip object: object.method().")];
    },
    4: function (source) {
      const code = cleanJava(source);
      return [
        result("Uses Calculator.add() with both object prices", /Calculator\s*\.\s*add\s*\(\s*hairClip\s*\.\s*getPrice\s*\(\s*\)\s*,\s*earring\s*\.\s*getPrice\s*\(\s*\)\s*\)/.test(code), "Pass hairClip.getPrice() and earring.getPrice() to the static add method."),
        result("Uses hairClip.getPrice()", /hairClip\s*\.\s*getPrice\s*\(\s*\)/.test(code), "Get the first price from the hairClip object."),
        result("Uses earring.getPrice()", /earring\s*\.\s*getPrice\s*\(\s*\)/.test(code), "Get the second price from the earring object."),
        result("Stores the Calculator.add() result", /double\s+[A-Za-z_$][\w$]*\s*=\s*Calculator\s*\.\s*add\s*\(/.test(code), "Store the returned value in a double variable."),
        result("Prints the stored total", /System\s*\.\s*out\s*\.\s*println\s*\(\s*['\"]Total:\s*\$['\"]\s*\+\s*[A-Za-z_$][\w$]*\s*\)\s*;/.test(code), "Print “Total: $” followed by your total variable.")
      ];
    }
  };

  function check(challenge, code) {
    const items = challenges[challenge](code);
    return { passed: items.every(function (item) { return item.pass; }), items: items };
  }

  const api = { check: check, cleanJava: cleanJava };
  root.FashionLabChecks = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
