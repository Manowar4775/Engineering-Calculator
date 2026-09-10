// A small, dependency-free expression evaluator.
//
// We deliberately do NOT use eval()/Function() on user input. This is a
// straightforward recursive-descent parser supporting:
//   + - * / ^ (power) % (postfix "divide by 100") ! (postfix factorial)
//   parentheses, unary +/-, decimals, and named functions like sin(...).
//
// Grammar (highest precedence last):
//   expression := term (('+' | '-') term)*
//   term       := unary (('*' | '/') unary)*
//   unary      := ('-' | '+') unary | power
//   power      := postfix ('^' unary)?              (right-associative)
//   postfix    := primary ('!' | '%')*
//   primary    := NUMBER | IDENT '(' expression (',' expression)* ')' | IDENT | '(' expression ')'

export class ExprError extends Error {}

const CONSTANTS = { pi: Math.PI, e: Math.E };

export function evaluateExpression(input, { angleMode = "deg", functions = {} } = {}) {
  const tokens = tokenize(input);
  if (tokens.length === 0) throw new ExprError("Empty expression");
  const parser = new Parser(tokens, angleMode, functions);
  const value = parser.parseExpression();
  parser.expectEnd();
  if (!Number.isFinite(value)) throw new ExprError("Result is undefined");
  return value;
}

function tokenize(input) {
  const tokens = [];
  let i = 0;
  const s = input.replace(/\s+/g, "");
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) {
      let j = i + 1;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const numStr = s.slice(i, j);
      if ((numStr.match(/\./g) || []).length > 1) throw new ExprError("Invalid number");
      tokens.push({ type: "num", value: parseFloat(numStr) });
      i = j;
    } else if (/[a-zA-Z]/.test(c)) {
      let j = i + 1;
      while (j < s.length && /[a-zA-Z0-9]/.test(s[j])) j++;
      tokens.push({ type: "ident", value: s.slice(i, j) });
      i = j;
    } else if ("+-*/^()!%,".includes(c)) {
      tokens.push({ type: "op", value: c });
      i++;
    } else {
      throw new ExprError(`Unexpected character "${c}"`);
    }
  }
  return tokens;
}

class Parser {
  constructor(tokens, angleMode, functions) {
    this.tokens = tokens;
    this.pos = 0;
    this.angleMode = angleMode;
    this.functions = functions;
  }

  peek() { return this.tokens[this.pos]; }
  next() { return this.tokens[this.pos++]; }
  isOp(val) { const t = this.peek(); return t && t.type === "op" && t.value === val; }

  expectEnd() {
    if (this.pos < this.tokens.length) throw new ExprError("Unexpected trailing input");
  }

  parseExpression() {
    let value = this.parseTerm();
    while (this.isOp("+") || this.isOp("-")) {
      const op = this.next().value;
      const rhs = this.parseTerm();
      value = op === "+" ? value + rhs : value - rhs;
    }
    return value;
  }

  parseTerm() {
    let value = this.parseUnary();
    while (this.isOp("*") || this.isOp("/")) {
      const op = this.next().value;
      const rhs = this.parseUnary();
      if (op === "/") {
        if (rhs === 0) throw new ExprError("Division by zero");
        value = value / rhs;
      } else {
        value = value * rhs;
      }
    }
    return value;
  }

  parseUnary() {
    if (this.isOp("-")) { this.next(); return -this.parseUnary(); }
    if (this.isOp("+")) { this.next(); return this.parseUnary(); }
    return this.parsePower();
  }

  parsePower() {
    const base = this.parsePostfix();
    if (this.isOp("^")) {
      this.next();
      const exp = this.parseUnary(); // right-associative
      return Math.pow(base, exp);
    }
    return base;
  }

  parsePostfix() {
    let value = this.parsePrimary();
    for (;;) {
      if (this.isOp("!")) {
        this.next();
        value = factorial(value);
      } else if (this.isOp("%")) {
        this.next();
        value = value / 100;
      } else {
        break;
      }
    }
    return value;
  }

  parsePrimary() {
    const t = this.peek();
    if (!t) throw new ExprError("Unexpected end of expression");

    if (t.type === "num") { this.next(); return t.value; }

    if (t.type === "op" && t.value === "(") {
      this.next();
      const value = this.parseExpression();
      if (!this.isOp(")")) throw new ExprError("Missing closing parenthesis");
      this.next();
      return value;
    }

    if (t.type === "ident") {
      this.next();
      const name = t.value.toLowerCase();

      if (this.isOp("(")) {
        this.next();
        const args = [this.parseExpression()];
        while (this.isOp(",")) { this.next(); args.push(this.parseExpression()); }
        if (!this.isOp(")")) throw new ExprError("Missing closing parenthesis");
        this.next();
        return this.callFunction(name, args);
      }

      if (name in CONSTANTS) return CONSTANTS[name];
      // Bare function name with no parens (e.g. "pi") already handled above;
      // anything else unresolved is an error.
      throw new ExprError(`Unknown identifier "${name}"`);
    }

    throw new ExprError("Unexpected token");
  }

  callFunction(name, args) {
    const x = args[0];
    const toRad = (v) => (this.angleMode === "deg" ? (v * Math.PI) / 180 : v);
    const fromRad = (v) => (this.angleMode === "deg" ? (v * 180) / Math.PI : v);

    switch (name) {
      case "sin": return Math.sin(toRad(x));
      case "cos": return Math.cos(toRad(x));
      case "tan": return Math.tan(toRad(x));
      case "asin": return fromRad(Math.asin(x));
      case "acos": return fromRad(Math.acos(x));
      case "atan": return fromRad(Math.atan(x));
      case "log": return Math.log10(x);
      case "ln": return Math.log(x);
      case "sqrt": if (x < 0) throw new ExprError("Square root of a negative number"); return Math.sqrt(x);
      case "cbrt": return Math.cbrt(x);
      case "exp": return Math.exp(x);
      case "abs": return Math.abs(x);
      case "pow": return Math.pow(x, args[1]);
      default: {
        if (this.functions[name]) return this.functions[name](...args);
        throw new ExprError(`Unknown function "${name}"`);
      }
    }
  }
}

function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) throw new ExprError("Factorial needs a non-negative integer");
  if (n > 170) throw new ExprError("Factorial overflow");
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}
