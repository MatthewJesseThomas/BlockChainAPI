import * as crypto from "crypto";
const knex = require("./db/knex");

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

  async logCurrentAmount() {
    try {
      const db = await knex("transactions");
      console.log(db);
      // const [rows] = await conDB.execute(
      //   "INSERT INTO Crypto (public_key, amount) VALUES (?, ?) ON DUPLICATE KEY UPDATE amount = amount",
      //   [this.publicKey, 0] // Set the initial amount to 0, this will be updated later
      // );
      console.log("Current amount logged in the database.");
    } catch (error) {
      console.error("Error logging the current amount:", error);
    }
  }

  async sendMoney(amount: number, payeePublicKey: string) {
    const transaction = new Transaction(amount, this.publicKey, payeePublicKey);

    const sign = crypto.createSign("SHA256");
    sign.update(transaction.toString()).end();

    const privateKeyBuffer = Buffer.from(this.privateKey, "utf8");

    const signature = sign.sign(privateKeyBuffer);
    console.log(signature.toString("base64"));
    Chain.instance.addBlock(transaction, this.publicKey, signature);

// sourcery skip: avoid-function-declarations-in-blocks
    async function insertTransaction(sender: string, receiver: string, amount: number) {
      try {
        const timestamped = new Date();

        // Using Knex.js to perform the SQL insert
        await knex("transactions").insert({
          sender: sender,
          receiver: receiver,
          amount: amount,
          timestamped: timestamped,
        });

        console.log("Transaction logged in the database.");
      } catch (error) {
        console.error("Error logging the transaction:", error);
      }
    }

    // Example Usage
    const matthew = new Wallet();
    const jake = new Wallet();

    // Log the current amount for both wallets
    matthew.logCurrentAmount();
    // jake.logCurrentAmount();

    // matthew.sendMoney(350, jake.publicKey);
    // jake.sendMoney(200, matthew.publicKey);
    const receiver = matthew.publicKey;
    const sender = jake.publicKey;
    amount = 500;

    insertTransaction(sender, receiver, amount);



  }
}
console.log(Chain.instance);
