// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

//Generated a new Key Pair to extract Secret Key

/*
const newPair = Keypair.generate();
console.log(newPair);*/


//Replaced Secret Key from demo video with the Secret Key from the newly generated Key Pair
const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
        89, 150,  29, 179,  52, 237, 161, 247,  66, 239, 175,
        89,  64,  25, 160, 224, 192,  50,  27,  21,  27,  65,
        87,  12,  31, 101, 168,  58,  93,   7, 175, 106,  91,
       133, 195, 171, 203,  15, 154, 123, 171, 136,  68,  25,
       220, 191,  85,  70, 185, 213, 179, 106,  34, 233, 154,
        70,  66, 161,  55, 189,  77, 219,  94, 190
      ]
      
      /*[
        160,  20, 189, 212, 129, 188, 171, 124,  20, 179,  80,
         27, 166,  17, 179, 198, 234,  36, 113,  87,   0,  46,
        186, 250, 152, 137, 244,  15,  86, 127,  77,  97, 170,
         44,  57, 126, 115, 253,  11,  60,  90,  36, 135, 177,
        185, 231,  46, 155,  62, 164, 128, 225, 101,  79,  69,
        101, 154,  24,  58, 214, 219, 238, 149,  86
      ]*/
);

const transferSol = async() => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get Keypair from Secret Key
    var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

    // Other things to try: 
    // 1) Form array from userSecretKey
    // const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
    // 2) Make a new Keypair (starts with 0 SOL)
    // const from = Keypair.generate();

    // Generate another Keypair (account we'll be sending to)
    const to = Keypair.generate();

    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping 2 SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");

    // Display the new balance after airdrop
    await getSenderWalletBalance();

    // Get wallet balance(in SOL) and store in variable
    const fromBalance = await connection.getBalance(
        new PublicKey(from.publicKey)
    ) / LAMPORTS_PER_SOL;

    // Determine the half of the balance
    const halfBalance = parseFloat(fromBalance)/ 2;

    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: halfBalance * LAMPORTS_PER_SOL
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('Signature is ', signature);
    
    // Display the details of the transaction
    console.log(halfBalance, 'SOL transferred from Sender Wallet to Receiver Wallet!');
}

const getSenderWalletBalance = async () => {
    try {
        // Connect to the Devnet
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        console.log("Connection object is:", connection);

        // Make a wallet (keypair) from privateKey of the Sender Wallet and get its balance
        const fromWallet = await Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);
        const walletBalance = await connection.getBalance(
            new PublicKey(fromWallet.publicKey)
        );
        console.log(`Sender Wallet balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`);
    } catch (err) {
        console.log(err);
    }
};

const mainFunction = async () => {
    await getSenderWalletBalance();
    await transferSol();
    await getSenderWalletBalance();
}

mainFunction();