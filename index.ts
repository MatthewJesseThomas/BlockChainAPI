import * as crypto from "crypto";
const knex = require("./db/knex");

// Represents a transaction in the blockchain
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

// Represents a block in the blockchain
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

// Represents the entire blockchain
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

  // Mines a new block and adds it to the blockchain
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

  // Finds a valid solution for mining
  private async findSolution(nonce: number): Promise<number | null> {
    const maxIterations = 1000000;

    for (let currentIteration = 1; currentIteration <= maxIterations; currentIteration++) {
      const hash = crypto.createHash("MD5");
      hash.update((nonce + currentIteration).toString()).end();

      const attempt = hash.digest("hex");

      if (attempt.slice(0, 4) === "000") {
        return currentIteration;
      }
    }

    return null;
  }

  // Adds a new block to the blockchain after verifying the transaction
  async addBlock(
    transaction: Transaction,
    senderPublicKey: string,
    signature: Buffer
  ) {
    const isAuthenticated = this.verifyTransaction(transaction, senderPublicKey, signature);

    if (isAuthenticated) {
      const newBlock = new Block(this.lastBlock.hash, transaction);
      const solution = await this.mine(newBlock.nonce);

      if (solution) {
        this.chain.push(newBlock);
      } else {
        console.log("Block not added: No valid solution found for mining.");
      }
    } else {
      console.log("Block not added: Transaction authentication failed.");
    }
  }

  // Verifies the authenticity of a transaction using public key and signature
  private verifyTransaction(
    transaction: Transaction,
    senderPublicKey: string,
    signature: Buffer
  ): boolean {
    const authentication = crypto.createVerify("SHA256");
    authentication.update(transaction.toString());
    return authentication.verify(senderPublicKey, signature);
  }
}

// Represents a wallet in the blockchain system
class Wallet {
  public publicKey: string;
  public privateKey: string;

  constructor() {
    const keyPair = crypto.generateKeyPairSync("rsa", {
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
    this.privateKey = keyPair.privateKey;
    this.publicKey = keyPair.publicKey;
  }

  // Logs the current amount from the database
  async logCurrentAmount() {
    try {
      const db = await knex("transactions");
      console.log(db);
      console.log("Current amount logged in the database.");
    } catch (error) {
      console.error("Error logging the current amount:", error);
    }
  }

  // Sends money from this wallet to another wallet
  async sendMoney(amount: number, payeePublicKey: string) {
    const transaction = new Transaction(amount, this.publicKey, payeePublicKey);

    const sign = crypto.createSign("SHA256");
    sign.update(transaction.toString()).end();

    const privateKeyBuffer = Buffer.from(this.privateKey, "utf8");

    const signature = sign.sign(privateKeyBuffer);
    console.log(signature.toString("base64"));

    await Chain.instance.addBlock(transaction, this.publicKey, signature);

    await this.insertTransaction(this.publicKey, payeePublicKey, amount);
  }

  // Inserts a transaction into the database
  private async insertTransaction(sender: string, receiver: string, amount: number) {
    try {
      const timestamped = new Date();
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
}

// Example Usage
const matthew = new Wallet();
const jake = new Wallet();

// Log the current amount for both wallets
matthew.logCurrentAmount();
jake.logCurrentAmount();

// Transfer money between wallets and mine new blocks
matthew.sendMoney(350, jake.publicKey);
jake.sendMoney(200, matthew.publicKey);

// Display the final state of the blockchain
console.log(Chain.instance);
