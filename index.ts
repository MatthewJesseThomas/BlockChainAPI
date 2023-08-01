import * as crypto from "crypto";

class Transaction {
  constructor(
    public amount: number,
    public payer: string,
    public payee: string
  ) {}

  toString() {
    return JSON.stringify(this);
  }
}

class Block {
  public nonce = Math.round(Math.random() * 999999999);

  constructor(
    public prevHash: string | null,
    public transaction: Transaction,
    public ts: string = Date.now().toString()
  ) {}

  get hash() {
    const str = JSON.stringify(this);
    const hash = crypto.createHash("SHA256");
    hash.update(str).end();
    return hash.digest("hex");
  }
}

class Chain {
  public static instance = new Chain();

  chain: Block[];

  constructor() {
    this.chain = [
      new Block(null, new Transaction(100, "GenesisBlock", "JTCrypto")),
    ];
  }

  get lastBlock() {
    return this.chain[this.chain.length - 1];
  }

  async mine(nonce: number) {
    console.log("⛏️  mining block...");
    const solution = await this.findSolution(nonce);
    if (solution) {
      console.log(`Solved: ${solution}`);
      return solution;
    } else {
      console.log("Mining stopped: No solution found.");
    }
  }

  private findSolution(nonce: number): Promise<number | null> {
    return new Promise((resolve) => {
      const maxIterations = 1000000;
      let currentIteration = 1;

      const mineBlock = () => {
        const hash = crypto.createHash("MD5");
        hash.update((nonce + currentIteration).toString()).end();

        const attempt = hash.digest("hex");

        if (attempt.slice(0, 4) === "000") {
          resolve(currentIteration);
        } else if (currentIteration >= maxIterations) {
          resolve(null);
        } else {
          currentIteration++;
          setImmediate(mineBlock); // Asynchronous, non-blocking processing
        }
      };

      mineBlock();
    });
  }

  addBlock(
    transaction: Transaction,
    senderPublicKey: string,
    signature: Buffer
  ) {
    const authentication = crypto.createVerify("SHA256");
    authentication.update(transaction.toString());

    const isAuthenticated = authentication.verify(senderPublicKey, signature);

    if (isAuthenticated) {
      const newBlock = new Block(this.lastBlock.hash, transaction);
      this.mine(newBlock.nonce).then((solution) => {
        if (solution) {
          this.chain.push(newBlock);
        } else {
          console.log("Block not added: No valid solution found for mining.");
        }
      });
    } else {
      console.log("Block not added: Transaction authentication failed.");
    }
  }
}

class Wallet {
  public publicKey: string;
  public privateKey: string;

  constructor() {
    const key_pair = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });
    this.privateKey = key_pair.privateKey;
    this.publicKey = key_pair.publicKey;
  }

  sendMoney(amount: number, payeePublicKey: string) {
    const transaction = new Transaction(amount, this.publicKey, payeePublicKey);

    const sign = crypto.createSign("SHA256");
    sign.update(transaction.toString()).end();

    const privateKeyBuffer = Buffer.from(this.privateKey, "utf8");

    const signature = sign.sign(privateKeyBuffer);
    console.log(signature.toString("base64"));
    Chain.instance.addBlock(transaction, this.publicKey, signature);
  }
}

// Example Usage
const matthew = new Wallet();
const jake = new Wallet();


matthew.sendMoney(350, matthew.publicKey);
jake.sendMoney(200, jake.publicKey);


console.log(Chain.instance);
