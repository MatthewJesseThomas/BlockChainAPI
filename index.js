"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = __importStar(require("crypto"));
class Transaction {
    constructor(amount, payer, payee) {
        this.amount = amount;
        this.payer = payer;
        this.payee = payee;
    }
    toString() {
        return JSON.stringify(this);
    }
}
class Block {
    constructor(prevHash, transaction, ts = Date.now().toString()) {
        this.prevHash = prevHash;
        this.transaction = transaction;
        this.ts = ts;
        this.nonce = Math.round(Math.random() * 999999999);
    }
    get hash() {
        const str = JSON.stringify(this);
        const hash = crypto.createHash("SHA256");
        hash.update(str).end();
        return hash.digest("hex");
    }
}
class Chain {
    constructor() {
        this.chain = [
            new Block(null, new Transaction(100, "GenesisBlock", "JTCrypto")),
        ];
    }
    get lastBlock() {
        return this.chain[this.chain.length - 1];
    }
    async mine(nonce) {
        console.log("⛏️  mining block...");
        const solution = await this.findSolution(nonce);
        if (solution) {
            console.log(`Solved: ${solution}`);
            return solution;
        }
        else {
            console.log("Mining stopped: No solution found.");
        }
    }
    findSolution(nonce) {
        return new Promise((resolve) => {
            const maxIterations = 1000000;
            let currentIteration = 1;
            const mineBlock = () => {
                const hash = crypto.createHash("MD5");
                hash.update((nonce + currentIteration).toString()).end();
                const attempt = hash.digest("hex");
                if (attempt.slice(0, 4) === "000") {
                    resolve(currentIteration);
                }
                else if (currentIteration >= maxIterations) {
                    resolve(null);
                }
                else {
                    currentIteration++;
                    setImmediate(mineBlock); // Asynchronous, non-blocking processing
                }
            };
            mineBlock();
        });
    }
    addBlock(transaction, senderPublicKey, signature) {
        const authentication = crypto.createVerify("SHA256");
        authentication.update(transaction.toString());
        const isAuthenticated = authentication.verify(senderPublicKey, signature);
        if (isAuthenticated) {
            const newBlock = new Block(this.lastBlock.hash, transaction);
            this.mine(newBlock.nonce).then((solution) => {
                if (solution) {
                    this.chain.push(newBlock);
                }
                else {
                    console.log("Block not added: No valid solution found for mining.");
                }
            });
        }
        else {
            console.log("Block not added: Transaction authentication failed.");
        }
    }
}
Chain.instance = new Chain();
class Wallet {
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
    sendMoney(amount, payeePublicKey) {
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
const nikita = new Wallet();
const savs = new Wallet();
const john = new Wallet();
const beyonce = new Wallet();
const wiseman = new Wallet();
const seth = new Wallet();
matthew.sendMoney(350, matthew.publicKey);
jake.sendMoney(200, jake.publicKey);
console.log(Chain.instance);
